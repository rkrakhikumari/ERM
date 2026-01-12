from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from auth_user.utils import get_current_user
from database import db_dependency
from .schemas import TimeSheetSubmit, TimeSheetOut
from .models import TimeSheet
from .utils import get_timesheet_for_employee, get_my_timesheet, submit_timesheet
from typing import List
import os
from pydantic import BaseModel
from admin.crud import create_audit_log  # Import the audit log function

class TimesheetId(BaseModel):
    timesheet_id: int

router = APIRouter(prefix="/timesheets", tags=["Timesheet"])

@router.post('/submit', response_model=TimesheetId)
def submit(ts: TimeSheetSubmit, db: db_dependency, user=Depends(get_current_user)):
    new_timesheet = submit_timesheet(db, user.id, ts)

    if not new_timesheet or not hasattr(new_timesheet, 'id'):
        create_audit_log(db, user_id=user.id, action="Failed to submit timesheet record.")
        raise HTTPException(status_code=500, detail="Failed to create timesheet record or retrieve its ID.")
    
    create_audit_log(db, user_id=user.id, action=f"Submitted new timesheet (ID: {new_timesheet.id}).")
    return {"timesheet_id": new_timesheet.id}

@router.get('/me', response_model=List[TimeSheetOut])
def my_timesheet(db: db_dependency, user=Depends(get_current_user)):
    # This is a read-only endpoint, so no audit log is needed to avoid log spam.
    return get_my_timesheet(db, user.id)

@router.get('/{employee_id}', response_model=List[TimeSheetOut])
def get_employee_timesheet(employee_id: str, db: db_dependency, user=Depends(get_current_user)):
    if user.id != employee_id and user.role.lower() not in ["admin", "hr"]:
        create_audit_log(db, user_id=user.id, action=f"Attempted to view timesheet for user ID {employee_id} (Access Denied).")
        raise HTTPException(status_code=403, detail="You are not authorized to view this timesheet.")

    if user.id != employee_id:
        create_audit_log(db, user_id=user.id, action=f"Viewed timesheet for employee ID {employee_id}.")

    return get_timesheet_for_employee(db, employee_id)

@router.post('/{timesheet_id}/upload-screenshot')
def upload_screenshot(db: db_dependency, timesheet_id: int, file: UploadFile = File(...), user=Depends(get_current_user)):
    try:
        upload_dir = "screenshots"
        os.makedirs(upload_dir, exist_ok=True)

        file_path = os.path.join(upload_dir, f"{timesheet_id}_{file.filename}")

        with open(file_path, "wb") as f:
            while contents := file.file.read(1024 * 1024):
                f.write(contents)

        timesheet = db.query(TimeSheet).filter(TimeSheet.id == timesheet_id).first()
        if not timesheet:
            create_audit_log(db, user_id=user.id, action=f"Failed to upload screenshot: Timesheet ID {timesheet_id} not found.")
            raise HTTPException(status_code=404, detail="Timesheet not found")

        timesheet.screenshot_path = file_path
        db.commit()
        db.refresh(timesheet)

        create_audit_log(db, user_id=user.id, action=f"Uploaded screenshot for timesheet ID {timesheet_id}.")

        return {
            "timesheet_id": timesheet_id,
            "screenshot": timesheet.screenshot_path,
            "message": "Screenshot uploaded successfully"
        }

    except Exception as e:
        create_audit_log(db, user_id=user.id, action=f"Failed to upload screenshot for timesheet ID {timesheet_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Could not upload file: {e}")
