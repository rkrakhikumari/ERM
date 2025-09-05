from sqlalchemy.orm import Session # type: ignore
from sqlalchemy import select # type: ignore
from .models import Employee, History
from .schemas import EmployeeCreate, EmployeeUpdate
from datetime import date
from payroll.models import SalaryStructure

def create_employee(db: Session, employee_data: EmployeeCreate):
    new_employee = Employee(**employee_data.model_dump())
    db.add(new_employee)
    db.commit()
    return new_employee

def get_employees(db: Session, employee_id: int):
    return db.query(Employee).filter(Employee.id==employee_id).first()

def get_all_employees(db: Session, department: str=None, status: str=None):
    query = db.query(Employee)
    if department:
        query = query.filter(Employee.department == department)
    if status:
        query = query.filter(Employee.status == status)
    return query.all()

def update_employees(db: Session, employee_id : int, updates: EmployeeUpdate):
    employee= db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        return None
    
    update_data = updates.model_dump(exclude_unset=True)

    if "department" in update_data and update_data["department"] != employee.department:
        history = History(employee_id = employee.id, action = "transfer", from_value= employee.department, to_value=update_data["department"], date= date.today())
        db.add(history)

    if "designation" in update_data and update_data["designation"] !=employee.designation:
        history = History(employee_id=employee.id, action="promotion", from_value=employee.designation, to_value=update_data["designation"],date=date.today())
        db.add(history)

    for key , value in update_data.items():
        setattr(employee, key, value)
    db.commit()
    return employee

def delete_employees(db: Session, employee_id: int):
    subordinates = db.query(Employee).filter(Employee.manager_id == employee_id).all()
    for emp in subordinates:
        emp.manager_id = None

    db.query(SalaryStructure).filter(SalaryStructure.employee_id == employee_id).delete()

    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if employee:
        db.delete(employee)
        db.commit()
        return True
    return False



def get_employe_history(db: Session, employee_id: int):
    return db.query(History).filter(History.employee_id == employee_id).all()
