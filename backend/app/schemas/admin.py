from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict

class AuditEventResponse(BaseModel):
    id: int
    user_id: int | None
    event_type: str
    resource_type: str | None
    resource_id: str | None
    details: dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SecurityEventResponse(BaseModel):
    id: int
    event_name: str
    user_id: int | None
    source_ip: str | None
    severity: str
    details: dict[str, Any]
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class NodeHealthResponse(BaseModel):
    node_name: str
    healthy: bool
    last_check_in: datetime
    region: str
    provider: str

class SystemMetricsResponse(BaseModel):
    active_nodes: int
    total_files: int
    pending_tasks: int
    average_upload_latency_ms: float
    total_storage_gb: float
    network_health_score: float
