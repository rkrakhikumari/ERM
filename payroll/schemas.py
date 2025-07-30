from pydantic import BaseModel
from typing import Optional
from datetime import date

class SalaryStructureCreate(BaseModel):
    employee_id : int
    basic : float
    hra : float
    bonus : Optional[float] = 0.0
    deduction : Optional[float] = 0.0

class SalaryStructureOut(SalaryStructureCreate):
    id: int

class PayrollOut(BaseModel):
    id: int
    employee_id : int
    month : str
    year : int
    generated_on : date
    total_earnings : float
    total_deductions: float
    net_pay : float
    is_paid : bool
    payslip_path: Optional[str] = None


    