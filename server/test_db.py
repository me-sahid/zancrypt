import asyncio
import traceback
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.user import User
from app.models.credential import WebAuthnCredential

async def main():
    try:
        engine = create_async_engine("postgresql+asyncpg://user:vaultpassword@localhost:5432/vault", echo=True)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            print("Querying users...")
            user_result = await session.execute(select(User).limit(1))
            user = user_result.scalars().first()
            print("User query success!")
            
            if user:
                print("Querying credentials...")
                cred_result = await session.execute(select(WebAuthnCredential).where(WebAuthnCredential.user_id == user.id))
                creds = cred_result.scalars().all()
                print("Cred query success!")
            
    except Exception as e:
        print("EXCEPTION CAUGHT:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
