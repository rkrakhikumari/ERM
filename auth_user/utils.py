from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from database import db_dependency
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta, timezone, datetime
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS, REFRESH_SECRET_KEY
from auth_user.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto" )

def get_hassed_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict,expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({'exp':expire})
    return jwt.encode(to_encode, SECRET_KEY, ALGORITHM)

def create_refresh_token(data: dict,expires_days: int = REFRESH_TOKEN_EXPIRE_DAYS):
    expire = datetime.now(timezone.utc) +timedelta(days=expires_days)
    data.update({"exp":expire})
    return jwt.encode(data,REFRESH_SECRET_KEY, ALGORITHM)


def get_current_user(db:db_dependency ,token: str = Depends(oauth2_scheme)):
    print("hello")
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    email = payload.get("sub")
    if not email:
        raise credentials_exception
    user = db.query(User).filter(User.email==email).first()
    if user is None:
        raise credentials_exception
    return user
    

