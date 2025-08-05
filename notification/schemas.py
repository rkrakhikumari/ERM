from pydantic import BaseModel
from datetime import datetime

class NotificationBase(BaseModel):
    title : str
    message : str

class NotificationCreate(NotificationBase):
    user_id : int

class NotificationOut(NotificationBase):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True  # Changed from orm_mode = True