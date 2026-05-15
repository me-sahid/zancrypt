from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin

class DeviceRegistry(Base, TimestampMixin):
    __tablename__ = "device_registry"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    device_id = Column(String(255), unique=True, nullable=False, index=True)
    device_name = Column(String(255), nullable=False)
    fingerprint = Column(String(512), nullable=False)
    trusted = Column(Boolean, default=True, nullable=False)
    
    last_seen = Column(DateTime, nullable=True)
    
    user = relationship("User")
