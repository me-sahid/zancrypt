import pickle
import secrets
from app.core.config import settings
import redis

class SessionService:
    def __init__(self):
        self.redis = redis.from_url(settings.REDIS_URL)

    def create_auth_session(self, data: dict, expires_in: int = 300):
        session_id = secrets.token_urlsafe(32)
        self.redis.setex(f"auth_session:{session_id}", expires_in, pickle.dumps(data))
        return session_id

    def get_auth_session(self, session_id: str):
        data = self.redis.get(f"auth_session:{session_id}")
        return pickle.loads(data) if data else None

    def delete_auth_session(self, session_id: str):
        self.redis.delete(f"auth_session:{session_id}")
