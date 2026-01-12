from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AssetBase(BaseModel):
    name: str
    type: str
    serial_number: str
class AssetCreate(AssetBase):
    pass

class AssetOut(AssetBase):
    id: int
    assigned_to: Optional[int] = None
    assigned_on: Optional[datetime] = None
    returned: bool

    class Config:
        from_attributes = True

class AssetAssign(BaseModel):
    asset_id: int
    employee_id: int

class AssetRequestCreate(BaseModel):
    employee_id: int
    asset_type: str
    reason: Optional[str] = None

class AssetRequestOut(BaseModel):
    id: int
    employee_id: int
    asset_type: str
    reason: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AssetAuditLogCreate(BaseModel):
    asset_id: Optional[int] = None
    user_id: int
    action: str

class ReturnAssetRequest(BaseModel):
    user_id: int