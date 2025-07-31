from fastapi import APIRouter
from database import db_dependency
from .schemas import TeamCreate, TeamOut
from .utils import list_teams, create_team, assign_employees_to_team
from typing import List

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.get('/', response_model=List[TeamOut])
def get_teams(db: db_dependency):
    return list_teams(db)


@router.post("/", response_model=TeamOut)
def create_new_team(data: TeamCreate, db: db_dependency):
    return create_team(db, data)
