from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from notification.routes import send_notification_direct
from database import db_dependency
from .models import Assets, AssetRequest, AssetAuditLog
from .schemas import AssetBase, AssetCreate, AssetOut, AssetRequestCreate, AssetRequestOut, AssetAssign, ReturnAssetRequest
from datetime import datetime, timezone
import asyncio
from emply_mng.models import Employee
from auth_user.models import User
from auth_user.utils import get_current_user
from admin.crud import create_audit_log  
from typing import Optional

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.get("/", response_model=list[AssetOut])
def get_all_assets(db: db_dependency):
    assets = db.query(Assets).all()
    return assets

@router.post("/create", response_model=AssetOut)
def create_asset(data: AssetCreate, db: db_dependency, user: User = Depends(get_current_user)):
    existing_asset = db.query(Assets).filter(Assets.serial_number == data.serial_number).first()
    if existing_asset:
        create_audit_log(db,user_id=user.id,action=f"Failed to create asset: Serial number '{data.serial_number}' already exists.")
        raise HTTPException(status_code=400, detail="Serial number already exists")
    
    asset = Assets(**data.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    
    create_audit_log(db, user_id=user.id, action=f"Created new asset: '{asset.name}' (ID: {asset.id}, Serial: {asset.serial_number}).")
    
    return asset

@router.post("/allocate", response_model=AssetOut)
def allocate_asset(data: AssetAssign, db: db_dependency, user: User = Depends(get_current_user)):
    asset = db.query(Assets).filter(Assets.id == data.asset_id).first()
    if not asset:
        create_audit_log(db,user_id=user.id,action=f"Failed to allocate asset: Asset with ID {data.asset_id} not found.")
        raise HTTPException(status_code=404, detail="Asset not found")
    
    if asset.assigned_to and not asset.returned:
        create_audit_log(db,user_id=user.id,action=f"Failed to allocate asset '{asset.name}' (ID: {asset.id}): Already assigned.")
        raise HTTPException(status_code=400, detail="Asset is already assigned")
    
    employee_to_assign = db.query(Employee).filter(Employee.id == data.employee_id).first()
    if not employee_to_assign:
         create_audit_log(db,user_id=user.id,action=f"Failed to allocate asset '{asset.name}' (ID: {asset.id}): Employee ID {data.employee_id} not found.")
         raise HTTPException(status_code=404, detail="Employee not found")

    asset.assigned_to = data.employee_id
    asset.assigned_on = datetime.now(timezone.utc)
    asset.returned = False

    db.commit()
    db.refresh(asset)

    create_audit_log(db,user_id=user.id,action=f"Asset '{asset.name}' (ID: {asset.id}) allocated to employee '{employee_to_assign.name}' ({employee_to_assign.id}).")

    if employee_to_assign:
        employee_user = db.query(User).filter_by(email=employee_to_assign.email).first()
        if employee_user:
            asyncio.run(send_notification_direct(
                user_id=employee_user.id,
                title="Asset Allocated",
                message=f"You have been allocated Asset ID {asset.name}."
            ))

    return asset

@router.put('/return/{asset_id}', response_model=AssetOut)
def return_asset(asset_id: int, body: ReturnAssetRequest, db: db_dependency, user: User = Depends(get_current_user)):
    asset = db.query(Assets).filter(Assets.id == asset_id).first()
    if not asset:
        create_audit_log(db,user_id=user.id,action=f"Failed to return asset: Asset with ID {asset_id} not found.")
        raise HTTPException(status_code=404, detail="Asset not found")
    
    if not asset.assigned_to:
        create_audit_log(db,user_id=user.id,action=f"Failed to return asset '{asset.name}' (ID: {asset.id}): Not currently assigned.")
        raise HTTPException(status_code=400, detail="Asset is not currently assigned")

    old_assigned_to = asset.assigned_to
    
    asset.returned = True
    asset.assigned_to = None
    asset.assigned_on = None

    db.commit()
    db.refresh(asset)
    
    create_audit_log(db, user_id=user.id,action=f"Asset '{asset.name}' (ID: {asset.id}) returned by employee ID {old_assigned_to}.")
    
    return asset

@router.get("/employee/{employee_id}", response_model=list[AssetOut])
def get_employee_assets(employee_id: int, db: db_dependency):
    assets = db.query(Assets).filter(
        Assets.assigned_to == employee_id,
        Assets.returned == False
    ).all()
    return assets

@router.post("/requests", response_model=dict)
def request_asset(request: AssetRequestCreate, db: db_dependency, user: User = Depends(get_current_user)):
    request_data = request.model_dump()
    asset_request = AssetRequest(**request_data, status="pending")
    db.add(asset_request)
    db.flush()

    create_audit_log(db, user_id=user.id, action=f"Requested asset for employee ID {request.employee_id} (Type: {request.asset_type}).")
    
    db.commit()
    return {"detail": "Request submitted successfully", "request_id": asset_request.id}

@router.get("/requests", response_model=list[AssetRequestOut])
def get_all_requests(db: db_dependency):
    requests = db.query(AssetRequest).filter(AssetRequest.status == "pending").all()
    return requests

@router.get("/requests/all", response_model=list[AssetRequestOut])
def get_all_requests_including_processed(db: db_dependency):
    requests = db.query(AssetRequest).order_by(AssetRequest.created_at.desc()).all()
    return requests

@router.post("/requests/approve/{request_id}")
def approve_request(request_id: int, db: db_dependency, user: User = Depends(get_current_user)):
    request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not request:
        create_audit_log(db,user_id=user.id,action=f"Failed to approve request: Request ID {request_id} not found.")
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.status != "pending":
        create_audit_log(db,user_id=user.id,action=f"Failed to approve request: Request ID {request_id} is not pending.")
        raise HTTPException(status_code=400, detail="Only pending requests can be approved")
    
    request.status = "approved"
    db.commit()
    
    create_audit_log(db,user_id=user.id,action=f"Approved asset request ID {request_id} for employee ID {request.employee_id}.")
    
    return {"detail": "Request approved successfully"}

@router.post("/requests/deny/{request_id}")
def deny_request(request_id: int, db: db_dependency, user: User = Depends(get_current_user)):
    request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not request:
        create_audit_log(db,user_id=user.id,action=f"Failed to deny request: Request ID {request_id} not found.")
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.status != "pending":
        create_audit_log(db,user_id=user.id,action=f"Failed to deny request: Request ID {request_id} is not pending.")
        raise HTTPException(status_code=400, detail="Only pending requests can be denied")
    
    request.status = "denied"
    db.commit()
    
    create_audit_log(db,user_id=user.id,action=f"Denied asset request ID {request_id} for employee ID {request.employee_id}.")
    
    return {"detail": "Request denied successfully"}

@router.get("/audit-logs")
def get_audit_logs(db: db_dependency):
    logs = db.query(AssetAuditLog).order_by(AssetAuditLog.timestamp.desc()).all()
    return logs