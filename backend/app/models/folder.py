from uuid import uuid4

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin

class Folder(Base, TimestampMixin):
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    folder_uuid = Column(PG_UUID(as_uuid=True), default=uuid4, unique=True, nullable=False, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    encrypted_name = Column(String(512), nullable=False)
    parent_id = Column(Integer, ForeignKey("folders.id"), nullable=True, index=True)

    owner = relationship("User")
    files = relationship("File", back_populates="folder")
    subfolders = relationship("Folder")
