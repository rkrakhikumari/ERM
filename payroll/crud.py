from sqlalchemy.orm import Session
from .models import SalaryStructure
from .schemas import SalaryStructureCreate

def create_salary_structure(db: Session,data: SalaryStructureCreate):
    existing = db.query(SalaryStructure).filter_by(employee_id = data.employee_id).first()
    if existing:
        for key, value in data.model_dump().items():
            setattr(existing, key, value)

        db.commit()
        return existing
    
    structure = SalaryStructure(**data.model_dump())
    db.add(structure)
    return structure

def get_salary_structure(db: Session, employee_id: int):
    return db.query(SalaryStructure).filter_by(employee_id=employee_id).first()

