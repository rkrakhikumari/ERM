from fastapi import WebSocket
from typing import Dict, List
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")
        
    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
                logger.info(f"User {user_id} disconnected")
                
    async def send_personal_notification(self, user_id: int, notification: dict):
        logger.info(f"Attempting to send notification to user {user_id}: {notification.get('title', 'No title')}")
        
        if user_id not in self.active_connections:
            logger.warning(f"User {user_id} not connected to WebSocket")
            return False
            
        message = json.dumps(notification)
        disconnected = []
        sent_count = 0
        
        for connection in self.active_connections[user_id]:
            try:
                await connection.send_text(message)
                sent_count += 1
                logger.info(f"Notification sent to user {user_id} connection")
            except Exception as e:
                logger.error(f"Error sending to user {user_id}: {e}")
                disconnected.append(connection)
                
        for conn in disconnected:
            self.disconnect(conn, user_id)
            
        logger.info(f"Sent notification to {sent_count} connections for user {user_id}")
        return sent_count > 0
        
    def get_connection_count(self, user_id: int = None):
        """Get connection count"""
        if user_id:
            return len(self.active_connections.get(user_id, []))
        return sum(len(connections) for connections in self.active_connections.values())

manager = ConnectionManager()