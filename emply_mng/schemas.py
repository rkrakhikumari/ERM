from pydantic import BaseModel, EmailStr # type: ignore
from typing import Optional
from datetime import date
from enum import Enum

class EmployementStatus(str, Enum):
    active = "active"
    terminated = "terminated"
    resigned = "resigned"

class EmployeeBase(BaseModel):
    name : str
    email : EmailStr
    phone : Optional[str]
    department : str
    designation : str
    manager_id : Optional[int]
    status : EmployementStatus = EmployementStatus.active
    date_joined : date

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name : Optional[str]
    phone : Optional[str]
    department : Optional[str]
    designation : Optional[str]
    manager_id : Optional[int]
    status : Optional[EmployementStatus]
    date_joined: Optional[date]

class EmployeeOut(EmployeeBase):
    id : int

class HistoryOut(BaseModel):
    id: int
    action : str
    from_value : str
    to_value : str
    date: date

