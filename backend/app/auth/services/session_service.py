import json
import secrets
from typing import Optional

from fido2.utils import websafe_encode, websafe_decode
from app.core.config import settings
import redis
import logging

logger = logging.getLogger(__name__)


def _encode_bytes(obj):
    if isinstance(obj, (bytes, bytearray)):
        return {"__bytes__": True, "data": websafe_encode(obj)}
    if isinstance(obj, dict):
        return {k: _encode_bytes(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_encode_bytes(i) for i in obj]
    return obj

def _decode_bytes(obj):
    if isinstance(obj, dict):
        if obj.get("__bytes__"):
            return websafe_decode(obj["data"])
        return {k: _decode_bytes(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_decode_bytes(i) for i in obj]
    return obj

def _serialize_session(data: dict) -> str:
    """Safely serialize session data to JSON, recursively encoding bytes values."""
    safe_data = _encode_bytes(data)
    return json.dumps(safe_data)

def _deserialize_session(raw: bytes) -> Optional[dict]:
    """Safely deserialize JSON session data, restoring bytes values."""
    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, ValueError):
        logger.error("Failed to parse session data from Redis")
        return None
    return _decode_bytes(data)


class SessionService:
    def __init__(self):
        self.redis = redis.from_url(settings.REDIS_URL)

    def create_auth_session(self, data: dict, expires_in: int = 300) -> str:
        session_id = secrets.token_urlsafe(32)
        serialized = _serialize_session(data)
        self.redis.setex(f"auth_session:{session_id}", expires_in, serialized.encode("utf-8"))
        return session_id

    def get_auth_session(self, session_id: str) -> Optional[dict]:
        raw = self.redis.get(f"auth_session:{session_id}")
        if not raw:
            return None
        return _deserialize_session(raw)

    def delete_auth_session(self, session_id: str) -> None:
        self.redis.delete(f"auth_session:{session_id}")
