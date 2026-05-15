from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings

class JWTService:
    @staticmethod
    def create_access_token(subject: str, expires_delta: timedelta = None) -> str:
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY.get_secret_value(), algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_token(token: str) -> dict:
        try:
            decoded_token = jwt.decode(token, settings.JWT_SECRET_KEY.get_secret_value(), algorithms=[settings.JWT_ALGORITHM])
            return decoded_token if decoded_token["exp"] >= datetime.utcnow().timestamp() else None
        except Exception:
            return None
