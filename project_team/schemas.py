from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from enum import Enum

class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    blocked = "blocked"

class ProjectCreate(BaseModel):
    name : str
    description : Optional[str]
    start_date: date
    end_date : date

class ProjectOut(ProjectCreate):
    id : int
    team_members : List[int] = []

class TaskCreate(BaseModel):
    title : str
    description : Optional[str]

class TaskUpdate(BaseModel):
    status: TaskStatus

class TaskOut(TaskCreate):
    id: int
    status : TaskStatus

class TeamCreate(BaseModel):
    name : str
    manager_id : int
    member_ids: Optional[List[int]] = []

class TeamOut(TeamCreate):
    id : int
    name : str
    manager_id : int
