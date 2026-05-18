import uuid
from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update

from app.api.deps import get_async_session, get_current_user
from app.models.notification import Notification

router = APIRouter()

class NotificationResponse(BaseModel):
    notification_id: uuid.UUID
    type: str
    file_id: int | None
    file_name: str | None
    trigger: str | None
    is_read: bool
    created_at: str

    model_config = ConfigDict(from_attributes=True)
    
    # Custom dump for datetime serialization
    def model_dump(self, **kwargs):
        data = super().model_dump(**kwargs)
        if isinstance(self.created_at, str) is False and self.created_at:
            data['created_at'] = self.created_at.isoformat()
        return data


@router.get("/", response_model=List[NotificationResponse])
async def get_unread_notifications(
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Returns up to 20 unread notifications for the current user.
    """
    stmt = (
        select(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        )
        .order_by(Notification.created_at.desc())
        .limit(20)
    )
    result = await session.execute(stmt)
    notifications = result.scalars().all()
    
    return notifications


@router.post("/mark-read")
async def mark_notifications_read(
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Marks all unread notifications for the current user as read.
    """
    stmt = (
        update(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        )
        .values(is_read=True)
    )
    await session.execute(stmt)
    await session.commit()
    
    return {"status": "success"}
