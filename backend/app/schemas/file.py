from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict

class FileCreateRequest(BaseModel):
    encrypted_filename: str
    encrypted_metadata: str
    file_size: int
    integrity_hash: str
    version: int

class FileMetadataResponse(BaseModel):
    id: int
    encrypted_filename: str
    file_size: int
    version_count: int
    upload_time: datetime
    integrity_hash: str
    thumbnail: str | None = None

    model_config = ConfigDict(from_attributes=True)

class FileManifestResponse(BaseModel):
    file_id: int
    manifest_payload: dict
    node_assignments: List[str]
    replication_mapping: List[dict]
    version_reference: int

class UploadProgressResponse(BaseModel):
    file_id: int
    status: str
    uploaded_shards: int
    expected_shards: int
