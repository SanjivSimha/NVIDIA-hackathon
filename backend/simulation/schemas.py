from typing import Dict, Optional

from pydantic import BaseModel


class TransferInventoryRequest(BaseModel):
    product_id: str
    from_warehouse: str
    to_warehouse: str
    units: int


class SupplierAllocationRequest(BaseModel):
    allocations: Dict[str, float]


class ReorderPointRequest(BaseModel):
    warehouse_id: str
    product_id: str
    new_reorder_point: int


class LaneUpdateRequest(BaseModel):
    lane_id: str
    status: Optional[str] = None
    transit_days: Optional[int] = None
    capacity: Optional[int] = None
