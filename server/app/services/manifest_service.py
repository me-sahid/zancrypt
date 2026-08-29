from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.manifest_repo import ManifestRepository

class ManifestService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = ManifestRepository(session)

    async def get_manifest(self, file_id: int) -> dict | None:
        manifest = await self.repo.get_manifest_by_file(file_id, None)
        if manifest:
            return manifest.manifest_payload
        return None
