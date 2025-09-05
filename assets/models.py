from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, DateTime
from database import Base
from datetime import datetime, timezone

class Assets(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    serial_number = Column(String, unique=True, nullable=False)
    assigned_to = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    assigned_on = Column(DateTime, default=datetime.now(timezone.utc))
    returned = Column(Boolean, default=False)

class AssetRequest(Base):
    __tablename__ = "asset_requests"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    asset_type = Column(String, nullable=False)
    reason = Column(String)
    status = Column(String, default="pending")  
    created_at = Column(DateTime, default=datetime.now(timezone.utc))

class AssetAuditLog(Base):
    __tablename__ = "asset_audit_logs"
    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"))
    user_id = Column(Integer)
    action = Column(String)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc))