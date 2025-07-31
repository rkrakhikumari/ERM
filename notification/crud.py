from sqlalchemy.orm import Session
from .models import Notification
from .schemas import NotificationCreate

def create_notification(db: Session, notif: NotificationCreate):
    new = Notification(**notif.model_dump())
    db.add(new)
    db.commit()
    return new

def get_user_notification(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id==user_id).order_by(Notification.created_at.desc()).all()

    