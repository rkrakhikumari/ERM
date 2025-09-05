from sqlalchemy import Column, String, Boolean # type: ignore
from database import Base
from sqlalchemy.orm import relationship # type: ignore
import uuid

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Employee")
    is_active = Column(Boolean, default=True)
    notifications = relationship("Notification", back_populates="user", cascade="all, delete")
