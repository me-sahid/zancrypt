"""
PendingDeletion model — retry queue for shard deletion calls that failed
during the auto-deletion flow (e.g. node was offline).

The retry worker queries this table every 30 minutes and re-attempts
the DELETE /shards/:shard_id call on the target node.
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base


class PendingDeletion(Base):
    __tablename__ = "pending_deletions"

    pending_deletion_id = Column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    shard_id = Column(String(128), nullable=False)
    node_url = Column(Text, nullable=False)
    file_id = Column(Integer, ForeignKey("files.id", ondelete="SET NULL"), nullable=True)
    failed_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    retry_count = Column(Integer, default=0, nullable=False)
    last_error = Column(Text, nullable=True)
