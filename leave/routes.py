from fastapi import APIRouter, Depends, HTTPException
from emply_mng.models import Employee
from sqlalchemy.orm import Session
from .models import LeaveRequest, LeaveStatus, LeaveType, Holiday
from .schemas import LeaveApply, LeaveApprove, LeaveOut, LeaveStatus, LeaveType, HolidayCreate, HolidayOut
from .utils import get_next_approver
from typing import List
from datetime import date
from notification.routes import send_notification_direct
import asyncio
from auth_user.models import User
from emply_mng.models import Employee
from auth_user.utils import get_current_user
from database import db_dependency
from admin.crud import create_audit_log

router = APIRouter(prefix="/leaves", tags=["Leaves"])

@router.post('/apply', response_model=LeaveOut)
def apply_leave(req: LeaveApply, db:db_dependency, user=Depends(get_current_user)):
    employee = db.query(Employee).filter(Employee.email == user.email).first()
    if not employee:
        create_audit_log(db, user_id=user.id, action="Failed to apply for leave: Employee record not found.")
        raise HTTPException(status_code=404, detail="Employee record not found")
    if user.role.lower() == "admin":
        leave_status = "approved"
        next_approver_role = None 
    else:
        leave_status = "pending"
        next_approver_role = get_next_approver(user.role)

    leave = LeaveRequest(
        employee_id=employee.id, 
        start_date=req.start_date,
        end_date=req.end_date,
        leave_type=req.leave_type,
        reason=req.reason,
        status=leave_status,
        approver_level=next_approver_role,
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)

    create_audit_log(db, user_id=user.id, action=f"Applied for {req.leave_type} leave from {req.start_date} to {req.end_date}. Status: {leave_status}.")

    return {
        "id": leave.id,
        "employee_id": leave.employee_id,
        "employee_name": employee.name, 
        "start_date": leave.start_date,
        "end_date": leave.end_date,
        "leave_type": leave.leave_type,
        "reason": leave.reason,
        "status": leave.status,
        "approver_level": leave.approver_level
    }

@router.get('/me', response_model=List[LeaveOut])
def my_leaves(db: db_dependency, user=Depends(get_current_user)):
    # Read-only endpoint, no audit log needed.
    employee = db.query(Employee).filter(Employee.email == user.email).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee record not found")

    my_leaves_with_names = db.query(LeaveRequest, Employee.name.label("employee_name")).join(
    Employee, LeaveRequest.employee_id == Employee.id
    ).filter(
        LeaveRequest.employee_id == employee.id
    ).all()

    result_list = []
    for leave_request, employee_name in my_leaves_with_names:
        leave_data = leave_request.__dict__
        leave_data['employee_name'] = employee_name
        result_list.append(leave_data)

    return result_list

@router.get('/pending', response_model=list[LeaveOut])
def pending_leaves(db: db_dependency, user=Depends(get_current_user)):
    create_audit_log(db, user_id=user.id, action=f"Viewed pending leave requests (Role: {user.role}).")
    base_query = db.query(LeaveRequest, Employee.name.label("employee_name")).join(
    Employee, LeaveRequest.employee_id == Employee.id
    )

    if user.role.lower() == "admin":
        pending_requests = base_query.filter(
            LeaveRequest.status == "pending"
    ).all()
    else:
        pending_requests = base_query.filter(
        LeaveRequest.status == "pending",
        LeaveRequest.approver_level == user.role
        ).all()

    result_list = []
    for leave_request, employee_name in pending_requests:
        leave_data = leave_request.__dict__
        leave_data['employee_name'] = employee_name
        result_list.append(leave_data)
    return result_list

