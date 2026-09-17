from datetime import datetime, timezone
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.credential import WebAuthnCredential

class WebAuthnRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_credential_id(self, credential_id: bytes) -> WebAuthnCredential | None:
        result = await self.session.execute(
            select(WebAuthnCredential).where(
                WebAuthnCredential.credential_id == credential_id,
                WebAuthnCredential.is_active == True
            )
        )
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: int) -> list[WebAuthnCredential]:
        result = await self.session.execute(
            select(WebAuthnCredential).where(
                WebAuthnCredential.user_id == user_id,
                WebAuthnCredential.is_active == True
            )
        )
        return list(result.scalars().all())

    async def get_active_by_user_id_for_update(self, user_id: int) -> list[WebAuthnCredential]:
        result = await self.session.execute(
            select(WebAuthnCredential)
            .where(
                WebAuthnCredential.user_id == user_id,
                WebAuthnCredential.is_active == True
            )
            .with_for_update()
        )
        return list(result.scalars().all())

    async def get_by_id_and_user_id(self, id: int, user_id: int) -> WebAuthnCredential | None:
        result = await self.session.execute(
            select(WebAuthnCredential).where(
                WebAuthnCredential.id == id,
                WebAuthnCredential.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    async def create(self, credential: WebAuthnCredential) -> WebAuthnCredential:
        self.session.add(credential)
        await self.session.commit()
        await self.session.refresh(credential)
        return credential

    async def update_sign_count(self, credential_id: bytes, sign_count: int) -> None:
        now = datetime.now(timezone.utc)
        result = await self.session.execute(
            select(WebAuthnCredential).where(WebAuthnCredential.credential_id == credential_id)
        )
        credential = result.scalar_one_or_none()
        if credential:
            credential.sign_count = sign_count
            credential.last_used_at = now
            await self.session.commit()

    async def soft_delete(self, id: int, user_id: int) -> bool:
        result = await self.session.execute(
            select(WebAuthnCredential).where(
                WebAuthnCredential.id == id,
                WebAuthnCredential.user_id == user_id
            )
        )
        credential = result.scalar_one_or_none()
        if credential:
            credential.is_active = False
            await self.session.commit()
            return True
        return False
