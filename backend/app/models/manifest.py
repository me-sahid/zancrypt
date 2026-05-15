from sqlalchemy import Column, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin

class Manifest(Base, TimestampMixin):
    __tablename__ = "manifests"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False, index=True)
    manifest_payload = Column(JSON, nullable=False)
    version_reference = Column(Integer, nullable=False)
    replication_mapping = Column(JSON, nullable=False)
    node_assignments = Column(JSON, nullable=False)

    file = relationship("File", back_populates="manifest")
