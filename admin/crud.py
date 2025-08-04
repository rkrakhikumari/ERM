from sqlalchemy.orm import Session
from .models import GlobalSettings, AuditLog
from datetime import datetime
from sqlalchemy import func
from sqlalchemy import text

def get_global_settings(db: Session):
    return db.query(GlobalSettings).first()

def update_global_settings(db: Session, update: dict):
    settings = db.query(GlobalSettings).first()
    if not settings:
        settings = GlobalSettings()
        db.add(settings)
    for key, value in update.items():
        setattr(settings, key, value)
    db.commit()
    return settings

def get_audit_logs(db: Session, limit: int=100):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()

def create_audit_log(db: Session, user_id: int, action : str):
    log = AuditLog(user_id=user_id, action=action, timestamp = datetime.now())
    db.add(log)
    db.commit()

def get_dashboard_stats(db: Session):
    employee_count = db.execute(text("SELECT COUNT(*) FROM employees")).scalar()
    leave_count = db.execute(text("SELECT COUNT(*) FROM leave_requests")).scalar()
    project_count = db.execute(text("SELECT COUNT(*) FROM projects")).scalar()
    pending_actions = db.execute(text("SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'")).scalar()
    return {
        "total_employees": employee_count,
        "total_projects": project_count,
        "total_leaves": leave_count,
        "pending_actions": pending_actions, 
    }