@router.put('/approve/{leave_id}', response_model=LeaveOut)
def approve_leave(leave_id: int, body: LeaveApprove, db: db_dependency, user=Depends(get_current_user)):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        create_audit_log(db, user_id=user.id, action=f"Failed to approve/reject leave: Leave ID {leave_id} not found.")
        raise HTTPException(status_code=404, detail="Leave not found")

    if leave.approver_level != user.role and user.role.lower() != "admin":
        create_audit_log(db, user_id=user.id, action=f"Unauthorized attempt to approve/reject leave ID {leave_id}.")
        raise HTTPException(status_code=403, detail="Not authorised")

    if body.status.lower() == "approved":
        if user.role.lower() == "admin":
            leave.status = "approved"
            leave.approver_level = None
        else:
            leave.approver_level = get_next_approver(user.role)
            leave.status = "pending"
    elif body.status.lower() == "rejected":
        leave.status = "rejected"
        leave.approver_level = None

    db.commit()
    db.refresh(leave)

    create_audit_log(db, user_id=user.id, action=f"Set leave ID {leave_id} status to '{leave.status}' (Approver Level: {user.role}).")

    if leave.status in ["approved", "rejected"]:
        employee = db.query(Employee).filter_by(id=leave.employee_id).first()
        if employee:
            user_rec = db.query(User).filter_by(email=employee.email).first()
            if user_rec:
                asyncio.run(send_notification_direct(
                    user_id=user_rec.id,
                    title="Leave Request Update",
                    message=f"Your leave from {leave.start_date} to {leave.end_date} has been {leave.status.upper()}."
                ))

    employee = db.query(Employee).filter_by(id=leave.employee_id).first()
    return {
        "id": leave.id,
        "employee_id": leave.employee_id,
        "employee_name": employee.name if employee else None,
        "start_date": leave.start_date,
        "end_date": leave.end_date,
        "leave_type": leave.leave_type,
        "reason": leave.reason,
        "status": leave.status,
        "approver_level": leave.approver_level,
    }


@router.get('/calendar')
def leave_calendar(db: db_dependency, user=Depends(get_current_user)):
    return db.query(LeaveRequest).filter(LeaveRequest.status=="approved").all()

@router.get("/balance/me")
def my_leave_balance(db: db_dependency, user=Depends(get_current_user)):
    employee = db.query(Employee).filter(Employee.email == user.email).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    approved_leaves = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == employee.id,
        LeaveRequest.status == "approved"
    ).all()

    days_taken = sum((leave.end_date - leave.start_date).days + 1 for leave in approved_leaves)
    total_allowance = 30
    remaining_leaves = total_allowance - days_taken

    return {
        "employee_id": employee.id,
        "leaves_taken": days_taken,
        "remaining": remaining_leaves
    }

@router.get('/balance/{employee_id}')
def leave_balance(employee_id: int, db: db_dependency, user=Depends(get_current_user)):
    create_audit_log(db, user_id=user.id, action=f"Viewed leave balance for employee ID {employee_id}.")
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        create_audit_log(db, user_id=user.id, action=f"Failed to view leave balance: Employee ID {employee_id} not found.")
        raise HTTPException(status_code=404, detail="Employee not found")

    approved_leaves = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == employee_id,
        LeaveRequest.status == "approved"
    ).all()

    days_taken = 0
    for leave in approved_leaves:
        days_taken += (leave.end_date - leave.start_date).days + 1

    total_allowance = 30
    remaining_leaves = total_allowance - days_taken

    return {
        "employee_id": employee_id,
        "leaves_taken": days_taken,
        "remaining": remaining_leaves
    }
    
@router.post('/holiday', response_model=HolidayOut)
def add_holiday(req: HolidayCreate, db: db_dependency, user= Depends(get_current_user)):
    if user.role.lower() != "admin":
        create_audit_log(db, user_id=user.id, action="Unauthorized attempt to add a holiday.")
        raise HTTPException(status_code=403, detail="only admin can add holiday")
    
    holiday = Holiday(**req.model_dump())
    db.add(holiday)
    db.commit()

    create_audit_log(db, user_id=user.id, action=f"Added a new holiday: '{req.name}' on {req.date}.")
    
    return holiday

@router.get('/holiday', response_model=List[HolidayOut])
def list_holidays(db: db_dependency):
    return db.query(Holiday).all()