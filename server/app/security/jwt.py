import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.core.config import settings

_redis_client = None


def _get_redis():
    """Lazily initialise a Redis client for token revocation."""
    global _redis_client
    if _redis_client is None:
        import redis
        _redis_client = redis.from_url(settings.REDIS_URL)
    return _redis_client


def create_access_token(subject: str) -> str:
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "exp": expire, "jti": jti}
    return jwt.encode(payload, settings.JWT_SECRET_KEY.get_secret_value(), algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    payload = jwt.decode(token, settings.JWT_SECRET_KEY.get_secret_value(), algorithms=[settings.JWT_ALGORITHM])
    return payload


def revoke_token(token: str) -> None:
    """Add a JWT to the Redis revocation blocklist until it expires."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY.get_secret_value(),
            algorithms=[settings.JWT_ALGORITHM],
        )
        jti = payload.get("jti")
        exp = payload.get("exp")
        if jti and exp:
            now = int(datetime.now(timezone.utc).timestamp())
            ttl = max(0, exp - now)
            if ttl > 0:
                _get_redis().setex(f"revoked_jti:{jti}", ttl, "1")
    except JWTError:
        pass  # Token already invalid, nothing to revoke


def is_token_revoked(payload: dict) -> bool:
    """Return True if the token's JTI is in the revocation blocklist."""
    jti = payload.get("jti")
    if not jti:
        return False
    return bool(_get_redis().exists(f"revoked_jti:{jti}"))

