from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin

class FileVersion(Base, TimestampMixin):
    __tablename__ = "file_versions"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    encrypted_manifest = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    file = relationship("File", back_populates="versions")
