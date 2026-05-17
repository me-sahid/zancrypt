from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import json

from app.db import get_async_session
from app.core.config import settings
from app.auth.services.webauthn_service import WebAuthnService
from app.auth.services.session_service import SessionService
from app.auth.repositories.credential_repo import WebAuthnRepository
from app.repositories.user_repo import UserRepository
from app.models.user import User
from app.models.credential import WebAuthnCredential
from app.auth.schemas.auth import (
    RegistrationStartRequest, RegistrationStartResponse,
    RegistrationVerifyRequest, LoginStartRequest,
    LoginStartResponse, LoginVerifyRequest, TokenResponse,
    FallbackLoginRequest
)
from fido2.utils import websafe_encode, websafe_decode
from fido2.webauthn import PublicKeyCredentialDescriptor
from passlib.hash import bcrypt
from app.models.user import UserRole
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
webauthn_service = WebAuthnService()
session_service = SessionService()

@router.post("/register/start", response_model=RegistrationStartResponse)
async def register_start(
    request: RegistrationStartRequest,
    session: AsyncSession = Depends(get_async_session)
):
    # Check if user already exists
    user_repo = UserRepository(session)
    existing_user = await user_repo.get_by_username_or_email(request.email)
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="This email is already registered. Please login or use a different email."
        )

    # Generate a unique user ID for WebAuthn (internal)
    user_id = uuid.uuid4().bytes
    
    options, state = webauthn_service.generate_registration_options(
        user_id=user_id,
        username=request.email,
        display_name=request.full_name
    )

    # Store registration state in Redis
    session_id = session_service.create_auth_session({
        "email": request.email,
        "full_name": request.full_name,
        "region": request.region,
        "user_id": websafe_encode(user_id),
        "state": state
    })

    return RegistrationStartResponse(
        options=options,
        session_id=session_id
    )

@router.post("/register/verify", response_model=TokenResponse)
async def register_verify(
    request: RegistrationVerifyRequest,
    session: AsyncSession = Depends(get_async_session)
):
    auth_session = session_service.get_auth_session(request.session_id)
    if not auth_session:
        raise HTTPException(status_code=400, detail="Invalid or expired session")

    try:
        auth_data = webauthn_service.verify_registration_response(
            request.response,
            auth_session["state"]
        )
        
        # Create User
        from passlib.hash import bcrypt
        user_repo = UserRepository(session)
        # Use SHA256 before bcrypt to support long keys and bypass 72-byte limit
        import hashlib
        import bcrypt as bcrypt_lib
        
        hashed_access_key = hashlib.sha256(request.access_key.encode()).hexdigest()
        # Direct bcrypt usage to avoid passlib version conflicts
        salt = bcrypt_lib.gensalt()
        identity_verifier = bcrypt_lib.hashpw(hashed_access_key.encode(), salt).decode()
        
        user = User(
            email=auth_session["email"],
            username=auth_session["email"],
            full_name=auth_session["full_name"],
            region=auth_session["region"],
            master_key_salt=request.master_key_salt,
            identity_verifier=identity_verifier,
            encrypted_recovery_metadata=request.encrypted_recovery_metadata,
            role=UserRole.user,
            is_active=True
        )

        # Atomic User and Credential Creation
        try:
            session.add(user)
            await session.flush() # Get user.id

            # Store Credential
            credential = WebAuthnCredential(
                user_id=user.id,
                credential_id=bytes(auth_data.credential_data.credential_id),
                public_key=bytes(auth_data.credential_data), # Store whole AttestedCredentialData
                sign_count=auth_data.counter
            )
            session.add(credential)
            await session.commit()
        except Exception as e:
            await session.rollback()
            print(f"Atomic registration failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to finalize identity setup")

        # Cleanup session
        session_service.delete_auth_session(request.session_id)

        from app.security.jwt import create_access_token
        from app.repositories.session_repo import SessionRepository
        
        # Issue Tokens
        access_token = create_access_token(subject=str(user.id))
        session_repo = SessionRepository(session)
        refresh_token = await session_repo.create_session(user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name,
                "role": user.role,
                "region": user.region
            }
        )
    except Exception as e:
        print(f"Registration verification failed: {e}")
        raise HTTPException(status_code=400, detail="Registration verification failed")

