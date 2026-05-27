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

class ApiKeyBase(BaseModel):
    name: str = Field(..., max_length=128, description="User-friendly name for the API key")
    scopes: list[str] = Field(default=["*"], description="List of API scopes the key has access to")
    app_restrictions: Optional[AppRestrictions] = Field(default=None, description="Optional application restrictions (Android, iOS, Web, IP)")

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
