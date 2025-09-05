from sqlalchemy.orm import Session
from .models import Notification
from .schemas import NotificationCreate

def create_notification(db: Session, notif: NotificationCreate):
    new = Notification(**notif.model_dump())
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

def get_user_notification(db: Session, user_id: int):
    return db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).all()

def mark_notification_as_read(db: Session, notification_id: int, user_id: int):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if notification:
        notification.is_read = True
        db.commit()
        db.refresh(notification)
    return notification

def delete_notification(db: Session, notification_id: int, user_id: int):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if notification:
        db.delete(notification)
        db.commit()
        return True
    return False

def mark_all_as_read(db: Session, user_id: int):
    updated = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({Notification.is_read: True})
    db.commit()
    return updated