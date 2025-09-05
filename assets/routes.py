from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from notification.routes import send_notification_direct
from database import db_dependency
from .models import AssetAuditLog, Assets, AssetRequest
from .schemas import AssetAuditLogCreate, AssetBase, AssetCreate, AssetOut, AssetRequestCreate, AssetRequestOut, AssetAssign, ReturnAssetRequest
from datetime import datetime, timezone
import asyncio
from emply_mng.models import Employee
from auth_user.models import User

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.get("/", response_model=list[AssetOut])
def get_all_assets(db: db_dependency):
    assets = db.query(Assets).all()
    return assets

@router.post("/create", response_model=AssetOut)
def create_asset(data: AssetCreate, db: db_dependency):
    existing_asset = db.query(Assets).filter(Assets.serial_number == data.serial_number).first()
    if existing_asset:
        raise HTTPException(status_code=400, detail="Serial number already exists")
    
    asset = Assets(**data.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    
    db.add(AssetAuditLog(asset_id=asset.id, user_id=1, action="created"))
    db.commit()
    
    return asset

@router.post("/allocate", response_model=AssetOut)
def allocate_asset(data: AssetAssign, db: db_dependency):
    asset = db.query(Assets).filter(Assets.id == data.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    if asset.assigned_to and not asset.returned:
        raise HTTPException(status_code=400, detail="Asset is already assigned")
    
    asset.assigned_to = data.employee_id
    asset.assigned_on = datetime.now(timezone.utc)
    asset.returned = False

    db.add(AssetAuditLog(asset_id=asset.id, user_id=data.employee_id, action="allocated"))
    db.commit()
    db.refresh(asset)

    employee = db.query(Employee).filter_by(id=data.employee_id).first()
    if employee:
        user = db.query(User).filter_by(email=employee.email).first()
        if user:
            asyncio.run(send_notification_direct(
                user_id=user.id,
                title="Asset Allocated",
                message=f"You have been allocated Asset ID {asset.name}."
            ))

    return asset

@router.put('/return/{asset_id}', response_model=AssetOut)
def return_asset(asset_id: int, body: ReturnAssetRequest, db: db_dependency):
    asset = db.query(Assets).filter(Assets.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    if not asset.assigned_to:
        raise HTTPException(status_code=400, detail="Asset is not currently assigned")

    asset.returned = True
    asset.assigned_to = None
    asset.assigned_on = None

    db.add(AssetAuditLog(asset_id=asset.id, user_id=body.user_id, action="returned"))
    db.commit()
    db.refresh(asset)
    
    return asset

@router.get("/employee/{employee_id}", response_model=list[AssetOut])
def get_employee_assets(employee_id: int, db: db_dependency):
    assets = db.query(Assets).filter(
        Assets.assigned_to == employee_id,
        Assets.returned == False
    ).all()
    return assets

@router.post("/requests", response_model=dict)
def request_asset(request: AssetRequestCreate, db: db_dependency):
    request_data = request.model_dump()
    asset_request = AssetRequest(**request_data, status="pending")
    db.add(asset_request)
    db.flush()  

    db.add(AssetAuditLog(asset_id=None, user_id=request.employee_id, action="requested"))
    
    db.commit()
    return {"detail": "Request submitted successfully", "request_id": asset_request.id}

@router.get("/requests", response_model=list[AssetRequestOut])
def get_all_requests(db: db_dependency):
    requests = db.query(AssetRequest).filter(AssetRequest.status == "pending").all()
    return requests

@router.get("/requests/all", response_model=list[AssetRequestOut])
def get_all_requests_including_processed(db: db_dependency):
    """Get all requests including approved and denied ones"""
    requests = db.query(AssetRequest).order_by(AssetRequest.created_at.desc()).all()
    return requests

@router.post("/requests/approve/{request_id}")
def approve_request(request_id: int, db: db_dependency):
    request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending requests can be approved")
    
    request.status = "approved"
    db.add(AssetAuditLog(asset_id=None, user_id=request.employee_id, action="request_approved"))
    db.commit()
    
    return {"detail": "Request approved successfully"}

@router.post("/requests/deny/{request_id}")
def deny_request(request_id: int, db: db_dependency):
    request = db.query(AssetRequest).filter(AssetRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending requests can be denied")
    
    request.status = "denied"
    db.add(AssetAuditLog(asset_id=None, user_id=request.employee_id, action="request_denied"))
    db.commit()
    
    return {"detail": "Request denied successfully"}

@router.get("/audit-logs")
def get_audit_logs(db: db_dependency):
    logs = db.query(AssetAuditLog).order_by(AssetAuditLog.timestamp.desc()).all()
    return logs