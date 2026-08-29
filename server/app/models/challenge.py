from sqlalchemy import Column, Integer, String, LargeBinary, DateTime
from datetime import datetime, timedelta
from app.models.base import Base, TimestampMixin

class AuthChallenge(Base, TimestampMixin):
    __tablename__ = "auth_challenges"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    challenge = Column(LargeBinary, nullable=False)
    
    expires_at = Column(DateTime, nullable=False)
    
    @property
    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at
