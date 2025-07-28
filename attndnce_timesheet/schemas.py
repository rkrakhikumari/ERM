from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class ClockInOut(BaseModel):
    timestamp : Optional[datetime]

class ManualEntryRequest(BaseModel):
    clock_in : datetime
    clock_out : datetime
    reason : str

class TimeSheetSubmit(BaseModel):
    week_start : datetime
    week_end : datetime
    task_summary : str

class TimeSheetOut(BaseModel):
    id: int
    employee_id: UUID
    week_start: datetime
    week_end: datetime
    task_summary: str
    submitted_on: datetime

class AttendanceOut(BaseModel):
    id: int
    employee_id: UUID
    clock_in: Optional[datetime]
    clock_out: Optional[datetime]
    date: datetime
    is_manual: bool
    status: str
