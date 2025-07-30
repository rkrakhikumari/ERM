from sqlalchemy.orm import Session
from .models import SalaryStructure
from .schemas import SalaryStructureCreate
from uuid import UUID
import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

def calculate_net_salary(structure: SalaryStructure):
    total_earnings = structure.basic + structure.hra + structure.bonus
    total_deductions = structure.deduction
    net_pay = total_earnings - total_deductions
    return total_earnings, total_deductions, net_pay

def generate_payslip_file(employee_id: int, month: str, year: int, net_pay: float) -> str:
    folder = "payslips"
    os.makedirs(folder, exist_ok=True)

    filename = f"{employee_id}_{month}_{year}.pdf"
    filepath = os.path.join(folder, filename)

    c = canvas.Canvas(filepath)
    c.drawString(50, 800, f"Payslip for Employee ID: {employee_id}")
    c.drawString(50, 780, f"Month: {month} {year}")
    c.drawString(50, 760, f"Net Pay: {net_pay}")
    c.save()

    return filepath