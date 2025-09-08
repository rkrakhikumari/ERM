from pydantic import BaseModel
from typing import List
from datetime import date, datetime

class CycleCreate(BaseModel):
    name : str
    start_date : date
    end_date : date

class GoalCreate(BaseModel):
    employee_id: int
    cycle_id : int
    title : str
    description : str
    weight : float

class GoalOut(GoalCreate):
    id : int
    created_at : datetime

class FeedBackCreate(BaseModel):
    reviewer_id: int
    employee_id : int
    cycle_id : int
    role : str
    comments : str
    rating : float
class FeedBackSummary(BaseModel):
    employee_id : int
    average_rating : float
    feedback_count : int
    comments : List[str]
