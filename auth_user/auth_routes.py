from fastapi import APIRouter, HTTPException, Depends, status 
from auth_user.schemas import *
from auth_user.utils import get_hashed_password, verify_password, create_access_token, create_refresh_token,create_password_reset_token, verify_password_reset_token, get_current_user # Added get_current_user
from auth_user.models import User
from config import REFRESH_SECRET_KEY, ALGORITHM
from jose import jwt, JWTError 
from database import db_dependency
from admin.crud import create_audit_log

router = APIRouter(prefix="/auth", tags=["auth"])

blacklist = set()

@router.post('/register', response_model=UserOut)
def register(user: UserCreate, db: db_dependency):
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
    create_audit_log(db, user_id=new_user.id, action=f"Registered new user: {new_user.email}")

    return new_user

@router.post('/login', response_model=Token)
def login(user: UserLogin, db: db_dependency):
    db_user = db.query(User).filter(User.email == user.email.strip()).first()
    
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        create_audit_log(
            db, 
            user_id=db_user.id if db_user else None, 
            action=f"Failed login attempt for email: {user.email}"
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": db_user.email, "role": db_user.role, "id": db_user.id})
    refresh_token = create_refresh_token({"sub": db_user.email, "role": db_user.role})
    
    create_audit_log(db, user_id=db_user.id, action="Logged in successfully")
    
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post('/refresh', response_model=Token)
def refresh_token(token: str, db: db_dependency): 
    if token in blacklist:
        try:
            payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("id")
            create_audit_log(db, user_id=user_id, action="Attempted to use blacklisted refresh token")
        except:
            create_audit_log(db, user_id=None, action="Attempted to use blacklisted or invalid token")
        raise HTTPException(status_code=401, detail="Token has been blacklisted")
    
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

        db_user = db.query(User).filter(User.email == email).first()
        if not db_user:
             raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
        access_token = create_access_token({"sub": email})
        new_refresh_token = create_refresh_token({"sub": email})
        
        create_audit_log(db, user_id=db_user.id, action="Refreshed access token successfully")
        
        return {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}
    except JWTError:
        create_audit_log(db, user_id=None, action="Attempted to use an invalid or expired refresh token")
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@router.post('/logout')
def logout(token: str, db: db_dependency): 
    blacklist.add(token)
    
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload.get("sub")
        db_user = db.query(User).filter(User.email == user_email).first()
        user_id = db_user.id if db_user else None
    except:
        user_id = None
        
    create_audit_log(db, user_id=user_id, action="Logged out successfully")
    
    return {"msg": "logout done"}


@router.post("/request-password-reset")
def request_password_reset(request: PasswordResetReq, db: db_dependency):
    user = db.query(User).filter(User.email == request.email.strip()).first()
    if not user:
        create_audit_log(db, user_id=None, action=f"Failed password reset request for email: {request.email}")
        raise HTTPException(status_code=404, detail="user not found")
        
    reset_token = create_password_reset_token({"sub": user.email})
    print(f"password reset link: http://localhost:5173/reset-password?token={reset_token}")
    
    create_audit_log(db, user_id=user.id, action="Requested password reset link")
    
    return {"msg": "reset link has sent to email"}


@router.post("/reset-password")
def reset_password(data: PasswordReset, db: db_dependency):
    email = verify_password_reset_token(data.token)
    if not email:
        create_audit_log(db, user_id=None, action="Failed password reset attempt (invalid/expired token)")
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        create_audit_log(db, user_id=None, action=f"Failed password reset attempt (user for email {email} not found)")
        raise HTTPException(status_code=404, detail="user not found")
        
    user.hashed_password = get_hashed_password(data.new_password)
    db.commit()
    
    create_audit_log(db, user_id=user.id, action="Reset password successfully")
    
    return {"msg": "password reset successfully"}