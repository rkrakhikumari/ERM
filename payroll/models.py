from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import date

class SalaryStructure(Base):
    __tablename__="salary_structures"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    basic = Column(Float)
    hra = Column(Float)
    bonus = Column()
    deduction = Column(Float)


class Payroll(Base):
    __tablename__ = "payroll"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    month = Column(String)
    year = Column(Integer)
    generated_on = Column(Date,default=date.today)
    total_earnings = Column(Float)
    total_deductions = Column(Float)
    net_pay = Column(Float)
    is_paid = Column(Boolean, default=False)