@router.post("/login/start", response_model=LoginStartResponse)
async def login_start(
    request: LoginStartRequest,
    session: AsyncSession = Depends(get_async_session)
):
    user_repo = UserRepository(session)
    user = await user_repo.get_by_username_or_email(request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    credential_repo = WebAuthnRepository(session)
    credentials = await credential_repo.get_by_user_id(user.id)
    if not credentials:
        raise HTTPException(status_code=400, detail="No passkeys registered for this account")

    # Map database credentials to FIDO2 credential objects
    # fido2 expects a list of PublicKeyCredentialDescriptor
    from fido2.webauthn import PublicKeyCredentialDescriptor
    allowed_credentials = [
        PublicKeyCredentialDescriptor(type="public-key", id=c.credential_id)
        for c in credentials
    ]

    options, state = webauthn_service.generate_authentication_options(allowed_credentials)

    # Store login state in Redis
    session_id = session_service.create_auth_session({
        "email": user.email,
        "user_id": user.id,
        "state": state
    })

    return LoginStartResponse(
        options=options,
        session_id=session_id
    )

@router.post("/login/verify", response_model=TokenResponse)
async def login_verify(
    request: LoginVerifyRequest,
    session: AsyncSession = Depends(get_async_session)
):
    auth_session = session_service.get_auth_session(request.session_id)
    if not auth_session:
        raise HTTPException(status_code=400, detail="Invalid or expired session")

    try:
        credential_repo = WebAuthnRepository(session)
        user_id = auth_session["user_id"]
        credentials = await credential_repo.get_by_user_id(user_id)
        
        # We need to pass the credential objects to verify
        # but fido2 verify_authentication_response expects the specific credential used
        # The response from the client contains the credentialId used.
        used_credential_id = websafe_decode(request.response["id"])
        target_credential = next((c for c in credentials if c.credential_id == used_credential_id), None)
        
        if not target_credential:
            raise HTTPException(status_code=400, detail="Credential not recognized")

        from fido2.webauthn import AttestedCredentialData
        
        auth_data, new_counter = webauthn_service.verify_authentication_response(
            request.response,
            auth_session["state"],
            [AttestedCredentialData(target_credential.public_key)]
        )
        
        # Update sign count
        await credential_repo.update_sign_count(target_credential.credential_id, new_counter)

        from app.security.jwt import create_access_token
        from app.repositories.session_repo import SessionRepository
        
        # Issue Tokens
        access_token = create_access_token(subject=str(user_id))
        session_repo = SessionRepository(session)
        refresh_token = await session_repo.create_session(user_id)
        
        user_repo = UserRepository(session)
        user = await user_repo.get_by_id(user_id)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name,
                "role": user.role,
                "region": user.region,
                "master_key_salt": user.master_key_salt
            }
        )

    except Exception as e:
        import traceback
        print(f"Login verification failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")

@router.post("/login/fallback", response_model=TokenResponse)
async def login_fallback(
    request: FallbackLoginRequest,
    session: AsyncSession = Depends(get_async_session)
):
    user_repo = UserRepository(session)
    user = await user_repo.get_by_username_or_email(request.email)
    
    if not user or not user.identity_verifier:
        raise HTTPException(status_code=401, detail="Invalid credentials or fallback not available")

    import hashlib
    import bcrypt as bcrypt_lib
    
    hashed_input = hashlib.sha256(request.access_key.encode()).hexdigest()
    if not bcrypt_lib.checkpw(hashed_input.encode(), user.identity_verifier.encode()):
        raise HTTPException(status_code=401, detail="Invalid Access Key")

    from app.security.jwt import create_access_token
    from app.repositories.session_repo import SessionRepository
    
    # Issue Tokens
    access_token = create_access_token(subject=str(user.id))
    session_repo = SessionRepository(session)
    refresh_token = await session_repo.create_session(user.id)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "region": user.region,
            "master_key_salt": user.master_key_salt
        }
    )
