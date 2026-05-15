from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.credential import WebAuthnCredential

class WebAuthnRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_credential_id(self, credential_id: bytes) -> WebAuthnCredential | None:
        result = await self.session.execute(
            select(WebAuthnCredential).where(WebAuthnCredential.credential_id == credential_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: int) -> list[WebAuthnCredential]:
        result = await self.session.execute(
            select(WebAuthnCredential).where(WebAuthnCredential.user_id == user_id)
        )
        return list(result.scalars().all())

    async def create(self, credential: WebAuthnCredential) -> WebAuthnCredential:
        self.session.add(credential)
        await self.session.commit()
        await self.session.refresh(credential)
        return credential

    async def update_sign_count(self, credential_id: bytes, sign_count: int) -> None:
        credential = await self.get_by_credential_id(credential_id)
        if credential:
            credential.sign_count = sign_count
            await self.session.commit()
