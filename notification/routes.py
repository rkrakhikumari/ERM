from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from auth_user.models import User
from typing import List
from .schemas import NotificationCreate, NotificationOut, NotificationUpdate
from .crud import (
    get_user_notification, 
    create_notification,
    mark_notification_as_read, 
    delete_notification, 
    mark_all_as_read
)
from database import db_dependency, SessionLocal
from auth_user.utils import get_current_user, verify_token
from .websocket_manager import manager
import asyncio
import logging
import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/me", response_model=List[NotificationOut])
def get_my_notifications(
    db: db_dependency, 
    current_user: dict = Depends(get_current_user)
):
    return get_user_notification(db, current_user.id)

@router.patch("/{notification_id}", response_model=NotificationOut)
def update_notification(
    notification_id: int,
    update_data: NotificationUpdate,
    db: db_dependency,
    current_user: User = Depends(get_current_user)
):
    notification = mark_notification_as_read(db, notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.delete("/{notification_id}")
def delete_user_notification(
    notification_id: int,
    db: db_dependency,
    current_user: User = Depends(get_current_user)
):
    success = delete_notification(db, notification_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted successfully"}

@router.post("/mark-all-read")
def mark_all_notifications_read(
    db: db_dependency,
    current_user: User = Depends(get_current_user)
):
    updated_count = mark_all_as_read(db, current_user.id)
    return {"message": f"Marked {updated_count} notifications as read"}

async def send_notification_direct(user_id: int, title: str, message: str):
    """Send notification directly without Celery"""
    db = SessionLocal()
    try:
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
        
        await manager.send_personal_notification(user_id, notif_dict)
        
        return notif_dict
        
    except Exception as e:
        logger.error(f"Error sending notification: {e}")
        raise
    finally:
        db.close()

@router.post("/test")
async def send_test_notification(
    background_tasks: BackgroundTasks,
    db: db_dependency,
    current_user: User = Depends(get_current_user)
):
    """Send a test notification to current user"""
    try:
        notif_data = await send_notification_direct(
            user_id=current_user.id,
            title="🔔 Test Notification",
            message=f"Hello {current_user.full_name or current_user.email}! This is a test notification to verify your system is working perfectly."
        )
        
        return {
            "message": "Test notification sent successfully",
            "notification": notif_data
        }
    except Exception as e:
        logger.error(f"Error in test notification: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send-to-user/{user_id}")
async def send_notification_to_user(
    user_id: int,
    title: str,
    message: str,
    db: db_dependency,
    current_user: User = Depends(get_current_user)
):
    """Send notification to specific user (admin only)"""
    try:
        notif_data = await send_notification_direct(user_id, title, message)
        return {
            "message": f"Notification sent to user {user_id}",
            "notification": notif_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket):
    token = websocket.query_params.get("token")
    user_id = None
    
    if not token:
        logger.error("WebSocket: No token provided")
        await websocket.close(code=1008)
        return

    try:
        payload = verify_token(token)
        user_email = payload.get("sub")
        if not user_email:
            logger.error("WebSocket: No email in token")
            await websocket.close(code=1008)
            return
            
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.email == user_email).first()
            if not user:
                logger.error(f"WebSocket: User not found for email {user_email}")
                await websocket.close(code=1008)
                return
            user_id = user.id
            logger.info(f"WebSocket: User {user_id} ({user_email}) authenticated")
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"WebSocket auth error: {e}")
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id)
    
    try:
        await websocket.send_text(json.dumps({
            "type": "connection",
            "message": "Connected to notifications",
            "user_id": user_id
        }))
        
        while True:
            await asyncio.sleep(30)
            try:
                await websocket.send_text(json.dumps({"type": "ping"}))
            except:
                break
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket: User {user_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
    finally:
        if user_id:
            manager.disconnect(websocket, user_id)