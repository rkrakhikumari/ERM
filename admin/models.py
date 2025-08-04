from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class GlobalSettings(Base):
    __tablename__ = "global_settings"
    id = Column(Integer, primary_key=True)
    working_hours = Column(String, default = "9:00-18:00")
    leave_policy = Column(Text)
    access_control_policy = Column(Text)

class AuditLog(Base):
    __tablename__ = "audit_log"
    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    action = Column(String, index=True)
    timestamp = Column(DateTime, default=func.now(), index=True)

