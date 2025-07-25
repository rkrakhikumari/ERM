from fastapi import APIRouter, Depends, HTTPException
from auth_user.models import User
from auth_user.utils import get_current_user
from auth_user.schemas import *
from database import db_dependency

router = APIRouter(prefix='/users')

@router.get('/me', response_model=UserOut)
def get_current_user_info(current_user: User=Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_own_profile(update_data: UpdateRole, db:db_dependency, current_user: User = Depends(get_current_user)):
    current_user.full_name = update_data.full_name or current_user.full_name
    current_user.role = update_data.role or current_user.role
    db.commit()
    return current_user

@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(user_id: str, db:db_dependency, current_user: User = Depends(get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only Admin can view other users")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


