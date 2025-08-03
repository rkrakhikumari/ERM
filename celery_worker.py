from celery import Celery
from sqlalchemy.orm import Session
from database import SessionLocal
from notification import crud
from notification.schemas import NotificationCreate
from notification.websocket_manager import manager

celery_app = Celery(
    "notification_tasks",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0"
)

@celery_app.task
def send_notification_task(data: dict):
    db: Session = SessionLocal()
    notif = crud.create_notification(db, NotificationCreate(**data))
    import asyncio
    loop = asyncio.get_event_loop()
    loop.create_task(manager.broadcast(f"🔔 {notif.title}: {notif.message}"))
    return True
