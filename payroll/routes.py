from fastapi import APIRouter, Depends, HTTPException  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from database import db_dependency
from .models import SalaryStructure, Payroll
from .schemas import SalaryStructureCreate, SalaryStructureOut, PayrollOut
from datetime import datetime
from .utils import calculate_net_salary, generate_payslip_file
import os
from fastapi.responses import FileResponse  # type: ignore
from notification.routes import send_notification_direct  
import asyncio
from auth_user.models import User
from emply_mng.models import Employee

router = APIRouter(prefix="/payroll", tags=['Payroll'])

@router.post("/salary-structure", response_model=SalaryStructureOut)
def create_structure(data: SalaryStructureCreate, db: db_dependency):
    existing = db.query(SalaryStructure).filter_by(employee_id=data.employee_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="salary str already exist for this employee")
    new_str = SalaryStructure(**data.model_dump())
    db.add(new_str)
    db.commit()
    return new_str

@router.get('/salary-structure/{employee_id}', response_model=SalaryStructureOut)
def get_structure(employee_id: int, db: db_dependency):
    structure = db.query(SalaryStructure).filter_by(employee_id=employee_id).first()
    if not structure:
        raise HTTPException(status_code=404, detail="salary str not found")
    return structure

@router.post("/generate")
def generate_payroll(db: db_dependency):
    now = datetime.now()
    month = now.strftime("%B")
    year = now.year

    structures = db.query(SalaryStructure).all()
    if not structures:
        raise HTTPException(status_code=404, detail="No salary structures found")

    count = 0
    for structure in structures:
        exists = db.query(Payroll).filter_by(
            employee_id=structure.employee_id, month=month, year=year
        ).first()
        if exists:
            continue

        total_earnings, total_deductions, net_pay = calculate_net_salary(structure)
        payslip_path = generate_payslip_file(
            structure.employee_id, month, year, net_pay
        )

        payroll = Payroll(
            employee_id=structure.employee_id,
            month=month,
            year=year,
            total_earnings=total_earnings,
            total_deductions=total_deductions,
            net_pay=net_pay,
            payslip_path=payslip_path
        )
        db.add(payroll)
        db.commit()
        db.refresh(payroll)

        employee = db.query(Employee).filter_by(id=structure.employee_id).first()
        if employee:
            user = db.query(User).filter_by(email=employee.email).first()
            if user:
                asyncio.run(send_notification_direct(
                    user_id=user.id,
                    title="Salary Generated",
                    message=f"Your salary for {month} {year} has been generated. Net Pay: {net_pay}"
                ))
        count += 1

    return {"msg": f"{count} payrolls generated."}



@router.get("/slips/{employee_id}/{month}")
def download_payslip(employee_id: int, month: str, db: db_dependency):
    month = month.capitalize()

    slip = db.query(Payroll).filter_by(employee_id=employee_id, month=month).first()
    if not slip or not slip.payslip_path or not os.path.exists(slip.payslip_path):
        raise HTTPException(404, detail="payslip not found")
    return FileResponse(
        path=slip.payslip_path,
        media_type='application/pdf',
        filename=os.path.basename(slip.payslip_path)
    )

@router.get("/history/{employee_id}", response_model=list[PayrollOut])
def get_salary_history(employee_id: int, db: db_dependency):
    records = db.query(Payroll).filter_by(employee_id=employee_id).all()
    return records
