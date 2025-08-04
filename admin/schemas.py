from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GlobalSettingsUpdate(BaseModel):
    working_hours: Optional[str]
    leave_policy: Optional[str]
    access_control_policy: Optional[str]

class GlobalSettingsResponse(GlobalSettingsUpdate):
    id: int

class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    timestamp: datetime

class DashboardStats(BaseModel):
    total_employees: int
    total_projects: int
    total_leaves: int
    pending_actions: int

class HealthMetrics(BaseModel):
    status: str
    database: str
    uptime_seconds: float
