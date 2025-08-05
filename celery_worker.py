from celery import Celery
from sqlalchemy.orm import Session
from database import SessionLocal
from notification import crud
from notification.schemas import NotificationCreate

celery_app = Celery(
    "notification_tasks",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0"
)

@celery_app.task
def send_notification_task(data: dict):
    db: Session = SessionLocal()
    try:
        notif = crud.create_notification(db, NotificationCreate(**data))
        
        return {"status": "success", "notification_id": notif.id}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        db.close()