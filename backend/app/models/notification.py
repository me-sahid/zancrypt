"""
Notification model — in-app ephemeral event notifications.

Written by the notification service when a file is auto-deleted.
Read by the NotificationBell React component via GET /api/notifications.
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Type tag — e.g. 'FILE_AUTO_DELETED'
    type = Column(String(64), nullable=False)
    # Snapshot of the file at deletion time (file row may be gone)
    file_id = Column(
        Integer, ForeignKey("files.id", ondelete="SET NULL"), nullable=True
    )
    file_name = Column(Text, nullable=True)
    # Trigger reason: 'ttl_expiry' | 'download_limit' | 'manual' | 'cascade'
    trigger = Column(String(64), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    user = relationship("User")
