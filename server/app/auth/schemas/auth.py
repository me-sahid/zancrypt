from pydantic import BaseModel, EmailStr, Field, AliasChoices
from typing import Optional, List, Dict, Any

class RegistrationStartRequest(BaseModel):
    email: EmailStr
    full_name: str
    region: Optional[str] = None
    recovery_key: Optional[str] = None
    master_key_salt: Optional[str] = None
    encrypted_recovery_metadata: Optional[str] = None

class RegistrationStartResponse(BaseModel):
    options: Dict[str, Any]
    session_id: str

class RegistrationVerifyRequest(BaseModel):
    session_id: str
    response: Dict[str, Any]
    master_key_salt: str
    recovery_key: Optional[str] = Field(None, validation_alias=AliasChoices("recovery_key", "access_key"))
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

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Optional[Dict[str, Any]] = None
    recovery_key_rotated: Optional[bool] = None

# Layer 1 Schemas
class CredentialResponse(BaseModel):
    id: int
    device_name: Optional[str] = None
    added_via: Optional[str] = "registration"
    last_used_at: Optional[str] = None
    created_at: Optional[str] = None

class AddCredentialStartResponse(BaseModel):
    options: Dict[str, Any]
    session_id: str

class AddCredentialVerifyRequest(BaseModel):
    session_id: str
    response: Dict[str, Any]
    device_name: Optional[str] = None

# Layer 2 Schemas
class RecoverStartRequest(BaseModel):
    email: EmailStr

class RecoverStartResponse(BaseModel):
    session_token: str
    options: Dict[str, Any]

class RecoverRequest(BaseModel):
    session_token: str
    recovery_key: str
    new_passkey_response: Dict[str, Any]
    revoke_existing_passkeys: bool = True

# Layer 3 Schemas
class RecoveryKeyRotateRequest(BaseModel):
    recovery_key: str

class RecoveryKeyRotateResponse(BaseModel):
    success: bool = True
    message: str = "Recovery key successfully updated"

class UserMeResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    role: str
    region: Optional[str] = None
    has_recovery_key: bool = False
    passkey_count: int = 0
    recovery_key_used_at: Optional[str] = None
