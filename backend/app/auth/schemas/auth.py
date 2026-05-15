from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any

class RegistrationStartRequest(BaseModel):
    email: EmailStr
    full_name: str
    region: Optional[str] = None
    access_key: Optional[str] = None
    master_key_salt: Optional[str] = None
    encrypted_recovery_metadata: Optional[str] = None

class RegistrationStartResponse(BaseModel):
    options: Dict[str, Any]
    session_id: str

class RegistrationVerifyRequest(BaseModel):
    session_id: str
    response: Dict[str, Any]
    master_key_salt: str
    access_key: str
    encrypted_recovery_metadata: Optional[str] = None

class LoginStartRequest(BaseModel):
    email: EmailStr

class LoginStartResponse(BaseModel):
    options: Dict[str, Any]
    session_id: str

class LoginVerifyRequest(BaseModel):
    session_id: str
    response: Dict[str, Any]
    device_info: Optional[Dict[str, Any]] = None

class FallbackLoginRequest(BaseModel):
    email: EmailStr
    access_key: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Optional[Dict[str, Any]] = None
