from typing import AsyncIterator, List, Tuple
import json
import hashlib
import asyncio
import logging

logger = logging.getLogger(__name__)

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.file import File
from app.models.manifest import Manifest
from app.models.node_registry import NodeRegistry
from app.models.shard_registry import ShardRegistry
from app.models.user import User
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

        # VULN-016 FIX: Compute actual shard byte size server-side instead of trusting client
        actual_file_size = sum(len(data) for _, data in shards)

        # Check storage limit (1 GB Testing Tier)
        # VULN: Quota bypass race condition fix (row-level lock)
        user_res = await self.session.execute(
            select(User).where(User.id == user_id).with_for_update()
        )
        user = user_res.scalar_one_or_none()
        if user:
            # 1 GB limit in bytes
            limit = 1073741824
            if (user.storage_used or 0) + actual_file_size > limit:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Storage quota exceeded. The Testing Tier limit is 1 GB."
                )

        # 1. Create file record
        file = await self.repo.create_file_record(
            owner_id=user_id,
            encrypted_filename=encrypted_filename,
            encrypted_metadata=encrypted_metadata,
            file_size=file_size,
            integrity_hash=integrity_hash,
            thumbnail=thumbnail
        )

        shard_assignments = []
        try:
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
                                provider=node.provider.lower() if node.provider in ("S3", "SUPABASE") else "local",
                                replica_index=idx,
                                status="available",
                                shard_size=size
                            )
                            self.session.add(shard_rec)
                            node.storage_used = (node.storage_used or 0) + size

            # 5. User storage_used is already locked and can be safely incremented
            if user:
                user.storage_used = (user.storage_used or 0) + actual_file_size

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

        except Exception as e:
            # ROLLBACK PHYSICAL SHARDS IN CASE OF DB / TIMEOUT / CONCURRENCY FAILURE
            logger.error("[ROLLBACK] Upload failed for file %s. Cleaning up physical shards: %s", file.id, e, exc_info=True)
            rollback_tasks = []
            if shard_assignments:
                for sa in shard_assignments:
                    shard_id = sa["shard_id"]
                    for node_name in sa["nodes"]:
                        rollback_tasks.append(self.router.node_manager.delete_shard(node_name, shard_id))
            if rollback_tasks:
                await asyncio.gather(*rollback_tasks, return_exceptions=True)
                
            # Rollback DB transaction
            await self.session.rollback()
            
            # Delete file record if it was inserted to keep DB clean
            try:
                await self.repo.delete_file(file.id)
                await self.session.commit()
            except Exception:
                pass
                
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Upload failed: {str(e)}"
            )

    async def download_file_shards(self, file_id: int, user_id: int) -> List[Tuple[str, bytes]]:
        file = await self.repo.get_owned_file(file_id, user_id)
        if not file:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        
        manifest = await self.manifest_repo.get_manifest_by_file(file_id)
        if not manifest:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manifest not found")

        # Fetch expected hashes from ShardRegistry for verification
        shards_res = await self.session.execute(
            select(ShardRegistry).where(ShardRegistry.file_id == file_id)
        )
        shard_regs = shards_res.scalars().all()
        expected_hashes = {}
        for sr in shard_regs:
            base_id = sr.shard_id.rsplit("_replica_", 1)[0]
            expected_hashes[base_id] = sr.shard_hash

        shards_data = []
        for shard_info in manifest.replication_mapping:
            shard_id = shard_info["shard_id"]
            nodes = shard_info["nodes"]
            data = await self.router.fetch_shard(shard_id, nodes)
            if not data:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Shard {shard_id} not found on any replica")
            
            # Verify SHA-256 hash on download before returning the buffer
            expected_hash = expected_hashes.get(shard_id)
            if expected_hash:
                actual_hash = hashlib.sha256(data).hexdigest()
                if actual_hash != expected_hash:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"SHA-256 hash integrity check failed for shard {shard_id}! Expected: {expected_hash}, got: {actual_hash}"
                    )
            
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
        if not file:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        if not file.is_deleted:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is not in the Bin")
        
        await self.repo.update_file_record(file_id, user_id, is_deleted=False)
        await self.audit_service.capture_event(user_id, "restore", "files", str(file_id), {})
        await self.session.commit()

    async def list_deleted_files(self, user_id: int) -> List[File]:
        return await self.repo.list_deleted_files_for_user(user_id)

    async def purge_file(self, file_id: int, user_id: int) -> None:
        file = await self.repo.get_owned_file(file_id, user_id)
        if not file:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        
        # 1. Loop through every shard in the shard map and call delete_shard on each one
        manifest = await self.manifest_repo.get_manifest_by_file(file_id)
        if manifest and manifest.replication_mapping:
            for shard_info in manifest.replication_mapping:
                shard_id = shard_info["shard_id"]
                for node in shard_info["nodes"]:
                    try:
                        await self.router.node_manager.delete_shard(node, shard_id)
                    except Exception as e:
                        logger.error("[ERROR] [b2] Failed to physically delete shard %s from node %s: %s", shard_id, node, e)

        # 2. Storage cleanup: load all shards to decrement node-level storage usage
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

        # 3. Decrement user storage with row-level lock
        user_res = await self.session.execute(
            select(User).where(User.id == user_id).with_for_update()
        )
        user = user_res.scalar_one_or_none()
        if user:
            user.storage_used = max(0, (user.storage_used or 0) - (file.file_size or 0))

        # 4. Delete shards from database record
        await self.session.execute(
            delete(ShardRegistry).where(ShardRegistry.file_id == file_id)
        )

        # 5. Delete core records
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
