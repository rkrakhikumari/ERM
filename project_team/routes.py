from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import db_dependency
from .schemas import *
from .models import *
from .utils import *

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", response_model=ProjectOut)
def create_new_project(data: ProjectCreate, db: db_dependency):
    return create_project(db, data)

@router.get("/", response_model=List[ProjectOut])
def get_all_projects(db: db_dependency):
    return list_projects(db)

@router.post("/{project_id}/assign")
def assign_team(project_id: int, employee_ids: List[int], db: db_dependency):
    project = assign_employees_to_project(db,project_id, employee_ids)
    if not project:
        raise HTTPException(status_code=404, detail="project not found")
    return {"msg":"employees assigned"}

@router.get("/{project_id}/tasks", response_model=List[TaskOut])
def get_tasks(project_id: int, db: db_dependency):
    return list_tasks(db, project_id)

@router.post("/{project_id}/tasks", response_model=TaskOut)
def add_task(project_id: int, data: TaskCreate, db: db_dependency):
    return create_task(db, project_id, data)

@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, update_data: TaskUpdate, db: db_dependency):
    updated = update_task_status(db, task_id, update_data)
    if not updated:
        raise HTTPException(status_code= 404, detail="task not found")
    return updated
    
    
    