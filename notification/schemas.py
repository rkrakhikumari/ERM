from pydantic import BaseModel
from datetime import datetime

class NotificationBase(BaseModel):
    title : str
    message : str

class NotificationCreate(NotificationBase):
    user_id : int

class NotificationOut(NotificationBase):
    id : int
    is_read : bool
    created_at : datetime

