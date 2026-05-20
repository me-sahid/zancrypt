from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_async_session, get_admin_user, get_current_user
from app.schemas.admin import AuditEventResponse, NodeHealthResponse, SecurityEventResponse, SystemMetricsResponse
from app.services.admin_service import AdminService

router = APIRouter()

@router.get("/logs", response_model=List[AuditEventResponse])
async def get_audit_logs(current_user=Depends(get_admin_user), session: AsyncSession = Depends(get_async_session)) -> List[AuditEventResponse]:
    return await AdminService(session).list_audit_logs()

@router.get("/security-events", response_model=List[SecurityEventResponse])
async def get_security_events(current_user=Depends(get_admin_user), session: AsyncSession = Depends(get_async_session)) -> List[SecurityEventResponse]:
    return await AdminService(session).list_security_events()

@router.get("/node-health", response_model=List[NodeHealthResponse])
async def get_node_health(current_user=Depends(get_current_user), session: AsyncSession = Depends(get_async_session)) -> List[NodeHealthResponse]:
    return await AdminService(session).node_health()

@router.get("/system-metrics", response_model=SystemMetricsResponse)
async def get_system_metrics(
    current_user=Depends(get_current_user), 
    session: AsyncSession = Depends(get_async_session)
) -> SystemMetricsResponse:
    return await AdminService(session).system_metrics()

@router.post("/nodes/{node_id}/toggle")
async def toggle_node(
    node_id: int, 
    status: bool, 
    current_user=Depends(get_current_user), 
    session: AsyncSession = Depends(get_async_session)
):
    return await AdminService(session).toggle_node(node_id, status)

