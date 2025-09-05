from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class GlobalSettingsUpdate(BaseModel):
    working_hours: Optional[str] = None
    leave_policy: Optional[str] = None
    access_control_policy: Optional[str] = None

class GlobalSettingsResponse(BaseModel):
    id: int
    working_hours: Optional[str] = None
    leave_policy: Optional[str] = None
    access_control_policy: Optional[str] = None

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    timestamp: datetime

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_employees: int
    total_projects: int
    total_leaves: int
    pending_actions: int

class HealthMetrics(BaseModel):
    status: str
    database: str
    uptime_seconds: float
