from fastapi import APIRouter, Depends, HTTPException, status
from auth_user.utils import get_current_user
from database import db_dependency
from .schemas import ManualEntryRequest, ClockInOut, AttendanceOut
from .utils import clock_in, clock_out, get_my_attendance, request_manual_entry, get_all_logs
from typing import List
from admin.crud import create_audit_log # Import the audit log function

router= APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post('/clock-in')
def clock_in_endpoint(data: ClockInOut, db: db_dependency, user = Depends(get_current_user)):
    create_audit_log(db, user_id=user.id, action=f"Clocked in at {data.timestamp}")
    return clock_in(db, user.id, data.timestamp)

@router.post('/clock-out')
def clock_out_endpoint(data: ClockInOut, db: db_dependency, user = Depends(get_current_user)):
    create_audit_log(db, user_id=user.id, action=f"Clocked out at {data.timestamp}")
    return clock_out(db, user.id, data.timestamp)

@router.get('/me', response_model=List[AttendanceOut])
def my_attendance(db: db_dependency, user=Depends(get_current_user)):
    return get_my_attendance(db, user.id)

@router.post('/manual-entry')
def manual_entry(entry: ManualEntryRequest,db: db_dependency, user= Depends(get_current_user)):
    create_audit_log(db,user_id=user.id,action=f"Requested manual attendance entry for date: {entry.date}, reason: '{entry.reason}'")
    return request_manual_entry(db, user.id, entry)

@router.get('/logs', response_model=List[AttendanceOut])
def attendance_logs(db: db_dependency, user = Depends(get_current_user)):
    if user.role.lower() not in ["admin","hr"]:
        create_audit_log(db,user_id=user.id,action=f"Attempted to view attendance logs (Access Denied for role: {user.role})")
        raise HTTPException(status_code=403, detail="Acess denied")

    create_audit_log(db,user_id=user.id,action=f"Viewed all attendance logs (as {user.role})")
    return get_all_logs(db)