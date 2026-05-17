from typing import AsyncIterator, List, Tuple
import json

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.file import File
from app.models.manifest import Manifest
from app.repositories.file_repo import FileRepository
from app.repositories.manifest_repo import ManifestRepository
from app.services.audit_service import AuditService
from app.storage.routing import StorageRouter

class FileService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = FileRepository(session)
        self.manifest_repo = ManifestRepository(session)
        self.audit_service = AuditService(session)
        self.router = StorageRouter()

    async def store_encrypted_upload(
        self, 
        user_id: int, 
        encrypted_filename: str,
        encrypted_metadata: str,
        file_size: int,
        integrity_hash: str,
        manifest_payload: dict, 
        shards: List[Tuple[str, bytes]]
    ) -> int:
        # 1. Create file record
        file = await self.repo.create_file_record(
            owner_id=user_id,
            encrypted_filename=encrypted_filename,
            encrypted_metadata=encrypted_metadata,
            file_size=file_size,
            integrity_hash=integrity_hash
        )

        # 2. Distribute shards across nodes
        shard_assignments = await self.router.distribute_shards(file.id, shards)

        # 3. Create manifest record with node assignments
        await self.manifest_repo.create_manifest(
            file_id=file.id,
            manifest_payload=manifest_payload,
            version_reference=1,
            replication_mapping=shard_assignments,
            node_assignments=[node for shard in shard_assignments for node in shard["nodes"]]
        )

        # 4. Audit event
        await self.audit_service.capture_event(
            user_id=user_id,
            event_type="upload",
            resource_type="files",
            resource_id=str(file.id),
            details={"shard_count": len(shards), "size": file_size}
        )

        await self.session.commit()
        return file.id

    async def download_file_shards(self, file_id: int, user_id: int) -> List[Tuple[str, bytes]]:
        file = await self.repo.get_owned_file(file_id, user_id)
        if not file:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        
        manifest = await self.manifest_repo.get_manifest_by_file(file_id)
        if not manifest:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manifest not found")

        shards_data = []
        for shard_info in manifest.replication_mapping:
            shard_id = shard_info["shard_id"]
            nodes = shard_info["nodes"]
            data = await self.router.fetch_shard(shard_id, nodes)
            if not data:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Shard {shard_id} not found on any replica")
            shards_data.append((shard_id, data))
        
        return shards_data

    async def delete_file(self, file_id: int, user_id: int) -> None:
        file = await self.repo.get_owned_file(file_id, user_id)
        if not file:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        
        manifest = await self.manifest_repo.get_manifest_by_file(file_id)
        if manifest:
            for shard_info in manifest.replication_mapping:
                for node in shard_info["nodes"]:
                    await self.router.node_manager.delete_shard(node, shard_info["shard_id"])

        await self.repo.delete_file(file_id)
        await self.audit_service.capture_event(user_id, "delete", "files", str(file_id), {})
        await self.session.commit()

    async def rename_file(self, file_id: int, user_id: int, new_filename: str) -> File:
        file = await self.repo.update_file_record(file_id, user_id, encrypted_filename=new_filename)
        if not file:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        
        await self.audit_service.capture_event(
            user_id=user_id,
            event_type="modify",
            resource_type="files",
            resource_id=str(file_id),
            details={"action": "rename", "new_name": new_filename}
        )
        await self.session.commit()
        return file

    async def list_user_files(self, user_id: int) -> List[File]:
        return await self.repo.list_files_for_user(user_id)

    async def get_manifest(self, file_id: int, user_id: int) -> dict:
        manifest = await self.manifest_repo.get_manifest_by_file(file_id)
        if not manifest:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manifest not found")
        
        # Check ownership via file repo
        file = await self.repo.get_owned_file(file_id, user_id)
        if not file:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        return {
            "file_id": manifest.file_id,
            "manifest_payload": manifest.manifest_payload,
            "node_assignments": manifest.node_assignments,
            "replication_mapping": manifest.replication_mapping,
            "version_reference": manifest.version_reference,
        }
