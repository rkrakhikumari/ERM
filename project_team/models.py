from sqlalchemy import Column, String, Integer, ForeignKey, Text, Enum, Date, Table # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from database import Base
import enum
class TaskStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    blocked = "blocked"

project_employees = Table(
    'project_employees',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id', ondelete="CASCADE"), primary_key=True),
    Column('employee_id', Integer, ForeignKey('employees.id', ondelete="CASCADE"), primary_key=True)
)

project_teams = Table(
    'project_teams',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id', ondelete="CASCADE"), primary_key=True),
    Column('team_id', Integer, ForeignKey('teams.id', ondelete="CASCADE"), primary_key=True)
)

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    start_date = Column(Date)
    end_date = Column(Date)
    
    tasks = relationship("Task", back_populates="project")
    team_members = relationship("Employee", secondary=project_employees, back_populates="projects")
    assigned_teams = relationship("Team", secondary=project_teams, back_populates="assigned_projects")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(Enum(TaskStatus), default=TaskStatus.pending)
    
    # Relationships
    project = relationship("Project", back_populates="tasks")

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    manager_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    manager = relationship("Employee", foreign_keys=[manager_id])
    members = relationship("TeamMember", back_populates="team")
    assigned_projects = relationship("Project", secondary=project_teams, back_populates="assigned_teams")

class TeamMember(Base):
    __tablename__ = "team_members"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"))
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"))
    
    # Relationships
    team = relationship("Team", back_populates="members")
    employee = relationship("Employee")