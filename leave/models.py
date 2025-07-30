from sqlalchemy import Column, String, Integer, Boolean, Date, ForeignKey , Enum
from database import Base
import enum

class LeaveType(enum.Enum):
    sick = "sick"
    casual = "casual"
    privilege = "privilege"
    wfh= "wfh"

class LeaveStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected="rejected"

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer,ForeignKey("employees.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    leave_type = Column(Enum(LeaveType))
    reason = Column(String)
    status = Column(Enum(LeaveStatus), default=LeaveStatus.pending)
    approver_level = Column(String, default="manager")


class Holiday(Base):
    __tablename__ = "holidays"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    date = Column(Date)
    department = Column(String, nullable=True)