from pydantic import BaseModel
from datetime import date
from typing import Optional, List
from .models import LeaveType, LeaveStatus
class LeaveApply(BaseModel):
    start_date: date
    end_date : date
    leave_type: LeaveType
    reason : str

class LeaveOut(BaseModel):
    id: int
    employee_id: int
    employee_name: str
    start_date: date
    end_date: date
    leave_type: LeaveType
    reason: str
    status: LeaveStatus
    approver_level: str | None 


class LeaveApprove(BaseModel):
    status: LeaveStatus

class HolidayCreate(BaseModel):
    name: str
    date: date
    department: Optional[str] = None

class HolidayOut(BaseModel):
    id : int
    name: str
    date: date