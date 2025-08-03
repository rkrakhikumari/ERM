from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from typing import List

from . import schemas, crud
from database import get_db
from auth_user.utils import get_current_user  
from celery_worker import send_notification_task
from .websocket_manager import manager

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

@router.get("/me", response_model=List[schemas.NotificationOut])
def get_my_notifications(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return crud.get_user_notifications(db, current_user["id"])

@router.post("/send", status_code=202)
def send_notification(payload: schemas.NotificationCreate):
    send_notification_task.delay(payload.dict())
    return JSONResponse(content={"message": "Notification queued"}, status_code=202)

@router.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)
