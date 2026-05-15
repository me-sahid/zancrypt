from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin

class NodeRegistry(Base, TimestampMixin):
    __tablename__ = "node_registry"

    id = Column(Integer, primary_key=True, index=True)
    node_name = Column(String(128), unique=True, nullable=False)
    provider = Column(String(128), nullable=False)
    region = Column(String(128), nullable=False)
    node_metadata = Column("metadata", JSON, nullable=True)
    healthy = Column(Boolean, default=True, nullable=False)
    last_check_in = Column(DateTime, default=datetime.utcnow, nullable=False)

    shards = relationship("ShardRegistry", back_populates="node")
