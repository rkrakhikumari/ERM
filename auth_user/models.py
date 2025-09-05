from sqlalchemy import Column, String, Boolean, Integer # type: ignore
from database import Base
from sqlalchemy.orm import relationship # type: ignore

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Employee")
    is_active = Column(Boolean, default=True)
    notifications = relationship("Notification", back_populates="user", cascade="all, delete")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete")