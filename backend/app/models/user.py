from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, Column, DateTime, Enum as SqlEnum, Integer, String, BigInteger
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin

class UserRole(str, Enum):
    admin = "admin"
    user = "user"

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(128), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    region = Column(String(128), nullable=True)
    storage_used = Column(BigInteger, default=0, nullable=False)
    
    # Zero-Knowledge / Identity Verification
    master_key_salt = Column(String(255), nullable=True) # Used for local key derivation
    identity_verifier = Column(String(255), nullable=True) # Hashed access key for fallback
    encrypted_recovery_metadata = Column(String(1024), nullable=True)
    
    role = Column(SqlEnum(UserRole), default=UserRole.user, nullable=False)
    trust_score = Column(Integer, default=100, nullable=False)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # API Usage & Billing
    api_credits = Column(BigInteger, default=0, nullable=False)
    total_api_calls = Column(BigInteger, default=0, nullable=False)

    sessions = relationship("Session", back_populates="user")
    files = relationship("File", back_populates="owner")
    api_keys = relationship("ApiKey", back_populates="user", cascade="all, delete-orphan")
