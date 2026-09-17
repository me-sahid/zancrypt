import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base

class RecoverySession(Base):
    __tablename__ = "recovery_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    session_token_hash = Column(String(64), unique=True, nullable=False, index=True)
    webauthn_challenge_hash = Column(String(64), nullable=False)
    webauthn_challenge = Column(Text, nullable=False)
    ip_address = Column(String(45), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc) + timedelta(minutes=10), nullable=False)
    consumed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User")
