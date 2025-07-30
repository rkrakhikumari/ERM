from fastapi import APIRouter, Depends, HTTPException
from emply_mng.models import Employee
from sqlalchemy.orm import Session
from .models import LeaveRequest, LeaveStatus, LeaveType, Holiday
from .schemas import LeaveApply, LeaveApprove, LeaveOut, LeaveStatus, LeaveType, HolidayCreate, HolidayOut
from .utils import get_next_approver
from typing import List
from datetime import date
from auth_user.utils import get_current_user
from database import db_dependency

router = APIRouter(prefix="/leaves", tags=["Leaves"])

@router.post('/apply', response_model=LeaveOut)
def apply_leave(req: LeaveApply, db:db_dependency, user=Depends(get_current_user)):
    employee = db.query(Employee).filter(Employee.email == user.email).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee record not found")
    leave = LeaveRequest(employee_id = employee.id, start_date = req.start_date, end_date=req.end_date, leave_type=req.leave_type, reason=req.reason)
    db.add(leave)
    db.commit()
    return leave

@router.get('/me', response_model=List[LeaveOut])
def my_leaves(db: db_dependency, user=Depends(get_current_user)):
    employee = db.query(Employee).filter(Employee.email == user.email).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee record not found")
    return db.query(LeaveRequest).filter(LeaveRequest.employee_id==employee.id).all()

@router.get('/pending', response_model=list[LeaveOut])
def pending_leaves(db: db_dependency, user= Depends(get_current_user)):
    return db.query(LeaveRequest).filter(LeaveRequest.status=="pending", LeaveRequest.approver_level==user.role).all()


@router.put('/approve/{leave_id}', response_model=LeaveOut)
def approve_leave(leave_id: int, body: LeaveApprove, db: db_dependency, user = Depends(get_current_user)):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="leave not found")

    if leave.approver_level != user.role and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorised")
    
    if body.status == "approved" and user.role != "admin":
        leave.approver_level = get_next_approver(user.role)
    else:
        leave.status = body.status

    db.commit()
    return leave


@router.get('/calendar')
def leave_calendar(db: db_dependency, user=Depends(get_current_user)):
    return db.query(LeaveRequest).filter(LeaveRequest.status=="approved").all()


@router.get('/balance/{employee_id}')
def leave_balance(employee_id: int, db: db_dependency):
    total_leaves = db.query(LeaveRequest).filter(LeaveRequest.employee_id == employee_id, LeaveRequest.status == "approved").count()
    return {"employee_id": employee_id, "leaves_taken": total_leaves, "remainings": 30-total_leaves}
    
@router.post('/holiday', response_model=HolidayOut)
def add_holiday(req: HolidayCreate, db: db_dependency, user= Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="only admin can add holiday")
    holiday = Holiday(**req.model_dump())
    db.add(holiday)
    db.commit()
    return holiday

@router.get('/holiday', response_model=List[HolidayOut])
def list_holidays(db: db_dependency):
    return db.query(Holiday).all()

