from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from database import db_dependency
from .models import AssetAuditLog, Assets, AssetRequest
from .schemas import AssetAuditLogCreate, AssetBase, AssetCreate, AssetOut, AssetRequestCreate, AssetAssign, ReturnAssetRequest
from datetime import datetime, timezone

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.post("/create", response_model=AssetOut)
def create_asset(data: AssetCreate, db: db_dependency):
    asset = Assets(**data.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset

@router.post("/allocate", response_model=AssetOut)
def allocate_asset(data: AssetAssign, db: db_dependency):
    asset = db.query(Assets).filter(Assets.id == data.asset_id).first()
    if not asset:
        raise HTTPException(404, detail="asset not found")
    asset.assigned_to = data.employee_id
    asset.assigned_on = datetime.now(timezone.utc)
    db.add(AssetAuditLog(asset_id = asset.id, user_id = data.employee_id, action="allocated"))
    db.commit()
    return asset

@router.put('/return/{asset_id}', response_model=AssetOut)
def return_asset(asset_id: int, body: ReturnAssetRequest, db: db_dependency):
    asset = db.query(Assets).filter(Assets.id == asset_id).first()
    if not asset:
        raise HTTPException(404, detail="asset not found")

    asset.returned = True
    asset.assigned_to = None

    db.add(AssetAuditLog(asset_id=asset.id, user_id=body.user_id, action="returned"))
    db.commit()
    return asset

@router.post("/requests")
def request_asset(request: AssetRequestCreate, db: db_dependency):
    asset_request = AssetRequest(**request.model_dump())
    db.add(asset_request)

    db.add(AssetAuditLog(asset_id=None, user_id=request.employee_id, action="requested"))
    
    db.commit()
    return {"detail": "Request submitted"}
