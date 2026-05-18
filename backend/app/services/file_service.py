from typing import AsyncIterator, List, Tuple
import json

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.file import File
from app.models.manifest import Manifest
from app.models.node_registry import NodeRegistry
from app.models.shard_registry import ShardRegistry
from app.models.user import User
from sqlalchemy import select, delete
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
        self, user_id: int, encrypted_filename: str, encrypted_metadata: str, file_size: int, integrity_hash: str, manifest_payload: dict, shards: List[Tuple[str, bytes]], thumbnail: str = None
    ) -> int:
        
        # Verify node availability before accepting file
        available_nodes = await self.session.execute(
            select(NodeRegistry).filter(NodeRegistry.healthy == True)
        )
        nodes = available_nodes.scalars().all()
        if not nodes:
            raise HTTPException(status_code=503, detail="No healthy storage nodes available for distribution")

        # 1. Create file record
        file = await self.repo.create_file_record(
            owner_id=user_id,
            encrypted_filename=encrypted_filename,
            encrypted_metadata=encrypted_metadata,
            file_size=file_size,
            integrity_hash=integrity_hash,
            thumbnail=thumbnail
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

        # 4. Insert ShardRegistry entries and update NodeRegistry.storage_used

        shard_sizes = {}
        for shard_name, data in shards:
            shard_id = f"file_{file.id}_{shard_name}"
            shard_sizes[shard_id] = len(data)

        node_names = list({node_name for sa in shard_assignments for node_name in sa["nodes"]})
        if node_names:
            nodes_res = await self.session.execute(
                select(NodeRegistry).where(NodeRegistry.node_name.in_(node_names))
            )
            nodes_by_name = {n.node_name: n for n in nodes_res.scalars().all()}

            for sa in shard_assignments:
                s_id = sa["shard_id"]
                size = shard_sizes.get(s_id, 0)
                for idx, node_name in enumerate(sa["nodes"]):
                    node = nodes_by_name.get(node_name)
                    if node:
                        shard_rec = ShardRegistry(
                            shard_id=f"{s_id}_replica_{idx}",
                            file_id=file.id,
                            node_id=node.id,
                            shard_hash=sa["hash"],
                            replica_index=idx,
                            status="available",
                            shard_size=size
                        )
                        self.session.add(shard_rec)
                        node.storage_used = (node.storage_used or 0) + size

        # 5. Update User storage_used
        user_res = await self.session.execute(
            select(User).where(User.id == user_id)
        )
        user = user_res.scalar_one_or_none()
        if user:
            user.storage_used = (user.storage_used or 0) + file_size

        # 6. Audit event
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
        
        await self.repo.update_file_record(file_id, user_id, is_deleted=True)
        await self.audit_service.capture_event(user_id, "soft_delete", "files", str(file_id), {})
        await self.session.commit()

    async def restore_file(self, file_id: int, user_id: int) -> None:
        file = await self.repo.get_owned_file(file_id, user_id)
        if not file or file.is_deleted == False:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found in Bin")
        
        await self.repo.update_file_record(file_id, user_id, is_deleted=False)
        await self.audit_service.capture_event(user_id, "restore", "files", str(file_id), {})
        await self.session.commit()

    async def list_deleted_files(self, user_id: int) -> List[File]:
        return await self.repo.list_deleted_files_for_user(user_id)

    async def purge_file(self, file_id: int, user_id: int) -> None:
        file = await self.repo.get_owned_file(file_id, user_id)
        if not file:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        
        manifest = await self.manifest_repo.get_manifest_by_file(file_id)
        if manifest:
            for shard_info in manifest.replication_mapping:
                for node in shard_info["nodes"]:
                    await self.router.node_manager.delete_shard(node, shard_info["shard_id"])

        # Storage cleanup: load all shards to decrement node-level storage usage

        shards_res = await self.session.execute(
            select(ShardRegistry).where(ShardRegistry.file_id == file_id)
        )
        shards_to_delete = shards_res.scalars().all()

        node_storage_to_subtract = {}
        for s in shards_to_delete:
            node_storage_to_subtract[s.node_id] = node_storage_to_subtract.get(s.node_id, 0) + (s.shard_size or 0)

        if node_storage_to_subtract:
            nodes_res = await self.session.execute(
                select(NodeRegistry).where(NodeRegistry.id.in_(node_storage_to_subtract.keys()))
            )
            nodes = nodes_res.scalars().all()
            for n in nodes:
                n.storage_used = max(0, (n.storage_used or 0) - node_storage_to_subtract.get(n.id, 0))

        # Decrement user storage
        user_res = await self.session.execute(
            select(User).where(User.id == user_id)
        )
        user = user_res.scalar_one_or_none()
        if user:
            user.storage_used = max(0, (user.storage_used or 0) - (file.file_size or 0))

        # Delete shards from database
        await self.session.execute(
            delete(ShardRegistry).where(ShardRegistry.file_id == file_id)
        )

        await self.repo.delete_file(file_id)
        await self.audit_service.capture_event(user_id, "purge", "files", str(file_id), {})
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
