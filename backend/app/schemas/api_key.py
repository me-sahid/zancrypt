from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional

class AndroidRestriction(BaseModel):
    package_name: str
    sha1: Optional[str] = None
    sha256: Optional[str] = None

class AppRestrictions(BaseModel):
    ios_bundle_ids: List[str] = []
    android_apps: List[AndroidRestriction] = []
    web_origins: List[str] = []
    ip_addresses: List[str] = []

class ApiKeyRules(BaseModel):
    rate_limit_rpm: Optional[int] = Field(None, description="Max requests per minute")
    max_file_size_mb: Optional[int] = Field(None, description="Max file size allowed for uploads via this key")
    expires_at: Optional[datetime] = Field(None, description="Date when this key is automatically revoked")

class ApiKeyBase(BaseModel):
    name: str = Field(..., max_length=128, description="User-friendly name for the API key")
    scopes: list[str] = Field(default=["*"], description="List of API scopes the key has access to")
    app_restrictions: Optional[AppRestrictions] = Field(default=None, description="Optional application restrictions (Android, iOS, Web, IP)")
    rules: Optional[ApiKeyRules] = Field(default_factory=ApiKeyRules, description="Optional dynamic rules (rate limiting, file sizes)")

class ApiKeyCreate(ApiKeyBase):
    pass

class ApiKeyResponse(ApiKeyBase):
    id: int
    prefix: str
    created_at: datetime
    last_used_at: Optional[datetime] = None
    calls_made: int
    is_active: bool
    
    # Decrypted key, only ever populated when specifically requested (e.g., creation or reveal)
    secret_key: Optional[str] = None

    class Config:
        from_attributes = True
