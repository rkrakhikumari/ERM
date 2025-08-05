from sqlalchemy.orm import Session
from fastapi import HTTPException
from .models import Attendance, TimeSheet
from .schemas import ClockInOut,TimeSheetSubmit,ManualEntryRequest
from datetime import datetime, date, timezone
from uuid import UUID


def clock_in(db: Session, user_id: UUID, time : datetime):
    if not isinstance(user_id, UUID):
        raise HTTPException(status_code=400, detail="Invalid user_id format")
    
    clock_in_time = time or datetime.now(timezone.utc)
    if not isinstance(clock_in_time, datetime):
        raise HTTPException(status_code=400, detail="Invalid datetime format")
    
    today = date.today()
    record = Attendance(employee_id = user_id, clock_in = time or datetime.now(timezone.utc), date=today)
    db.add(record)
    db.commit()
    return record

def clock_out(db, user_id, time):
    if not isinstance(user_id, UUID):
        raise HTTPException(status_code=400, detail="Invalid user_id format")
    record = db.query(Attendance).filter(Attendance.employee_id == user_id,Attendance.date == datetime.now().date()).first()

    if not record:
        raise HTTPException(status_code=404, detail="No clock-in record found for today.")


    record.clock_out = time or datetime.now(timezone.utc)
    db.commit()
    db.refresh(record)
    return {"message": "Clocked out", "clock_out": record.clock_out}

def get_my_attendance(db: Session, user_id: UUID):
    if not isinstance(user_id, UUID):
        raise HTTPException(status_code=400, detail="Invalid user_id format")
    return db.query(Attendance).filter(Attendance.employee_id== user_id).all()

def request_manual_entry(db: Session, user_id: int, entry: ManualEntryRequest):
    if not isinstance(user_id, UUID):
        raise HTTPException(status_code=400, detail="Invalid user_id format")
    
    if not isinstance(entry.clock_in, datetime) or not isinstance(entry.clock_out, datetime):
        raise HTTPException(status_code=400, detail="Invalid clock-in/out datetime format")
    
    if entry.clock_in >= entry.clock_out:
        raise HTTPException(status_code=400, detail="Clock-out must be after clock-in")

    record = Attendance(employee_id=user_id, clock_in=entry.clock_in, clock_out=entry.clock_out,is_manual=True,status="Pending",date=entry.clock_in.date())
    db.add(record)
    db.commit()
    return record

def submit_timesheet(db:Session, user_id: UUID, ts: TimeSheetSubmit):
    if not isinstance(user_id, UUID):
        raise HTTPException(status_code=400, detail="Invalid user_id format")
    
    if ts.week_start >= ts.week_end:
        raise HTTPException(status_code=400, detail="week_end must be after week_start")

    if not ts.task_summary or not ts.task_summary.strip():
        raise HTTPException(status_code=400, detail="Task summary cannot be empty")

    record = TimeSheet(employee_id=user_id , week_start= ts.week_start, week_end= ts.week_end, task_summary=ts.task_summary)
    db.add(record)
    db.commit()
    return record

def get_my_timesheet(db: Session, user_id: str):
    if not isinstance(user_id, UUID):
        raise HTTPException(status_code=400, detail="Invalid user_id format")
    return db.query(TimeSheet).filter(TimeSheet.employee_id==user_id).all()

def get_timesheet_for_employee(db: Session, emp_id: str):
    if not isinstance(emp_id, UUID):
        raise HTTPException(status_code=400, detail="Invalid employee_id format")
    return db.query(TimeSheet).filter(TimeSheet.employee_id == str(emp_id)).all()

def get_all_logs(db: Session):
    return db.query(Attendance).all()

