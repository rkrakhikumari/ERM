from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from datetime import datetime , timezone
from sqlalchemy.orm import relationship
from database import Base
from auth_user.models import User


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))    
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    user = relationship("User", back_populates="notifications")

