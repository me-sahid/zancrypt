from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import json
import logging

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
from slowapi import Limiter
from slowapi.util import get_remote_address

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()
webauthn_service = WebAuthnService()
session_service = SessionService()

@router.post("/register/start", response_model=RegistrationStartResponse)
@limiter.limit("10/minute")
async def register_start(
    request: Request,
    body: RegistrationStartRequest,
    session: AsyncSession = Depends(get_async_session)
):
    # Check if user already exists
    user_repo = UserRepository(session)
    existing_user = await user_repo.get_by_username_or_email(body.email)
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="This email is already registered. Please login or use a different email."
        )

    # Generate a unique user ID for WebAuthn (internal)
    user_id = uuid.uuid4().bytes
    
    options, state = webauthn_service.generate_registration_options(
        user_id=user_id,
        username=body.email,
        display_name=body.full_name
    )

    # Store registration state in Redis
    session_id = session_service.create_auth_session({
        "email": body.email,
        "full_name": body.full_name,
        "region": body.region,
        "user_id": websafe_encode(user_id),
        "state": state
    })

    return RegistrationStartResponse(
        options=options,
        session_id=session_id
    )

@router.post("/register/verify", response_model=TokenResponse)
async def register_verify(
    req: Request,
    request: RegistrationVerifyRequest,
    response: Response,
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
    except HTTPException:
        raise
    except Exception as e:
        logger.warning("WebAuthn registration verification failed: %s", e)
        raise HTTPException(status_code=400, detail="Passkey verification failed. Please try again.")

    try:
        from passlib.hash import bcrypt
        user_repo = UserRepository(session)
        import hashlib
        import bcrypt as bcrypt_lib
        
        hashed_access_key = hashlib.sha256(request.access_key.encode()).hexdigest()
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

        session.add(user)
        await session.flush()

        credential = WebAuthnCredential(
            user_id=user.id,
            credential_id=bytes(auth_data.credential_data.credential_id),
            public_key=bytes(auth_data.credential_data),
            sign_count=auth_data.counter
        )
        session.add(credential)
        await session.commit()
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        logger.error("Atomic registration failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to finalize identity setup")

    # Cleanup session
    session_service.delete_auth_session(request.session_id)

    from app.security.jwt import create_access_token
    from app.repositories.session_repo import SessionRepository
    
    access_token = create_access_token(subject=str(user.id))
    session_repo = SessionRepository(session)
    refresh_token = await session_repo.create_session(user.id)

    is_secure = req.url.scheme == "https"

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_secure,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
    )

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

@router.post("/login/start", response_model=LoginStartResponse)
@limiter.limit("15/minute")
async def login_start(
    request: Request,
    body: LoginStartRequest,
    session: AsyncSession = Depends(get_async_session)
):
    user_repo = UserRepository(session)
    user = await user_repo.get_by_username_or_email(body.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    credential_repo = WebAuthnRepository(session)
    credentials = await credential_repo.get_by_user_id(user.id)
    if not credentials:
        raise HTTPException(status_code=400, detail="No passkeys registered for this account")

    from fido2.webauthn import PublicKeyCredentialDescriptor
    allowed_credentials = [
        PublicKeyCredentialDescriptor(type="public-key", id=c.credential_id)
        for c in credentials
    ]

    options, state = webauthn_service.generate_authentication_options(allowed_credentials)

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
    req: Request,
    request: LoginVerifyRequest,
    response: Response,
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
        
        is_secure = req.url.scheme == "https"
        
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=is_secure,
            samesite="lax",
            max_age=7 * 24 * 60 * 60,
        )
        
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

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Login verification failed: %s", e, exc_info=True)
        raise HTTPException(status_code=400, detail="Authentication failed. Please try again.")

@router.post("/login/fallback", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login_fallback(
    request: Request,
    response: Response,
    body: FallbackLoginRequest,
    session: AsyncSession = Depends(get_async_session)
):
    user_repo = UserRepository(session)
    user = await user_repo.get_by_username_or_email(body.email)
    
    if not user or not user.identity_verifier:
        raise HTTPException(status_code=401, detail="Invalid credentials or fallback not available")

    import hashlib
    import bcrypt as bcrypt_lib
    
    hashed_input = hashlib.sha256(body.access_key.encode()).hexdigest()
    if not bcrypt_lib.checkpw(hashed_input.encode(), user.identity_verifier.encode()):
        logger.warning("Failed fallback login attempt for email: %s", body.email)
        raise HTTPException(status_code=401, detail="Invalid Access Key")

    from app.security.jwt import create_access_token
    from app.repositories.session_repo import SessionRepository
    
    access_token = create_access_token(subject=str(user.id))
    session_repo = SessionRepository(session)
    refresh_token = await session_repo.create_session(user.id)
    
    is_secure = request.url.scheme == "https"
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_secure,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
    )
    
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

from app.api.deps import get_current_user
from app.services.auth_service import AuthService

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_async_session)
) -> TokenResponse:
    # Read refresh token from HttpOnly cookie
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
        
    tokens = await AuthService(session).refresh_tokens(token)
    
    is_secure = request.url.scheme == "https"
    
    # Rotate the refresh cookie
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        httponly=True,
        secure=is_secure,
        samesite="lax",
        max_age=7 * 24 * 60 * 60, # 7 days
    )
    return tokens

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    response: Response,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> None:
    # Revoke the access JWT in Redis so it cannot be reused
    from app.security.jwt import revoke_token
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        revoke_token(auth_header.split(" ", 1)[1])
    await SessionService(session).revoke_active_sessions(current_user.id)
    
    is_secure = request.url.scheme == "https"
    
    # Clear the refresh token cookie
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=is_secure,
        samesite="lax"
    )

@router.put("/profile")
async def update_profile(
    payload: dict,
    current_user = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    full_name = payload.get("full_name")
    if not full_name:
        raise HTTPException(status_code=400, detail="full_name is required")
    current_user.full_name = full_name
    
    region = payload.get("region")
    if region is not None:
        current_user.region = region
        
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "region": current_user.region,
        "master_key_salt": current_user.master_key_salt
    }
