from celery_worker import celery_app
from .crud import create_notification
from .websocket_manager import manager
from database import SessionLocal
import asyncio

@celery_app.task(name="notification.tasks.trigger_notification")
def trigger_notification(user_id: int, title: str, message: str):
    db = SessionLocal()
    try:
        from .schemas import NotificationCreate
        
        notif_data = NotificationCreate(
            user_id=user_id,
            title=title,
            message=message
        )
        
        notif = create_notification(db, notif_data)
        
        notif_dict = {
            "id": notif.id,
            "user_id": notif.user_id,
            "title": notif.title,
            "message": notif.message,
            "is_read": notif.is_read,
            "created_at": notif.created_at.isoformat(),
        }
        
        asyncio.run(manager.send_personal_notification(user_id, notif_dict))
        
        return {"status": "sent", "notification_id": notif.id}
        
    finally:
        db.close()