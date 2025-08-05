from sqlalchemy.orm import Session
from .models import Project, Task, TeamMember, Team
from emply_mng.models import Employee
from .schemas import ProjectCreate, ProjectOut, TaskCreate, TaskUpdate, TaskOut, TaskStatus, TeamCreate,TeamOut

def create_project(db: Session, data: ProjectCreate):
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    return project

def list_projects(db: Session):
    return db.query(Project).all()

def assign_employees_to_project(db: Session, project_id: int, employee_ids: list[int]):
    project = db.query(Project).get(project_id)
    if not project:
        return None
    project.team_members = [db.query(Employee).get(emp_id) for emp_id in employee_ids]
    db.commit()
    return project

def create_task(db: Session, project_id: int, data: TaskCreate):
    task = Task(**data.model_dump(),project_id=project_id)
    db.add(task)
    db.commit()
    return task

def list_tasks(db: Session, project_id: int):
    return db.query(Task).filter(Task.project_id == project_id).all()

def update_task_status(db: Session, task_id: int, status:TaskUpdate):
    task =db.query(Task).get(task_id)
    if not task:
        return None
    task.status = status.status
    db.commit()
    return task

def create_team(db: Session, data: TeamCreate):
    team = Team(name=data.name, manager_id=data.manager_id)
    db.add(team)
    db.commit()
    db.refresh(team)

    assign_employees_to_team(db, team.id, [data.manager_id])

    if data.member_ids:
        assign_employees_to_team(db, team.id, data.member_ids)

    return team
def assign_employees_to_team(db: Session, team_id: int, employee_ids: list[int]):
    for emp_id in employee_ids:
        exists = db.query(TeamMember).filter_by(team_id=team_id, employee_id=emp_id).first()
        if not exists:
            db.add(TeamMember(team_id=team_id, employee_id=emp_id))
    db.commit()

def list_teams(db: Session):
    return db.query(Team).all()

