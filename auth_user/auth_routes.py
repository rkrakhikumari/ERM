from fastapi import APIRouter, HTTPException # type: ignore
from auth_user.schemas import *
from auth_user.utils import get_hashed_password, verify_password, create_access_token, create_refresh_token,create_password_reset_token, verify_password_reset_token
from auth_user.models import User
from config import REFRESH_SECRET_KEY, ALGORITHM
import jwt # type: ignore
from database import db_dependency

router = APIRouter(prefix="/auth", tags=["auth"])

blacklist = set()

@router.post('/register', response_model=UserOut)
def register(user: UserCreate, db: db_dependency):  # type: ignore
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="email already exist")
    new_user = User(
        email=user.email.strip(),
        full_name=user.full_name,
        hashed_password=get_hashed_password(user.password),
        role=user.role if user.role else "Employee"
    )
    db.add(new_user)
    db.commit()
    return new_user

@router.post('/login', response_model=Token)
def login(user: UserLogin, db: db_dependency):  # type: ignore
    db_user = db.query(User).filter(User.email == user.email.strip()).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token({"sub": db_user.email})
    refresh_token = create_refresh_token({"sub": db_user.email})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post('/refresh', response_model=Token)
def refresh_token(token: str):  # not protected by Depends intentionally
    if token in blacklist:
        raise HTTPException(status_code=401, detail="Token has been blacklisted")
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        access_token = create_access_token({"sub": email})
        new_refresh_token = create_refresh_token({"sub": email})
        return {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}
    except:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post('/logout')
def logout(token: str):
    blacklist.add(token)
    return {"msg": "logout done"}

@router.post("/request-password-reset")
def request_password_reset(request: PasswordResetReq, db: db_dependency):  # type: ignore
    user = db.query(User).filter(User.email == request.email.strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    reset_token = create_password_reset_token({"sub": user.email})
    print(f"password reset link: http://localhost:5173/reset-password?token={reset_token}")
    return {"msg": "reset link has sent to email"}

@router.post("/reset-password")
def reset_password(data: PasswordReset, db: db_dependency):  # type: ignore
    email = verify_password_reset_token(data.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    user.hashed_password = get_hashed_password(data.new_password)
    db.commit()
    return {"msg": "password reset successfully"}
