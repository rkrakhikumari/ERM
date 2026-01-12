from sqlalchemy.orm import Session # type: ignore
from .models import GlobalSettings, AuditLog
from datetime import datetime, timezone
from sqlalchemy.exc import SQLAlchemyError # type: ignore
from sqlalchemy import text # type: ignore

def get_global_settings(db: Session):
    settings = db.query(GlobalSettings).first()
    if not settings:
        settings = GlobalSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def update_global_settings(db: Session, update: dict):
    settings = db.query(GlobalSettings).first()
    if not settings:
        settings = GlobalSettings()
        db.add(settings)
    
    for key, value in update.items():
        setattr(settings, key, value)
    
    db.commit()
    db.refresh(settings)
    return settings

def get_audit_logs(db: Session, limit: int = 100):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()

def create_audit_log(db: Session, user_id: int, action: str):
    log = AuditLog(user_id=user_id, action=action, timestamp=datetime.now(timezone.utc))
    db.add(log)
    db.commit()
    db.refresh(log)
    print("Audit log committed successfully.")

def get_dashboard_stats(db: Session):
    employee_count = db.execute(text("SELECT COUNT(*) FROM employees")).scalar()
    leave_count = db.execute(text("SELECT COUNT(*) FROM leave_requests")).scalar()
    project_count = db.execute(text("SELECT COUNT(*) FROM projects")).scalar()
    pending_actions = db.execute(text("SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'")).scalar()

    return {
        "total_employees": employee_count or 0,
        "total_leaves": leave_count or 0,
        "total_projects": project_count or 0,
        "pending_actions": pending_actions or 0
    }
    
def check_db_health(db: Session):
    try:
        db.execute(text("SELECT 1"))
        return "reachable"
    except SQLAlchemyError:
        return "error"
