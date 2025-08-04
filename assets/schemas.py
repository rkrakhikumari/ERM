from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AssetBase(BaseModel):
    name : str
    type : str
    serial_number : str

class AssetCreate(AssetBase):
    pass

class AssetOut(AssetBase):
    id: int
    assigned_to : Optional[int]
    assigned_on : Optional[datetime]
    returned : bool

class AssetAssign(BaseModel):
    asset_id : int
    employee_id : int

class AssetRequestCreate(BaseModel):
    employee_id : int
    asset_type: str
    reason : Optional[str]

class AssetAuditLogCreate(BaseModel):
    asset_id : int
    user_id : int
    action : str

class ReturnAssetRequest(BaseModel):
    user_id: int