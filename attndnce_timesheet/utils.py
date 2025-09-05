from sqlalchemy.orm import Session
from fastapi import HTTPException
from .models import Attendance, TimeSheet
from .schemas import ClockInOut, TimeSheetSubmit, ManualEntryRequest
from datetime import datetime, date, timezone
from uuid import UUID

def clock_in(db: Session, user_id: UUID, time : datetime):    
    clock_in_time = time or datetime.now(timezone.utc)
    
    today = datetime.now(timezone.utc).date()
    existing_record = db.query(Attendance).filter(
        Attendance.employee_id == str(user_id),
        Attendance.date == today
    ).first()
    
    if existing_record:
        raise HTTPException(status_code=400, detail="Already clocked in for today.")

    record = Attendance(employee_id=str(user_id), clock_in=clock_in_time, date=today)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def clock_out(db: Session, user_id: UUID, time: datetime):
    today = datetime.now(timezone.utc).date()
    record = db.query(Attendance).filter(
        Attendance.employee_id == str(user_id),
        Attendance.date == today
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="No clock-in record found for today.")
    
    if record.clock_out:
        raise HTTPException(status_code=400, detail="Already clocked out for today.")

    record.clock_out = time or datetime.now(timezone.utc)
    db.commit()
    db.refresh(record)
    return {"message": "Clocked out", "clock_out": record.clock_out}

def get_my_attendance(db: Session, user_id: UUID):
    return db.query(Attendance).filter(Attendance.employee_id == str(user_id)).all()

def request_manual_entry(db: Session, user_id: UUID, entry: ManualEntryRequest):
    if entry.clock_in >= entry.clock_out:
        raise HTTPException(status_code=400, detail="Clock-out must be after clock-in")
        
    record = Attendance(
        employee_id=str(user_id), 
        clock_in=entry.clock_in, 
        clock_out=entry.clock_out,
        is_manual=True,
        status="Pending",
        date=entry.clock_in.date()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def submit_timesheet(db: Session, user_id: UUID, ts: TimeSheetSubmit):
    if ts.week_start >= ts.week_end:
        raise HTTPException(status_code=400, detail="Week end must be after week start")
    
    if not ts.task_summary or not ts.task_summary.strip():
        raise HTTPException(status_code=400, detail="Task summary cannot be empty")
        
    record = TimeSheet(
        employee_id=str(user_id),
        week_start=ts.week_start,
        week_end=ts.week_end,
        task_summary=ts.task_summary
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def get_my_timesheet(db: Session, user_id: UUID):
    return db.query(TimeSheet).filter(TimeSheet.employee_id == str(user_id)).all()

def get_timesheet_for_employee(db: Session, emp_id: str):
    try:
        return db.query(TimeSheet).filter(TimeSheet.employee_id == emp_id).all()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid employee ID format.")


def get_all_logs(db: Session):
    return db.query(Attendance).all()