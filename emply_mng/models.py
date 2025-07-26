from sqlalchemy import Column, String, Integer, ForeignKey, Enum, Date
from database import Base
from sqlalchemy.orm import relationship
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
    manager_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    status = Column(Enum(EmploymentStatus), default=EmploymentStatus.active)
    date_joined = Column(Date)

    manager = relationship("Employee", remote_side=[id])
    history = relationship("History", back_populates="employee")

class History(Base):
    __tablename__ = "history"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    action = Column(String)
    from_value = Column(String)
    to_value = Column(String)
    date = Column(Date)

    employee = relationship("Employee",)