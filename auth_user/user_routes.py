from fastapi import APIRouter, Depends, HTTPException # type: ignore
from auth_user.models import User
from auth_user.utils import get_current_user
from auth_user.schemas import *
from database import db_dependency

router = APIRouter(prefix='/users', tags=["user"])

@router.get('/me', response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_own_profile(update_data: UpdateOwnProfile, db: db_dependency, current_user: User = Depends(get_current_user)):
    current_user.full_name = update_data.full_name or current_user.full_name
    db.commit()
    return current_user

@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(user_id: int, db: db_dependency, current_user: User = Depends(get_current_user)): # type: ignore
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only Admin can view other users")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=PaginatedUsers)
def list_users(db: db_dependency, current_user: User = Depends(get_current_user), skip: int = 0, limit: int = 10, role: Optional[str] = None): # type: ignore
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    total = query.count()
    users = query.offset(skip).limit(limit).all()
    return {"total": total, "users": users}

@router.post("/invite")
def invite_user(invite: InviteRequest, db: db_dependency): # type: ignore
    email = invite.email.strip()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exist")
    print(f"invitation email sent to: {email}")
    return {"msg": f"invitation sent to {email}"}

@router.put("/{user_id}/role", response_model=UserOut)
def update_user_role(user_id: int, update_data: AdminUpdateRole, db: db_dependency, current_user: User = Depends(get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only Admin can update user roles")

    user_to_update = db.query(User).filter(User.id == user_id).first()
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")

    user_to_update.role = update_data.role
    db.commit()
    return user_to_update
