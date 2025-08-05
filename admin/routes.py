from fastapi import APIRouter
from .schemas import GlobalSettingsResponse, GlobalSettingsUpdate, AuditLogResponse, DashboardStats, HealthMetrics
from .crud import get_audit_logs, get_dashboard_stats, update_global_settings
from database import db_dependency
import time

router = APIRouter(prefix="/admin", tags=["admin"])

start_time = time.time()

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(db: db_dependency):
    return get_dashboard_stats(db)

@router.put("/settings", response_model=GlobalSettingsResponse)
def update_settings(payload: GlobalSettingsUpdate, db: db_dependency):
    return update_global_settings(db, payload.model_dump(exclude_unset=True))

@router.get("/logs", response_model=list[AuditLogResponse])
def get_logs(db: db_dependency):
    return get_audit_logs(db)

@router.post("/impersonate/{user_id}")
def impersonate_user(user_id: int):
    return {"msg": f" now impersonating user with id {user_id}"}

@router.get("/metrics", response_model=HealthMetrics)
def get_metrics():
    uptime = time.time() - start_time
    try:
        status = "ok"
        db_status = "reachable"
    except:
        db_status = "error"
        status = "degraded"
    return HealthMetrics(
        status = status,
        database = db_status, 
        uptime_seconds=uptime

    )
