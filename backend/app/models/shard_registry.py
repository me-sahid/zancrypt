from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin

class ShardRegistry(Base, TimestampMixin):
    __tablename__ = "shard_registry"

    shard_id = Column(String(128), primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False, index=True)
    node_id = Column(Integer, ForeignKey("node_registry.id"), nullable=False, index=True)
    shard_hash = Column(String(128), nullable=False)
    replica_index = Column(Integer, nullable=False)
    shard_size = Column(Integer, nullable=False, default=0)
    status = Column(String(64), default="available", nullable=False)

    file = relationship("File", back_populates="shards")
    node = relationship("NodeRegistry", back_populates="shards")
