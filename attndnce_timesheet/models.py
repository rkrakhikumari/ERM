from sqlalchemy import Column, Integer, DateTime, String, Boolean, ForeignKey
from datetime import datetime, timezone
from database import Base

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True)
    employee_id = Column(String, ForeignKey("users.id"))
    clock_in = Column(DateTime, nullable=True)
    clock_out = Column(DateTime, nullable= True)
    date = Column(DateTime, default=datetime.now(timezone.utc))
    is_manual = Column(Boolean,default=False)
    status = Column(String, default="Pending")
    

class TimeSheet(Base):
    __tablename__ = "timesheets"
    id = Column(Integer, primary_key=True)
    employee_id = Column(String, ForeignKey("users.id"))
    week_start = Column(DateTime)
    week_end = Column(DateTime)
    task_summary = Column(String)
    submitted_on = Column(DateTime, default=datetime.now(timezone.utc))


