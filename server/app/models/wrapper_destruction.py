import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base

class WrapperDestruction(Base):
    __tablename__ = "wrapper_destructions"

    destruction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_id = Column(Integer, ForeignKey("files.id", ondelete="SET NULL"), nullable=True, index=True)
    reported_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    client_timestamp = Column(BigInteger, nullable=True)
    user_agent = Column(String(500), nullable=True)

    file = relationship("File")
