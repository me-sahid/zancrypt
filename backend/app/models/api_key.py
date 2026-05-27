from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.base import Base

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    prefix = Column(String(16), unique=True, index=True, nullable=False)
    encrypted_key = Column(String(512), nullable=False)
    scopes = Column(JSON, default=list, nullable=False)
    app_restrictions = Column(JSON, default=dict, nullable=False)
    rules = Column(JSON, default=dict, nullable=False)
    calls_made = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_used_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    user = relationship("User", back_populates="api_keys")
