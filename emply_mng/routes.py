from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import SessionLocal, db_dependency
from admin.crud import create_audit_log
from auth_user.models import User
from auth_user.utils import get_current_user
from .schemas import *
from notification.tasks import trigger_notification
from .utils import create_employee, get_all_employees, get_employees, update_employees, delete_employees, get_employe_history

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.post("/", response_model=EmployeeOut)
def add_employee(data: EmployeeCreate, db: db_dependency):
    employee = create_employee(db, data)
    create_audit_log(
        db,
        user_id=user.id,
        action=f"Added a new employee: {employee.full_name} ({employee.id})."
    )

    admin_id = 3 
    trigger_notification.delay(
        user_id=admin_id,
        title="New Employee Added",
        message=f"{employee.name} has been added to employees"
    )
    return employee

@router.get("/", response_model=List[EmployeeOut])
def list_employees(db: db_dependency, department: Optional[str]=None, status: Optional[str]=None):
    return get_all_employees(db, department, status)

@router.get('/{employee_id}', response_model=EmployeeOut)
def get_employee(employee_id:int, db: db_dependency,user: User = Depends(get_current_user)):
    employee = get_employees(db, employee_id)
    if not employee:
        create_audit_log(
            db,
            user_id=user.id,
            action=f"Failed to retrieve employee: Employee with ID {employee_id} not found."
        )
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id:int, updates: EmployeeUpdate, db: db_dependency):
    updated = update_employees(db, employee_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="employee not found")
    return updated

@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: db_dependency, user: User = Depends(get_current_user)):
    deleted = delete_employees(db, employee_id)
    if not deleted:
        create_audit_log(
            db,
            user_id=user.id,
            action=f"Failed to delete employee: Employee with ID {employee_id} not found."
        )
        raise HTTPException(status_code=404, detail="employee not found")

    create_audit_log(
        db,
        user_id=user.id,
        action=f"Deleted employee with ID {employee_id}."
    )
    return {"msg":"employee deleted"}
    
@router.get("/{employee_id}/history", response_model=List[HistoryOut])
def get_history(employee_id: int, db: db_dependency, user: User = Depends(get_current_user)):
    create_audit_log(
        db,
        user_id=user.id,
        action=f"Viewed history for employee ID {employee_id}."
    )
    history = get_employe_history(db, employee_id)
    return history