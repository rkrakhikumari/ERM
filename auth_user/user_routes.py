from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from auth_user.models import User
from auth_user.utils import get_current_user
from auth_user.schemas import *
from database import db_dependency
from admin.crud import create_audit_log # Import the audit log function
from typing import Optional, List

router = APIRouter(prefix='/users', tags=["user"])

@router.get('/me', response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(user_id: int, db: db_dependency, current_user: User = Depends(get_current_user)):
    if current_user.role.lower() != "admin": 
        create_audit_log(db, user_id=current_user.id, action=f"Attempted to view user profile with ID: {user_id} (Access Denied)"
        )
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Admin can view other users")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        create_audit_log(db, user_id=current_user.id, action=f"Attempted to view non-existent user profile with ID: {user_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    create_audit_log(db, user_id=current_user.id, action=f"Viewed user profile with ID: {user.id} ({user.email})")
    return user

@router.get("/", response_model=PaginatedUsers)
def list_users(db: db_dependency, current_user: User = Depends(get_current_user), skip: int = 0, limit: int = 10, role: Optional[str] = None):

    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Admin can list users")
        
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    total = query.count()
    users = query.offset(skip).limit(limit).all()
    
    return {"total": total, "users": users}


@router.put("/me", response_model=UserOut)
def update_own_profile(update_data: UpdateOwnProfile, db: db_dependency, current_user: User = Depends(get_current_user)):
    create_audit_log(db, user_id=current_user.id, action=f"Updated own profile (changed name to: {update_data.full_name})")
    current_user.full_name = update_data.full_name or current_user.full_name
    db.commit()
    return current_user

@router.post("/invite")
def invite_user(invite: InviteRequest, db: db_dependency, current_user: User = Depends(get_current_user)):
    if current_user.role.lower() != "admin":
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Admin can invite users.")
         
    email = invite.email.strip()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        create_audit_log(db, user_id=current_user.id, action=f"Attempted to invite existing user: {email}")
        raise HTTPException(status_code=400, detail="User already exist")
        
    print(f"invitation email sent to: {email}")
    
    create_audit_log(db, user_id=current_user.id, action=f"Sent invitation to user: {email}")
    return {"msg": f"invitation sent to {email}"}

@router.put("/{user_id}/role", response_model=UserOut)
def update_user_role(user_id: int, update_data: AdminUpdateRole, db: db_dependency, current_user: User = Depends(get_current_user)):
    if current_user.role.lower() != "admin":
        create_audit_log(db,user_id=current_user.id, action=f"Attempted to update role of user {user_id} (Access Denied)")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Admin can update user roles")

    user_to_update = db.query(User).filter(User.id == user_id).first()
    if not user_to_update:
        create_audit_log(db, user_id=current_user.id, action=f"Attempted to update role for non-existent user with ID: {user_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    old_role = user_to_update.role
    user_to_update.role = update_data.role
    db.commit()
    
    create_audit_log(db, user_id=current_user.id, action=f"Updated user '{user_to_update.email}' role from '{old_role}' to '{update_data.role}'")
    return user_to_update