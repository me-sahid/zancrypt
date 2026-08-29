from sqlalchemy import Column, Integer, String, LargeBinary, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base, TimestampMixin

class WebAuthnCredential(Base, TimestampMixin):
    __tablename__ = "webauthn_credentials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    credential_id = Column(LargeBinary, unique=True, nullable=False, index=True)
    public_key = Column(LargeBinary, nullable=False)
    sign_count = Column(Integer, default=0, nullable=False)
    authenticator_type = Column(String(50), nullable=True) # e.g., 'platform', 'cross-platform'
    transports = Column(JSON, nullable=True) # e.g., ['usb', 'nfc', 'ble', 'internal']
    
    last_used_at = Column(DateTime, nullable=True)
    
    user = relationship("User")
