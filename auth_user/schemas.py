from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password : str
    full_name : Optional[str] = None

class UserOut(BaseModel):
    id : str
    email : EmailStr
    full_name : Optional[str]
    role : str
    is_active : bool

class UserLogin(BaseModel):
    email : EmailStr
    password : str

class Token(BaseModel):
    access_token : str
    refresh_token : str
    token_type : str

class TokenData(BaseModel):
    email: Optional[str]=None


class UpdateRole(BaseModel):
    full_name: Optional[str]=None
    role : Optional[str]=None
    