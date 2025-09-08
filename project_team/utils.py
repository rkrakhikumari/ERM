from sqlalchemy.orm import Session # type: ignore
from .models import Project, Task, TeamMember, Team, project_employees, project_teams
from emply_mng.models import Employee
from .schemas import ProjectCreate, TaskCreate, TaskUpdate, TeamCreate
from typing import List, Optional

def create_project(db: Session, data: ProjectCreate):
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

def list_projects(db: Session):
    projects = db.query(Project).all()
    result = []
    for project in projects:
        project_dict = {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "start_date": project.start_date,
            "end_date": project.end_date,
            "team_members": [member.id for member in project.team_members],
            "assigned_teams": [team.id for team in project.assigned_teams]
        }
        result.append(project_dict)
    return result

def get_project(db: Session, project_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        return {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "start_date": project.start_date,
            "end_date": project.end_date,
            "team_members": [member.id for member in project.team_members],
            "assigned_teams": [team.id for team in project.assigned_teams]
        }
    return None

def assign_employees_to_project(db: Session, project_id: int, employee_ids: List[int]):
    """Assign individual employees directly to a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return None
    
    employees = db.query(Employee).filter(Employee.id.in_(employee_ids)).all()
    
    for employee in employees:
        if employee not in project.team_members:
            project.team_members.append(employee)
    
    db.commit()
    return project

def assign_teams_to_project(db: Session, project_id: int, team_ids: List[int]):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return None
    
    teams = db.query(Team).filter(Team.id.in_(team_ids)).all()
    
    for team in teams:
        if team not in project.assigned_teams:
            project.assigned_teams.append(team)
    
    db.commit()
    return project

def assign_mixed_to_project(db: Session, project_id: int, employee_ids: List[int], team_ids: List[int]):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return None
    
    if employee_ids:
        employees = db.query(Employee).filter(Employee.id.in_(employee_ids)).all()
        for employee in employees:
            if employee not in project.team_members:
                project.team_members.append(employee)
    
    if team_ids:
        teams = db.query(Team).filter(Team.id.in_(team_ids)).all()
        for team in teams:
            if team not in project.assigned_teams:
                project.assigned_teams.append(team)
    
    db.commit()
    
    total_members = len(get_project_all_members(db, project_id)["all_members"])
    return {
        "project": project,
        "total_members": total_members
    }

def get_project_all_members(db: Session, project_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return None
    
    all_members = []
    direct_members = []
    team_info = []
    
    for employee in project.team_members:
        member_data = {
            "id": employee.id,
            "first_name": employee.name,
            "email": getattr(employee, 'email', None),
            "department": getattr(employee, 'department', None),
            "position": getattr(employee, 'position', None),
            "assignment_type": "direct",
            "team_name": None
        }
        direct_members.append(member_data)
        all_members.append(member_data)
    
    for team in project.assigned_teams:
        team_members = (
            db.query(Employee)
            .join(TeamMember, Employee.id == TeamMember.employee_id)
            .filter(TeamMember.team_id == team.id)
            .all()
        )
        
        team_info.append({
            "id": team.id,
            "name": team.name,
            "manager_id": team.manager_id,
            "member_count": len(team_members)
        })
        
        for employee in team_members:
            if not any(member["id"] == employee.id for member in all_members):
                member_data = {
                    "id": employee.id,
                    "first_name": employee.name,
                    # "last_name": employee.last_name,
                    "email": getattr(employee, 'email', None),
                    "department": getattr(employee, 'department', None),
                    "position": getattr(employee, 'position', None),
                    "assignment_type": "team",
                    "team_name": team.name
                }
                all_members.append(member_data)
    
    return {
        "direct_members": direct_members,
        "team_info": team_info,
        "all_members": all_members
    }

def remove_assignment_from_project(db: Session, project_id: int, employee_ids: Optional[List[int]] = None, team_ids: Optional[List[int]] = None):
    """Remove employees or teams from project assignment"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return None
    
    if employee_ids:
        employees_to_remove = db.query(Employee).filter(Employee.id.in_(employee_ids)).all()
        for employee in employees_to_remove:
            if employee in project.team_members:
                project.team_members.remove(employee)
    
    if team_ids:
        teams_to_remove = db.query(Team).filter(Team.id.in_(team_ids)).all()
        for team in teams_to_remove:
            if team in project.assigned_teams:
                project.assigned_teams.remove(team)
    
    db.commit()
    return project
def get_task_by_id(db, task_id: int):
    return db.query(Task).filter(Task.id == task_id).first()

def create_task(db: Session, project_id: int, data: TaskCreate):
    task = Task(**data.model_dump(), project_id=project_id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def list_tasks(db: Session, project_id: int):
    return db.query(Task).filter(Task.project_id == project_id).all()

def update_task_status(db: Session, task_id: int, status: TaskUpdate):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return None
    task.status = status.status
    db.commit()
    db.refresh(task)
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

def assign_employees_to_team(db: Session, team_id: int, employee_ids: List[int]):
    for emp_id in employee_ids:
        exists = db.query(TeamMember).filter_by(team_id=team_id, employee_id=emp_id).first()
        if not exists:
            db.add(TeamMember(team_id=team_id, employee_id=emp_id))
    db.commit()

def list_teams(db: Session):
    return db.query(Team).all()

def get_team(db: Session, team_id: int):
    return db.query(Team).filter(Team.id == team_id).first()

def get_team_members(db: Session, team_id: int):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        return None
    
    team_members = (
        db.query(Employee)
        .join(TeamMember, Employee.id == TeamMember.employee_id)
        .filter(TeamMember.team_id == team_id)
        .all()
    )
    
    return team_members