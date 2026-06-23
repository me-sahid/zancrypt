import asyncio
from app.db import async_session_maker
from app.repositories.user_repo import UserRepository
from sqlalchemy.exc import SQLAlchemyError
import traceback

async def main():
    try:
        async with async_session_maker() as session:
            repo = UserRepository(session)
            print("Querying user...")
            user = await repo.get_by_username_or_email("test@example.com")
            print("Success, user:", user)
            
            from app.auth.repositories.credential_repo import WebAuthnRepository
            if user:
                cred_repo = WebAuthnRepository(session)
                print("Querying credentials...")
                creds = await cred_repo.get_by_user_id(user.id)
                print("Success, credentials:", creds)
                
    except SQLAlchemyError as e:
        print("SQLAlchemyError!")
        traceback.print_exc()
    except Exception as e:
        print("Other Exception!")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
