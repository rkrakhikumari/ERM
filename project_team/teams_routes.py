from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.orm import Session # type: ignore
from database import db_dependency
from .schemas import TeamCreate, TeamOut
from .utils import list_teams, create_team, get_team, get_team_members
from typing import List

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.get('/', response_model=List[TeamOut])
def get_teams(db: db_dependency): # type: ignore
    return list_teams(db)

@router.post("/", response_model=TeamOut)
def create_new_team(data: TeamCreate, db: db_dependency): # type: ignore
    return create_team(db, data)

@router.get("/{team_id}", response_model=TeamOut)
def get_team_detail(team_id: int, db: db_dependency): # type: ignore
    team = get_team(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@router.get("/{team_id}/members")
def get_team_members_list(team_id: int, db: db_dependency): # type: ignore
    members = get_team_members(db, team_id)
    if members is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return members
