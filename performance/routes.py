from fastapi import APIRouter, Depends, HTTPException
from typing import List
from .models import PerformanceCycle, Goal, Feedback
from .schemas import CycleCreate, GoalCreate, GoalOut, FeedBackCreate, FeedBackSummary
from database import db_dependency
from .utils import generate_review_pdf
import statistics
from fastapi.responses import FileResponse
import os

router = APIRouter(prefix="/reviews", tags=["Performance_review"])
@router.post("/create-cycle")
def create_cycle(cycle : CycleCreate, db: db_dependency):
    new_cycle = PerformanceCycle(**cycle.model_dump())
    db.add(new_cycle)
    db.commit()
    return new_cycle

@router.post("/goals")
def set_goals(goal: GoalCreate, db: db_dependency):
    new_goal = Goal(**goal.model_dump())
    db.add(new_goal)
    db.commit()
    return new_goal

@router.get("/goals/{employee_id}", response_model=List[GoalOut])
def get_goals(employee_id: int, db: db_dependency):
    return db.query(Goal).filter(Goal.employee_id == employee_id).all()

@router.post("/submit")
def submit_feedback(feedback: FeedBackCreate, db: db_dependency):
    entry = Feedback(**feedback.model_dump())
    db.add(entry)
    db.commit()
    return entry

@router.get("/summary/{employee_id}", response_model=FeedBackSummary)
def review_summary(employee_id: int, db: db_dependency):
    feedbacks = db.query(Feedback).filter(Feedback.employee_id == employee_id).all()
    if not feedbacks:
        raise HTTPException(status_code=404, detail="no feedback found")
    ratings = [fb.rating for fb in feedbacks]
    comments = [fb.comments for fb in feedbacks]
    return {
        "employee_id": employee_id,
        "average_rating": statistics.mean(ratings),
        "feedback_count": len(ratings),
        "comments": comments
    }

@router.get("/export", response_class=FileResponse)
def export_reviews(employee_id: int, db: db_dependency):
    feedbacks = db.query(Feedback).filter(Feedback.employee_id == employee_id).all()
    goals = db.query(Goal).filter(Goal.employee_id == employee_id).all()
    file_path = generate_review_pdf(employee_id, goals, feedbacks)

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=os.path.basename(file_path),
    )