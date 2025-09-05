from sqlalchemy import Column, String, Integer, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
from database import Base
import enum

class EmploymentStatus(enum.Enum):
    active = "active"
    terminated = "terminated"
    resigned = "resigned"

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    department = Column(String)
    designation = Column(String)
    manager_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=True)
    status = Column(Enum(EmploymentStatus), default=EmploymentStatus.active)
    date_joined = Column(Date)
    projects = relationship("Project", secondary="project_employees", back_populates="team_members")
    team_memberships = relationship("TeamMember", back_populates="employee")

class History(Base):
    __tablename__ = "history"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"))
    action = Column(String)
    from_value = Column(String)
    to_value = Column(String)
    date = Column(Date)
