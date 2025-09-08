from fastapi import APIRouter, Depends, HTTPException, status,Request 
from sqlalchemy.orm import Session
from database import db_dependency 
from auth_user.utils import get_current_user 
from .schemas import DashboardStats, GlobalSettingsResponse, GlobalSettingsUpdate, AuditLogResponse, HealthMetrics
from .crud import get_dashboard_stats, get_global_settings, update_global_settings, get_audit_logs, create_audit_log, check_db_health
from auth_user.models import User 
from auth_user.utils import create_access_token 
import time
from typing import List

router = APIRouter(prefix="/admin", tags=["Admin APIs"])
start_time = time.time()

def get_current_admin_user(user: User = Depends(get_current_user)):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Access denied. Only administrators can perform this action.")
    return user

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(db: db_dependency, user: User = Depends(get_current_admin_user)):
    return get_dashboard_stats(db)

@router.get("/settings", response_model=GlobalSettingsResponse)
def get_settings(request: Request, db: db_dependency, user: User = Depends(get_current_admin_user)):
    try:
        settings = get_global_settings(db)
        if settings is None:
            raise HTTPException(status_code=404, detail="Global settings not found.")
        return settings
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Something went wrong.")

    
@router.put("/settings", response_model=GlobalSettingsResponse)
def update_settings(payload: GlobalSettingsUpdate, db: db_dependency, user: User = Depends(get_current_admin_user)):
    create_audit_log(db, user_id=user.id, action="Updated global settings")
    return update_global_settings(db, payload.model_dump(exclude_unset=True))

@router.get("/logs", response_model=List[AuditLogResponse])
def get_logs(db: db_dependency, user: User = Depends(get_current_admin_user)):
    return get_audit_logs(db)

@router.post("/impersonate/{user_id}")
def impersonate_user(user_id: int, db: db_dependency, user: User = Depends(get_current_admin_user)):
    impersonated_user = db.query(User).filter(User.id == user_id).first()
    if not impersonated_user:
        raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found.")

    create_audit_log(db, user_id=user.id, action=f"Impersonated user with ID: {impersonated_user.id} ({impersonated_user.email})")

    impersonation_payload = {
        "sub": str(impersonated_user.id),
        "username": impersonated_user.username,
        "email": impersonated_user.email,
        "role": impersonated_user.role,
        "impersonator_id": user.id  
    }
    
    new_token = create_access_token(impersonation_payload)

    return {
        "message": f"Successfully impersonated user {impersonated_user.username}. Redirecting...",
        "access_token": new_token,
        "token_type": "bearer"
    }
@router.get("/metrics", response_model=HealthMetrics)
def get_metrics(db: db_dependency, user: User = Depends(get_current_admin_user)):
    uptime = time.time() - start_time
    db_status = check_db_health(db)
    status = "ok" if db_status == "reachable" else "degraded"
    return HealthMetrics(
        status=status,
        database=db_status,
        uptime_seconds=uptime
    )
