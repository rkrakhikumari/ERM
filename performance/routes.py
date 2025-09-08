from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from .models import PerformanceCycle, Goal, Feedback
from .schemas import CycleCreate, GoalCreate, GoalOut, FeedBackCreate, FeedBackSummary
from database import db_dependency
from .utils import generate_review_pdf
import statistics
from fastapi.responses import FileResponse
import os
from auth_user.utils import get_current_user
from auth_user.models import User
from emply_mng.models import Employee
from admin.crud import create_audit_log

router = APIRouter(prefix="/reviews", tags=["Performance_review"])

@router.post("/create-cycle")
def create_cycle(cycle: CycleCreate, db: db_dependency, user: User = Depends(get_current_user)):
    if user.role.lower() not in ["admin", "hr"]:
        create_audit_log(db, user_id=user.id, action=f"Unauthorized attempt to create a performance cycle.")
        raise HTTPException(status_code=403, detail="Only admins or HR can create a performance cycle.")
        
    new_cycle = PerformanceCycle(**cycle.model_dump())
    db.add(new_cycle)
    db.commit()
    db.refresh(new_cycle)
    create_audit_log(db, user_id=user.id, action=f"Created new performance cycle: {new_cycle.name}.")
    return new_cycle

@router.post("/goals")
def set_goals(goal: GoalCreate, db: db_dependency, user: User = Depends(get_current_user)):
    # Assuming only managers/admins/HR can set goals for others
    if user.id != goal.employee_id and user.role.lower() not in ["admin", "hr", "manager"]:
        create_audit_log(db, user_id=user.id, action=f"Unauthorized attempt to set goals for employee ID {goal.employee_id}.")
        raise HTTPException(status_code=403, detail="Not authorized to set goals for this employee.")
        
    new_goal = Goal(**goal.model_dump())
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    create_audit_log(db, user_id=user.id, action=f"Set a new goal for employee ID {new_goal.employee_id}.")
    return new_goal

@router.get("/goals/{employee_id}", response_model=List[GoalOut])
def get_goals(employee_id: int, db: db_dependency, user: User = Depends(get_current_user)):
    create_audit_log(db, user_id=user.id, action=f"Viewed goals for employee ID {employee_id}.")
    return db.query(Goal).filter(Goal.employee_id == employee_id).all()

@router.post("/submit")
def submit_feedback(feedback: FeedBackCreate, db: db_dependency, user: User = Depends(get_current_user)):
    # Assuming a manager/admin can submit feedback
    if user.id == feedback.employee_id:
        create_audit_log(db, user_id=user.id, action=f"Unauthorized attempt to submit feedback for self.")
        raise HTTPException(status_code=403, detail="Cannot submit feedback for yourself.")

    entry = Feedback(**feedback.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    create_audit_log(db, user_id=user.id, action=f"Submitted feedback for employee ID {entry.employee_id}.")
    return entry

@router.get("/summary/{employee_id}", response_model=FeedBackSummary)
def review_summary(employee_id: int, db: db_dependency, user: User = Depends(get_current_user)):
    if user.role.lower() not in ["admin", "hr", "manager"] and user.id != employee_id:
        create_audit_log(db, user_id=user.id, action=f"Unauthorized attempt to view review summary for employee ID {employee_id}.")
        raise HTTPException(status_code=403, detail="Not authorized to view this review summary.")

    feedbacks = db.query(Feedback).filter(Feedback.employee_id == employee_id).all()
    if not feedbacks:
        create_audit_log(db, user_id=user.id, action=f"Failed to retrieve review summary for employee ID {employee_id}: No feedback found.")
        raise HTTPException(status_code=404, detail="no feedback found")
        
    create_audit_log(db, user_id=user.id, action=f"Viewed review summary for employee ID {employee_id}.")
    
    ratings = [fb.rating for fb in feedbacks]
    comments = [fb.comments for fb in feedbacks]
    return {
        "employee_id": employee_id,
        "average_rating": statistics.mean(ratings),
        "feedback_count": len(ratings),
        "comments": comments
    }

@router.get("/cycles")
def get_cycles(db: db_dependency, user: User = Depends(get_current_user)):
    create_audit_log(db, user_id=user.id, action="Viewed all performance cycles.")
    return db.query(PerformanceCycle).all()

@router.get("/export", response_class=FileResponse)
def export_reviews(employee_id: int, db: db_dependency, user: User = Depends(get_current_user)):
    # Add an authorization check for exporting sensitive documents
    if user.id != employee_id and user.role.lower() not in ["admin", "hr", "manager"]:
        create_audit_log(db, user_id=user.id, action=f"Unauthorized attempt to export review for employee ID {employee_id}.")
        raise HTTPException(status_code=403, detail="Not authorized to export this review.")

    feedbacks = db.query(Feedback).filter(Feedback.employee_id == employee_id).all()
    goals = db.query(Goal).filter(Goal.employee_id == employee_id).all()
    
    if not feedbacks and not goals:
        create_audit_log(db, user_id=user.id, action=f"Failed to export review for employee ID {employee_id}: No data found.")
        raise HTTPException(status_code=404, detail="No review data found to export.")

    file_path = generate_review_pdf(employee_id, goals, feedbacks)
    create_audit_log(db, user_id=user.id, action=f"Exported review summary for employee ID {employee_id}.")
    
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=os.path.basename(file_path),
    )