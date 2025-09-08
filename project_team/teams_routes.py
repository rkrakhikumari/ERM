from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.orm import Session # type: ignore
from database import db_dependency
from .schemas import TeamCreate, TeamOut
from .utils import list_teams, create_team, get_team, get_team_members
from typing import List
from auth_user.utils import get_current_user
from auth_user.models import User
from admin.crud import create_audit_log

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.get('/', response_model=List[TeamOut])
def get_teams(db: db_dependency): # type: ignore
    return list_teams(db)

@router.post("/", response_model=TeamOut)
def create_new_team(data: TeamCreate, db: db_dependency, user: User = Depends(get_current_user)): # type: ignore
    if user.role.lower() not in ["admin", "hr", "manager"]:
        create_audit_log(db, user_id=user.id, action=f"Unauthorized attempt to create a team.")
        raise HTTPException(status_code=403, detail="Not authorized to create a team.")

    new_team = create_team(db, data)
    create_audit_log(db, user_id=user.id, action=f"Created new team: {new_team.name} (ID: {new_team.id}).")
    return new_team

@router.get("/{team_id}", response_model=TeamOut)
def get_team_detail(team_id: int, db: db_dependency, user: User = Depends(get_current_user)): # type: ignore
    team = get_team(db, team_id)
    if not team:
        create_audit_log(db, user_id=user.id, action=f"Failed to retrieve team: Team {team_id} not found.")
        raise HTTPException(status_code=404, detail="Team not found")
    
    create_audit_log(db, user_id=user.id, action=f"Viewed details for team {team_id}.")
    return team

@router.get("/{team_id}/members")
def get_team_members_list(team_id: int, db: db_dependency, user: User = Depends(get_current_user)): # type: ignore
    members = get_team_members(db, team_id)
    if members is None:
        create_audit_log(db, user_id=user.id, action=f"Failed to retrieve team members: Team {team_id} not found.")
        raise HTTPException(status_code=404, detail="Team not found")
    
    create_audit_log(db, user_id=user.id, action=f"Viewed members for team {team_id}.")
    return members