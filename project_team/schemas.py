from pydantic import BaseModel # type: ignore
from typing import List, Optional
from datetime import date
from enum import Enum

class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    blocked = "blocked"

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: date

class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    team_members: List[int] = []
    assigned_teams: List[int] = []

    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None

class TaskUpdate(BaseModel):
    status: TaskStatus

class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: TaskStatus
    project_id: int

    class Config:
        from_attributes = True

class TeamCreate(BaseModel):
    name: str
    manager_id: int
    member_ids: Optional[List[int]] = []

class TeamOut(BaseModel):
    id: int
    name: str
    manager_id: int

    class Config:
        from_attributes = True

class EmployeeAssignmentRequest(BaseModel):
    employee_ids: List[int]

class TeamAssignmentRequest(BaseModel):
    team_ids: List[int]

class MixedAssignmentRequest(BaseModel):
    employee_ids: Optional[List[int]] = []
    team_ids: Optional[List[int]] = []

class RemoveAssignmentRequest(BaseModel):
    employee_ids: Optional[List[int]] = []
    team_ids: Optional[List[int]] = []

class ProjectMember(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    assignment_type: str  
    team_name: Optional[str] = None

    class Config:
        from_attributes = True

class ProjectTeamInfo(BaseModel):
    id: int
    name: str
    manager_id: int
    member_count: int

    class Config:
        from_attributes = True

class ProjectDetailOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    direct_members: List[ProjectMember] = []
    assigned_teams: List[ProjectTeamInfo] = []
    all_members: List[ProjectMember] = []

    class Config:
        from_attributes = True