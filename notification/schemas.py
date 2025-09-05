from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationBase(BaseModel):
    title: str
    message: str

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None

class NotificationOut(NotificationBase):
    id: int
    is_read: bool
    created_at: datetime
    user_id: int
    
    class Config:
        from_attributes = True