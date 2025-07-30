from fastapi import APIRouter, Depends, HTTPException
from auth_user.utils import get_current_user
from .schemas import TimeSheetSubmit, TimeSheetOut
from database import db_dependency
from .utils import get_timesheet_for_employee, get_my_timesheet, submit_timesheet
from typing import List

router = APIRouter(prefix="/timesheets", tags=["Timesheet"])

@router.post('/submit')
def submit(ts: TimeSheetSubmit ,db: db_dependency, user=Depends(get_current_user)):
    return submit_timesheet(db, user.id, ts)

@router.get('/me')
def my_timesheet(db: db_dependency, user = Depends(get_current_user)):
    return get_my_timesheet(db, user.id)

@router.get('/{employee_id}', response_model=List[TimeSheetOut])
def get_employee_timesheet(employee_id: str, db: db_dependency, user = Depends(get_current_user)):
    if user.id != employee_id and user.role.lower() not in ["admin", "hr"]:
        raise HTTPException(status_code=403, detail="You are not authorized to view this timesheet.")    
    data = get_timesheet_for_employee(db, employee_id)
    return data
