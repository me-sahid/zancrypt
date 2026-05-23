from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FolderCreate(BaseModel):
    encrypted_name: str
    parent_id: Optional[int] = None

class FolderUpdate(BaseModel):
    encrypted_name: Optional[str] = None
    parent_id: Optional[int] = None

class FolderResponse(BaseModel):
    id: int
    encrypted_name: str
    parent_id: Optional[int]
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
