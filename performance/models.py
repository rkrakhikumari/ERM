from sqlalchemy import Column, String, Integer, Date, ForeignKey,DateTime ,Text, Float
from database import Base
import enum
from datetime import datetime, timezone

class ReviewStatusEnum(str, enum.Enum):
    pending = "pending"
    submitted = "submitted"
    completed = "completed"

class PerformanceCycle(Base):
    __tablename__ = "performance_cycles"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)    
    created_at = Column(DateTime, default=datetime.now(timezone.utc))

class Goal(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer,ForeignKey("employees.id"),nullable=False)
    cycle_id = Column(Integer, ForeignKey("performance_cycles.id"))
    title = Column(String)
    description = Column(Text)
    weight = Column(Float)
    created_at = Column(DateTime,  default=datetime.now(timezone.utc))


class Feedback(Base):
    __tablename__ = "feedbacks"
    id = Column(Integer, primary_key=True)
    reviewer_id = Column(Integer, nullable=False)
    employee_id = Column(Integer, nullable=False)
    cycle_id = Column(Integer, ForeignKey("performance_cycles.id"))
    role = Column(String)
    comments = Column(Text)
    rating = Column(Float)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))