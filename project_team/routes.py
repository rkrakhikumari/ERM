from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.orm import Session # type: ignore
from database import db_dependency
from .schemas import *
from .models import *
from .utils import *
from typing import List
from auth_user.utils import get_current_user
from auth_user.models import User
from admin.crud import create_audit_log

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", response_model=ProjectOut)
def create_new_project(data: ProjectCreate, db: db_dependency, user: User = Depends(get_current_user)):
    new_project = create_project(db, data)
    create_audit_log(db, user_id=user.id, action=f"Created new project: {new_project.name} (ID: {new_project.id}).")
    return new_project

@router.get("/", response_model=List[ProjectOut])
def get_all_projects(db: db_dependency):
    return list_projects(db)

@router.get("/{project_id}", response_model=ProjectOut)
def get_project_detail(project_id: int, db: db_dependency):
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/{project_id}/assign-employees")
def assign_employees_to_project_route(project_id: int, request: EmployeeAssignmentRequest, db: db_dependency, user: User = Depends(get_current_user)):
    project = assign_employees_to_project(db, project_id, request.employee_ids)
    if not project:
        create_audit_log(db, user_id=user.id, action=f"Failed to assign employees to project {project_id}: Project not found.")
        raise HTTPException(status_code=404, detail="Project not found")

    create_audit_log(db, user_id=user.id, action=f"Assigned employees {request.employee_ids} to project {project_id}.")
    return {"msg": "Employees assigned successfully", "project_id": project_id, "assigned_employees": len(request.employee_ids)}

@router.post("/{project_id}/assign-teams")
def assign_teams_to_project_route(project_id: int, request: TeamAssignmentRequest, db: db_dependency, user: User = Depends(get_current_user)):
    project = assign_teams_to_project(db, project_id, request.team_ids)
    if not project:
        create_audit_log(db, user_id=user.id, action=f"Failed to assign teams to project {project_id}: Project not found.")
        raise HTTPException(status_code=404, detail="Project not found")

    create_audit_log(db, user_id=user.id, action=f"Assigned teams {request.team_ids} to project {project_id}.")
    return {"msg": "Teams assigned successfully", "project_id": project_id, "assigned_teams": len(request.team_ids)}

@router.post("/{project_id}/assign-mixed")
def assign_mixed_to_project_route(project_id: int, request: MixedAssignmentRequest, db: db_dependency, user: User = Depends(get_current_user)):
    """Assign both individual employees and teams to a project"""
    result = assign_mixed_to_project(db, project_id, request.employee_ids, request.team_ids)
    if not result:
        create_audit_log(db, user_id=user.id, action=f"Failed to assign employees/teams to project {project_id}: Project not found.")
        raise HTTPException(status_code=404, detail="Project not found")

    create_audit_log(db, user_id=user.id, action=f"Assigned a mix of employees {request.employee_ids} and teams {request.team_ids} to project {project_id}.")
    return {
        "msg": "Assignment completed successfully", 
        "project_id": project_id,
        "assigned_employees": len(request.employee_ids),
        "assigned_teams": len(request.team_ids),
        "total_members": result["total_members"]
    }

@router.get("/{project_id}/team-members")
def get_project_team_members(project_id: int, db: db_dependency, user: User = Depends(get_current_user)):
    """Get all team members assigned to a project (both direct and through teams)"""
    create_audit_log(db, user_id=user.id, action=f"Viewed team members for project {project_id}.")
    members = get_project_all_members(db, project_id)
    if members is None:
        create_audit_log(db, user_id=user.id, action=f"Failed to view team members for project {project_id}: Project not found.")
        raise HTTPException(status_code=404, detail="Project not found")
    return members

@router.delete("/{project_id}/remove-assignment")
def remove_project_assignment(project_id: int, request: RemoveAssignmentRequest, db: db_dependency, user: User = Depends(get_current_user)):
    """Remove employees or teams from project"""
    result = remove_assignment_from_project(db, project_id, request.employee_ids, request.team_ids)
    if not result:
        create_audit_log(db, user_id=user.id, action=f"Failed to remove assignment from project {project_id}: Project not found.")
        raise HTTPException(status_code=404, detail="Project not found")

    create_audit_log(db, user_id=user.id, action=f"Removed employees {request.employee_ids} and teams {request.team_ids} from project {project_id}.")
    return {"msg": "Assignment removed successfully"}

@router.get("/{project_id}/tasks", response_model=List[TaskOut])
def get_tasks(project_id: int, db: db_dependency):
    return list_tasks(db, project_id)

@router.get("/tasks/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: db_dependency):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/{project_id}/tasks", response_model=TaskOut)
def add_task(project_id: int, data: TaskCreate, db: db_dependency, user: User = Depends(get_current_user)):
    new_task = create_task(db, project_id, data)
    create_audit_log(db, user_id=user.id, action=f"Added a new task '{new_task.title}' to project {project_id}.")
    return new_task

@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, update_data: TaskUpdate, db: db_dependency, user: User = Depends(get_current_user)):
    updated = update_task_status(db, task_id, update_data)
    if not updated:
        create_audit_log(db, user_id=user.id, action=f"Failed to update task {task_id}: Task not found.")
        raise HTTPException(status_code=404, detail="Task not found")
    
    create_audit_log(db, user_id=user.id, action=f"Updated task {task_id} status to '{updated.status}'.")
    return updated