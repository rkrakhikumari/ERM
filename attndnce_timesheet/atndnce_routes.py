from fastapi import APIRouter, Depends, HTTPException
from auth_user.utils import get_current_user
from database import db_dependency
from .schemas import ManualEntryRequest, ClockInOut, AttendanceOut
from .utils import clock_in, clock_out, get_my_attendance, request_manual_entry, get_all_logs
from typing import List

router= APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post('/clock-in')
def clock_in_endpoint(data: ClockInOut, db: db_dependency, user = Depends(get_current_user)):
    return clock_in(db, user.id, data.timestamp)

@router.post('/clock-out')
def clock_out_endpoint(data: ClockInOut, db: db_dependency, user = Depends(get_current_user)):
    return clock_out(db, user.id, data.timestamp)

@router.get('/me', response_model=List[AttendanceOut])
def my_attendance(db: db_dependency, user=Depends(get_current_user)):
    return get_my_attendance(db, user.id)

@router.post('/manual-entry')
def manual_entry(entry: ManualEntryRequest,db: db_dependency, user= Depends(get_current_user)):
    return request_manual_entry(db, user.id, entry)

@router.get('/logs')
def attendance_logs(db: db_dependency, user = Depends(get_current_user)):
    if user.role.lower() not in ["admin","hr"]:
        raise HTTPException(status_code=403, detail="Acess denied")
    return get_all_logs(db)

