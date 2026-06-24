from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin

class File(Base, TimestampMixin):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    file_uuid = Column(PG_UUID(as_uuid=True), default=uuid4, unique=True, nullable=False, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    encrypted_filename = Column(String(512), nullable=False)
    encrypted_metadata = Column(String, nullable=False)
    upload_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    file_size = Column(Integer, nullable=False)
    version_count = Column(Integer, default=1, nullable=False)
    integrity_hash = Column(String(128), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    thumbnail = Column(String, nullable=True)
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=True, index=True)

    owner = relationship("User", back_populates="files")
    versions = relationship("FileVersion", back_populates="file", cascade="all, delete-orphan")
    manifest = relationship("Manifest", back_populates="file", uselist=False, cascade="all, delete-orphan")
    shards = relationship("ShardRegistry", back_populates="file", cascade="all, delete-orphan")
    folder = relationship("Folder", back_populates="files")
