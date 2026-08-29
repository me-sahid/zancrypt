from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.manifest import Manifest

class ManifestRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_manifest(
        self, 
        file_id: int, 
        manifest_payload: dict,
        version_reference: int,
        replication_mapping: List[dict],
        node_assignments: List[str]
    ) -> Manifest:
        manifest = Manifest(
            file_id=file_id,
            manifest_payload=manifest_payload,
            version_reference=version_reference,
            replication_mapping=replication_mapping,
            node_assignments=node_assignments,
        )
        self.session.add(manifest)
        await self.session.flush()
        return manifest

    async def get_manifest_by_file(self, file_id: int) -> Manifest | None:
        result = await self.session.execute(select(Manifest).where(Manifest.file_id == file_id))
        return result.scalar_one_or_none()
