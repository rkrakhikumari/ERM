from fastapi import APIRouter, HTTPException
from auth_user.schemas import *
from auth_user.utils import get_hassed_password, verify_password, create_access_token, create_refresh_token
from auth_user.models import User
from config import REFRESH_SECRET_KEY, ALGORITHM
import jwt 
from database import db_dependency


router = APIRouter(prefix="/auth")

@router.post('/register', response_model = UserOut)
def register(user: UserCreate, db: db_dependency):
    existing = db.query(User).filter(User.email== user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="email alredy exist")
    new_user = User(email = user.email,full_name = user.full_name,hashed_password = get_hassed_password(user.password))
    db.add(new_user)
    db.commit()
    return new_user


@router.post('/login', response_model=Token)
def login(user: UserLogin, db: db_dependency):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invlid credential")
    access_token = create_access_token({"sub": db_user.email})
    refresh_token = create_refresh_token({"sub":db_user.email})
    return {"access_token": access_token, "refresh_token": refresh_token,"token_type": "bearer"}


@router.post('/refresh', response_model=Token)
def refresh_token(token: str):
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, ALGORITHM)
        email = payload.get("sub")
        access_token = create_access_token({"sub":email})
        new_refresh_token = create_refresh_token({"sub": email})
        return {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}

    except:
        raise HTTPException(status_code=401, detail="invalid refresh token")

blacklist = set()

@router.post('/logout')
def logout():
    blacklist.add(refresh_token)

    return {"msg":"logout done"}
    