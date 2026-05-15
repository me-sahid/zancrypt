from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Text, Boolean
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin

class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    action = Column(String(100), nullable=False) # e.g., 'login', 'register', 'file_access'
    resource = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False) # 'success', 'failure'
    
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(512), nullable=True)
    metadata_json = Column(JSON, nullable=True) # Renamed to avoid keyword conflict if any
    
    user = relationship("User")

class SecurityEvent(Base, TimestampMixin):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    event_type = Column(String(100), nullable=False) # 'suspicious_login', 'impossible_travel'
    severity = Column(String(50), nullable=False) # 'low', 'medium', 'high', 'critical'
    description = Column(Text, nullable=True)
    
    resolved = Column(Boolean, default=False, nullable=False)
    
    user = relationship("User")
