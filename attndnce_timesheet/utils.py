from sqlalchemy.orm import Session
from fastapi import HTTPException
from .models import Attendance, TimeSheet
from .schemas import ClockInOut,TimeSheetSubmit,ManualEntryRequest
from datetime import datetime, date, timezone
from uuid import UUID


def clock_in(db: Session, user_id: UUID, time : datetime):
    today = date.today()
    record = Attendance(employee_id = user_id, clock_in = time or datetime.now(timezone.utc), date=today)
    db.add(record)
    db.commit()
    return record

def clock_out(db, user_id, time):
    record = db.query(Attendance).filter(Attendance.employee_id == user_id,Attendance.date == datetime.now().date()).first()

    if not record:
        raise HTTPException(status_code=404, detail="No clock-in record found for today.")


    record.clock_out = time or datetime.now(timezone.utc)
    db.commit()
    db.refresh(record)
    return {"message": "Clocked out", "clock_out": record.clock_out}

def get_my_attendance(db: Session, user_id: UUID):
    return db.query(Attendance).filter(Attendance.employee_id== user_id).all()

def request_manual_entry(db: Session, user_id: int, entry: ManualEntryRequest):
    record = Attendance(employee_id=user_id, clock_in=entry.clock_in, clock_out=entry.clock_out,is_manual=True,status="Pending",date=entry.clock_in.date())
    db.add(record)
    db.commit()
    return record

def submit_timesheet(db:Session, user_id: UUID, ts: TimeSheetSubmit):
    record = TimeSheet(employee_id=user_id , week_start= ts.week_start, week_end= ts.week_end, task_summary=ts.task_summary)
    db.add(record)
    db.commit()
    return record

def get_my_timesheet(db: Session, user_id: str):
    return db.query(TimeSheet).filter(TimeSheet.employee_id==user_id).all()

def get_timesheet_for_employee(db: Session, emp_id: str):
    return db.query(TimeSheet).filter(TimeSheet.employee_id == str(emp_id)).all()

def get_all_logs(db: Session):
    return db.query(Attendance).all()

