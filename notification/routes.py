from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from typing import List
from .schemas import  NotificationCreate, NotificationOut
from .crud import get_user_notification
from database import db_dependency
from auth_user.utils import get_current_user  
from celery_worker import send_notification_task
from .websocket_manager import manager
from auth_user.models import User

router = APIRouter(prefix="/notifications",tags=["Notifications"])

@router.get("/me", response_model=List[NotificationOut])
def get_my_notifications(db: db_dependency, current_user: User = Depends(get_current_user)):
    return get_user_notification(db, current_user.id)

@router.post("/send", status_code=202)
def send_notification(payload: NotificationCreate):
    send_notification_task.delay(payload.model_dump())
    return JSONResponse(content={"message": "Notification queued"}, status_code=202)

@router.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text() 
    except WebSocketDisconnect:
        manager.disconnect(websocket)
