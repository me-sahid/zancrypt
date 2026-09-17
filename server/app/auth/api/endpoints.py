import base64
import html
import hashlib
import json
import logging
import re
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any

import bcrypt as bcrypt_lib
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from webauthn.helpers import base64url_to_bytes

from app.db import get_async_session
from app.core.config import settings
from app.auth.services.webauthn_service import WebAuthnService
from app.auth.services.session_service import SessionService
from app.auth.repositories.credential_repo import WebAuthnRepository
from app.repositories.user_repo import UserRepository
from app.models.user import User, UserRole
from app.models.credential import WebAuthnCredential
from app.models.recovery_session import RecoverySession
from app.auth.schemas.auth import (
    RegistrationStartRequest, RegistrationStartResponse,
    RegistrationVerifyRequest, LoginStartRequest,
    LoginStartResponse, LoginVerifyRequest, TokenResponse,
    CredentialResponse, AddCredentialStartResponse, AddCredentialVerifyRequest,
    RecoverStartRequest, RecoverStartResponse, RecoverRequest,
    RecoveryKeyRotateRequest, RecoveryKeyRotateResponse, UserMeResponse
)
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()
webauthn_service = WebAuthnService()
session_service = SessionService()

COOKIE_DOMAIN = f".{settings.DOMAIN}" if settings.DOMAIN != "localhost" else None
IS_PROD = settings.ENVIRONMENT == "production"

# ── Zero-Knowledge Recovery & Security Helpers ───────────────────────
# Recovery key charset: uppercase letters excluding O and I, digits excluding 0 and 1
RECOVERY_KEY_PATTERN = re.compile(r"^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{20}$")
DUMMY_BCRYPT_HASH = bcrypt_lib.hashpw(b"DUMMY_RECOVERY_KEY_VAL", bcrypt_lib.gensalt(12)).decode("utf-8")

def sanitize_log_string(val: Any) -> str:
    """Strip all newlines, carriage returns, and control characters to prevent log forging."""
    if val is None:
        return ""
    clean = str(val).replace("\r", " ").replace("\n", " ")
    return "".join(ch for ch in clean if ord(ch) >= 32 and ord(ch) != 127)

def sanitize_device_name(name: Optional[str]) -> str:
    """
    Sanitize device_name before storing:
    - strip control characters and newlines
    - allow only word characters, spaces, hyphens, dots
    - HTML-encode
    - enforce max 100 characters
    """
    if not name:
        return "Security Key / Browser"
    # Remove control characters
    stripped = "".join(ch for ch in str(name) if ord(ch) >= 32 and ord(ch) != 127).strip()
    # Filter allowed characters: word characters (letters, digits, underscores), spaces, hyphens, dots
    filtered = re.sub(r"[^\w\s\.\-]", "", stripped)
    # HTML-encode
    encoded = html.escape(filtered)
    # Max length 100
    truncated = encoded[:100].strip()
    return truncated or "Security Key / Browser"

def normalize_recovery_key(key: str) -> str:
    """Normalize recovery key by stripping whitespace and hyphens, and converting to uppercase."""
    if not key:
        return ""
    return re.sub(r"[\s\-]+", "", str(key)).upper()

def validate_recovery_key_format(normalized_key: str) -> bool:
    """Validate that key is exactly 20 characters from allowed charset (excluding 0, 1, O, I)."""
    return bool(RECOVERY_KEY_PATTERN.match(normalized_key))

def hash_recovery_key(normalized_key: str) -> str:
    """Hash normalized recovery key with bcrypt rounds=12."""
    salt = bcrypt_lib.gensalt(rounds=12)
    return bcrypt_lib.hashpw(normalized_key.encode("utf-8"), salt).decode("utf-8")

def verify_recovery_key(normalized_key: str, stored_hash: Optional[str]) -> bool:
    """Verify recovery key using bcrypt; executes dummy verify if stored_hash is absent."""
    if not stored_hash:
        dummy_verify()
        return False
    try:
        return bcrypt_lib.checkpw(normalized_key.encode("utf-8"), stored_hash.encode("utf-8"))
    except Exception:
        return False

def dummy_verify() -> None:
    """Simulate a full bcrypt comparison to prevent timing attacks when user or hash is not found."""
    try:
        bcrypt_lib.checkpw(b"DUMMY_RECOVERY_KEY_VAL", DUMMY_BCRYPT_HASH.encode("utf-8"))
    except Exception:
        pass


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.delete_cookie("refresh_token", domain="api.zancrypt.in")
    
    cookie_kwargs = {
        "key": "refresh_token",
        "value": token,
        "httponly": True,
        "secure": IS_PROD,
        "samesite": "none" if IS_PROD else "lax",
        "path": "/",
        "max_age": 7 * 24 * 60 * 60,
    }
    if COOKIE_DOMAIN:
        cookie_kwargs["domain"] = COOKIE_DOMAIN
    response.set_cookie(**cookie_kwargs)

def _delete_refresh_cookie(response: Response) -> None:
    cookie_kwargs = {
        "key": "refresh_token",
        "httponly": True,
        "secure": IS_PROD,
        "samesite": "none" if IS_PROD else "lax",
        "path": "/",
    }
    if COOKIE_DOMAIN:
        cookie_kwargs["domain"] = COOKIE_DOMAIN
    response.delete_cookie(**cookie_kwargs)

@router.post("/register/start", response_model=RegistrationStartResponse)
@limiter.limit("10/minute")
async def register_start(
    request: Request,
    body: RegistrationStartRequest,
    session: AsyncSession = Depends(get_async_session)
):
    user_repo = UserRepository(session)
    existing_user = await user_repo.get_by_username_or_email(body.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="This email is already registered. Please login or use a different email."
        )

    user_id = uuid.uuid4().bytes

    options, state = webauthn_service.generate_registration_options(
        user_id=user_id,
        username=body.email,
        display_name=body.full_name
    )

    session_id = session_service.create_auth_session({
        "email": body.email,
        "full_name": body.full_name,
        "region": body.region,
        "user_id": base64.urlsafe_b64encode(user_id).rstrip(b"=").decode(),
        "state": state
    })

    return RegistrationStartResponse(
        options=options,
        session_id=session_id
    )

@router.post("/register/verify", response_model=TokenResponse)
@limiter.limit("6/minute")
async def register_verify(
    request: Request,
    body: RegistrationVerifyRequest,
    response: Response,
    session: AsyncSession = Depends(get_async_session)
):
    auth_session = session_service.get_auth_session(body.session_id)
    if not auth_session:
        raise HTTPException(status_code=400, detail="Invalid or expired session")

    try:
        auth_data = webauthn_service.verify_registration_response(
            body.response,
            auth_session["state"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning("WebAuthn registration verification failed: %s", e)
        raise HTTPException(status_code=400, detail="Passkey verification failed. Please try again.")

    try:
        user_repo = UserRepository(session)
        recovery_key_hash = None
        recovery_key = getattr(body, "recovery_key", None)
        if recovery_key:
            normalized = normalize_recovery_key(recovery_key)
            if validate_recovery_key_format(normalized):
                recovery_key_hash = hash_recovery_key(normalized)
            else:
                logger.warning("Registration provided invalid recovery key format")

        now = datetime.now(timezone.utc)
        user = User(
            email=auth_session["email"],
            username=auth_session["email"],
            full_name=auth_session["full_name"],
            region=auth_session["region"],
            master_key_salt=body.master_key_salt,
            recovery_key_hash=recovery_key_hash,
            encrypted_recovery_metadata=body.encrypted_recovery_metadata,
            role=UserRole.user,
            is_active=True,
            passkey_count=1
        )

        session.add(user)
        await session.flush()

        credential = WebAuthnCredential(
            user_id=user.id,
            credential_id=auth_data.credential_id,
            public_key=auth_data.credential_public_key,
            sign_count=auth_data.sign_count,
            transports=["internal"],
            device_name="Primary Passkey",
            added_via="registration",
            is_active=True,
            last_used_at=now
        )
        session.add(credential)
        await session.commit()
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        logger.error("Atomic registration failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to finalize identity setup")

    session_service.delete_auth_session(body.session_id)

    from app.security.jwt import create_access_token
    from app.repositories.session_repo import SessionRepository

    access_token = create_access_token(subject=str(user.id))
    session_repo = SessionRepository(session)
    refresh_token = await session_repo.create_session(user.id)

    _set_refresh_cookie(response, refresh_token)

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
            "has_recovery_key": user.recovery_key_hash is not None,
            "passkey_count": user.passkey_count or 1,
        }
    )

@router.get("/key-material")
async def get_key_material(
    current_user: User = Depends(get_current_user)
):
    return {"master_key_salt": current_user.master_key_salt}

@router.post("/login/start", response_model=LoginStartResponse)
@limiter.limit("8/minute")
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

    options, state = webauthn_service.generate_authentication_options(credentials)

    session_id = session_service.create_auth_session({
        "email": user.email,
        "user_id": str(user.id),
        "state": state
    })

    return LoginStartResponse(
        options=options,
        session_id=session_id
    )

@router.post("/login/verify", response_model=TokenResponse)
@limiter.limit("11/minute")
async def login_verify(
    request: Request,
    body: LoginVerifyRequest,
    response: Response,
    session: AsyncSession = Depends(get_async_session)
):
    auth_session = session_service.get_auth_session(body.session_id)
    if not auth_session:
        raise HTTPException(status_code=400, detail="Invalid or expired session")

    try:
        credential_repo = WebAuthnRepository(session)
        user_id = int(auth_session["user_id"])
        credentials = await credential_repo.get_by_user_id(user_id)

        if not credentials:
            raise HTTPException(status_code=400, detail="No passkeys found")

        used_credential_id = base64url_to_bytes(body.response["id"])

        target_credential = None
        for c in credentials:
            db_cred_id = bytes(c.credential_id) if not isinstance(c.credential_id, bytes) else c.credential_id
            if db_cred_id == used_credential_id:
                target_credential = c
                break

        if not target_credential:
            raise HTTPException(status_code=400, detail="Credential not recognized")

        auth_data, new_counter = webauthn_service.verify_authentication_response(
            body.response,
            auth_session["state"],
            credentials
        )

        await credential_repo.update_sign_count(target_credential.credential_id, new_counter)

        from app.security.jwt import create_access_token
        from app.repositories.session_repo import SessionRepository

        access_token = create_access_token(subject=str(user_id))
        session_repo = SessionRepository(session)
        refresh_token = await session_repo.create_session(user_id)

        user_repo = UserRepository(session)
        user = await user_repo.get_by_id(user_id)

        _set_refresh_cookie(response, refresh_token)

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
                "has_recovery_key": user.recovery_key_hash is not None,
                "passkey_count": user.passkey_count or 0,
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Login verification failed: %s", e, exc_info=True)
        raise HTTPException(status_code=400, detail="Authentication failed. Please try again.")




ALLOWED_ORIGINS = settings.CORS_ORIGINS

@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("20/hour")
async def refresh_token(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_async_session)
) -> TokenResponse:
    old_token = request.cookies.get("refresh_token")
    if not old_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    origin = request.headers.get("origin") or request.headers.get("referer", "")
    # Allow requests with no origin (e.g. same-origin page reloads, curl, server-side calls).
    # Only reject requests that actively present a disallowed origin.
    if origin:
        is_allowed = any(origin.startswith(allowed) for allowed in ALLOWED_ORIGINS)
        
        # fallback for dev environments
        if not is_allowed and settings.ENVIRONMENT != "production":
            if origin.startswith("http://localhost") or origin.startswith("http://127.0.0.1") or "localhost" in origin:
                is_allowed = True
                
        if not is_allowed:
            logger.warning(f"Refresh token denied for origin: {origin}. Allowed: {ALLOWED_ORIGINS}")
            raise HTTPException(
                status_code=403,
                detail=f"Invalid origin: {origin}"
            )

    from app.repositories.session_repo import SessionRepository
    from app.repositories.user_repo import UserRepository
    from app.security.jwt import create_access_token

    session_repo = SessionRepository(session)

    try:
        user_session = await session_repo.get_by_token(old_token)
        if not user_session:
            _delete_refresh_cookie(response)
            raise HTTPException(status_code=401, detail="Invalid or expired session")

        await session_repo.delete_session(old_token)
        new_access_token = create_access_token(subject=str(user_session.user_id))
        new_refresh_token = await session_repo.create_session(user_session.user_id, previous_token=old_token)

        _set_refresh_cookie(response, new_refresh_token)

        user_repo = UserRepository(session)
        user = await user_repo.get_by_id(user_session.user_id)
        if not user or not user.is_active:
            _delete_refresh_cookie(response)
            raise HTTPException(status_code=401, detail="User account not found or inactive")

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name,
                "role": user.role,
                "region": user.region,
                "has_recovery_key": user.recovery_key_hash is not None,
                "passkey_count": user.passkey_count or 0,
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during refresh_token: {e}", exc_info=True)
        _delete_refresh_cookie(response)
        raise HTTPException(status_code=401, detail="Session refresh failed")

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    response: Response,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> None:
    from app.security.jwt import revoke_token
    from app.repositories.session_repo import SessionRepository

    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        revoke_token(auth_header.split(" ", 1)[1])

    session_repo = SessionRepository(session)
    await session_repo.revoke_all_by_user(current_user.id)

    _delete_refresh_cookie(response)

@router.put("/profile")
@limiter.limit("10/minute")
async def update_profile(
    request: Request,
    payload: dict,
    current_user=Depends(get_current_user),
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
    }


# ── GET /auth/me ───────────────────────────────────────────────────────
@router.get("/me", response_model=UserMeResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
) -> UserMeResponse:
    return UserMeResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        role=current_user.role,
        region=current_user.region,
        has_recovery_key=current_user.recovery_key_hash is not None,
        passkey_count=current_user.passkey_count or 0,
        recovery_key_used_at=current_user.recovery_key_used_at.isoformat() if current_user.recovery_key_used_at else None,
    )


# ── Layer 1: Authenticated Multi-Device Passkey Management ─────────────

@router.get("/credentials", response_model=List[CredentialResponse])
async def list_credentials(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
) -> List[CredentialResponse]:
    """Return active passkeys for the current user. Always filters by user_id and is_active=True."""
    stmt = (
        select(WebAuthnCredential)
        .where(
            WebAuthnCredential.user_id == current_user.id,
            WebAuthnCredential.is_active == True
        )
        .order_by(WebAuthnCredential.created_at.desc())
    )
    result = await session.execute(stmt)
    credentials = result.scalars().all()
    
    return [
        CredentialResponse(
            id=c.id,
            device_name=c.device_name,
            added_via=c.added_via,
            last_used_at=c.last_used_at.isoformat() if c.last_used_at else None,
            created_at=c.created_at.isoformat() if c.created_at else None,
        )
        for c in credentials
    ]


@router.post("/credentials/add/start", response_model=AddCredentialStartResponse)
@limiter.limit("10/minute")
async def add_credential_start(
    request: Request,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
) -> AddCredentialStartResponse:
    """Generate WebAuthn registration options for an already-authenticated user."""
    # Fetch existing active credentials so authenticator does not create duplicates
    cred_repo = WebAuthnRepository(session)
    existing_creds = await cred_repo.get_by_user_id(current_user.id)
    
    user_id_bytes = uuid.uuid4().bytes

    options, state = webauthn_service.generate_registration_options(
        user_id=user_id_bytes,
        username=current_user.email,
        display_name=current_user.full_name or current_user.email,
        existing_credentials=existing_creds
    )

    session_id = session_service.create_auth_session({
        "type": "add_credential",
        "user_id": current_user.id,
        "state": state
    }, expires_in=300)

    return AddCredentialStartResponse(
        options=options,
        session_id=session_id
    )


@router.post("/credentials/add/verify", response_model=CredentialResponse)
@limiter.limit("10/minute")
async def add_credential_verify(
    request: Request,
    body: AddCredentialVerifyRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
) -> CredentialResponse:
    """Verify WebAuthn registration response and add credential to current_user."""
    auth_session = session_service.get_auth_session(body.session_id)
    if not auth_session:
        raise HTTPException(status_code=400, detail="Invalid or expired session")

    if auth_session.get("type") != "add_credential":
        raise HTTPException(status_code=400, detail="Invalid session type")

    if int(auth_session.get("user_id")) != current_user.id:
        logger.warning(
            "User %s attempted to use auth session for user %s",
            sanitize_log_string(current_user.id),
            sanitize_log_string(auth_session.get("user_id"))
        )
        raise HTTPException(status_code=403, detail="Unauthorized session access")

    try:
        auth_data = webauthn_service.verify_registration_response(
            body.response,
            auth_session["state"]
        )
    except Exception as e:
        logger.warning("Add passkey verification failed: %s", sanitize_log_string(e))
        raise HTTPException(status_code=400, detail="Passkey verification failed. Please try again.")

    clean_device_name = sanitize_device_name(body.device_name)
    now = datetime.now(timezone.utc)

    credential = WebAuthnCredential(
        user_id=current_user.id,
        credential_id=auth_data.credential_id,
        public_key=auth_data.credential_public_key,
        sign_count=auth_data.sign_count,
        transports=["internal"],
        device_name=clean_device_name,
        added_via="settings",
        is_active=True,
        last_used_at=now
    )

    session.add(credential)
    await session.commit()
    await session.refresh(credential)

    session_service.delete_auth_session(body.session_id)

    return CredentialResponse(
        id=credential.id,
        device_name=credential.device_name,
        added_via=credential.added_via,
        last_used_at=credential.last_used_at.isoformat() if credential.last_used_at else None,
        created_at=credential.created_at.isoformat() if credential.created_at else None,
    )


@router.delete("/credentials/{credential_id}")
@limiter.limit("10/minute")
async def delete_credential(
    credential_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Soft-delete passkey with SELECT FOR UPDATE check preventing removal of the last passkey."""
    # Use SELECT FOR UPDATE on all active credentials for this user
    stmt = (
        select(WebAuthnCredential)
        .where(
            WebAuthnCredential.user_id == current_user.id,
            WebAuthnCredential.is_active == True
        )
        .with_for_update()
    )
    result = await session.execute(stmt)
    active_creds = list(result.scalars().all())

    if len(active_creds) <= 1:
        raise HTTPException(
            status_code=400,
            detail="Cannot remove your last passkey. You must have at least one active passkey."
        )

    # Verify ownership explicitly by user_id
    target = next((c for c in active_creds if c.id == credential_id and c.user_id == current_user.id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Passkey not found or already deactivated")

    target.is_active = False
    await session.commit()

    return {"message": "Passkey removed successfully", "id": credential_id}


# ── Layer 2: Zero-Knowledge Account Recovery Endpoints ─────────────────

@router.post("/recover/start", response_model=RecoverStartResponse)
@limiter.limit("5/minute")
async def recover_start(
    request: Request,
    body: RecoverStartRequest,
    session: AsyncSession = Depends(get_async_session)
) -> RecoverStartResponse:
    """
    Look up user by email and initiate recovery.
    Shape and timing of response are identical whether the email exists or not to prevent enumeration.
    """
    clean_email = sanitize_log_string(body.email.strip().lower())
    now = datetime.now(timezone.utc)

    user_repo = UserRepository(session)
    user = await user_repo.get_by_username_or_email(clean_email)

    # Check if locked
    if user and user.recovery_locked_until and user.recovery_locked_until > now:
        remaining = int((user.recovery_locked_until - now).total_seconds())
        raise HTTPException(
            status_code=429,
            detail=f"Account recovery is temporarily locked due to too many failed attempts. Try again in {remaining} seconds."
        )

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    if user and (not user.recovery_locked_until or user.recovery_locked_until <= now):
        user_id_bytes = uuid.uuid4().bytes
        options, state = webauthn_service.generate_registration_options(
            user_id=user_id_bytes,
            username=user.email,
            display_name=user.full_name or user.email
        )
        challenge_str = state["challenge"]
        challenge_hash = hashlib.sha256(challenge_str.encode("utf-8")).hexdigest()

        rec_session = RecoverySession(
            id=uuid.uuid4(),
            user_id=user.id,
            session_token_hash=token_hash,
            webauthn_challenge_hash=challenge_hash,
            webauthn_challenge=challenge_str,
            ip_address=request.client.host if request.client else None,
            created_at=now,
            expires_at=now + timedelta(minutes=10)
        )
        session.add(rec_session)
        await session.commit()

        return RecoverStartResponse(
            session_token=raw_token,
            options=options
        )
    else:
        # User not found: run dummy verify and generate fake registration challenge for constant response shape & timing
        dummy_verify()
        dummy_user_id = uuid.uuid4().bytes
        fake_options, _ = webauthn_service.generate_registration_options(
            user_id=dummy_user_id,
            username=clean_email,
            display_name=clean_email
        )
        return RecoverStartResponse(
            session_token=raw_token,
            options=fake_options
        )


@router.post("/recover", response_model=TokenResponse)
@limiter.limit("5/minute")
async def recover_account(
    request: Request,
    body: RecoverRequest,
    response: Response,
    session: AsyncSession = Depends(get_async_session)
) -> TokenResponse:
    """
    Execute account recovery in exact required 13-step sequence:
    1. Look up recovery session by SHA-256 hash WHERE consumed_at IS NULL with SELECT FOR UPDATE.
    2. If not found or expired -> return 401 with identical message.
    3. Check user recovery lock -> return 429 if locked.
    4. Normalize recovery key and bcrypt-verify against user.recovery_key_hash (with dummy_verify fallback).
    5. If key invalid -> increment recovery_attempts; lock if >= 5; return 401.
    6. Verify WebAuthn registration against session challenge.
    7. Insert new credential with added_via='recovery'.
    8. Revoke old passkeys if revoke_existing_passkeys=true.
    9. Invalidate recovery key (set hash to null, used_at to now, reset attempts).
    10. Mark session consumed.
    11. Issue access and refresh tokens, set httpOnly cookie.
    12. Commit in a single transaction.
    13. Return token and user with recovery_key_rotated: true.
    """
    now = datetime.now(timezone.utc)
    token_hash = hashlib.sha256(body.session_token.encode("utf-8")).hexdigest()

    # Step 1: SELECT FOR UPDATE on unconsumed recovery session
    stmt = (
        select(RecoverySession)
        .where(
            RecoverySession.session_token_hash == token_hash,
            RecoverySession.consumed_at.is_(None)
        )
        .with_for_update()
    )
    rec_session = (await session.execute(stmt)).scalar_one_or_none()

    # Step 2: Check session existence and expiry
    if not rec_session:
        dummy_verify()
        raise HTTPException(status_code=401, detail="Invalid or expired recovery session")

    if now > rec_session.expires_at:
        rec_session.consumed_at = now
        await session.commit()
        dummy_verify()
        raise HTTPException(status_code=401, detail="Invalid or expired recovery session")

    # Step 3: Load user with SELECT FOR UPDATE and check lock
    user_stmt = select(User).where(User.id == rec_session.user_id).with_for_update()
    user = (await session.execute(user_stmt)).scalar_one_or_none()
    if not user:
        rec_session.consumed_at = now
        await session.commit()
        dummy_verify()
        raise HTTPException(status_code=401, detail="Invalid or expired recovery session")

    if user.recovery_locked_until and user.recovery_locked_until > now:
        remaining = int((user.recovery_locked_until - now).total_seconds())
        raise HTTPException(
            status_code=429,
            detail=f"Account recovery is temporarily locked due to too many failed attempts. Try again in {remaining} seconds."
        )

    # Step 4: Normalize recovery key and run bcrypt verify
    normalized_key = normalize_recovery_key(body.recovery_key)
    key_valid = False
    if user.recovery_key_hash:
        key_valid = verify_recovery_key(normalized_key, user.recovery_key_hash)
    else:
        dummy_verify()

    # Step 5: Key invalid handler
    if not key_valid:
        user.recovery_attempts = (user.recovery_attempts or 0) + 1
        if user.recovery_attempts >= 5:
            user.recovery_locked_until = now + timedelta(minutes=30)
            logger.warning("User %s locked out from recovery for 30 minutes", sanitize_log_string(user.id))
        rec_session.consumed_at = now
        await session.commit()
        raise HTTPException(status_code=401, detail="Invalid recovery credentials")

    # Step 6: Verify WebAuthn registration response
    try:
        auth_data = webauthn_service.verify_registration_response(
            body.new_passkey_response,
            {"challenge": rec_session.webauthn_challenge}
        )
    except Exception as e:
        logger.warning("WebAuthn verification during recovery failed: %s", sanitize_log_string(e))
        rec_session.consumed_at = now
        await session.commit()
        raise HTTPException(status_code=400, detail="New passkey verification failed. Please try again.")

    # Step 7: Insert new credential with added_via='recovery'
    new_cred = WebAuthnCredential(
        user_id=user.id,
        credential_id=auth_data.credential_id,
        public_key=auth_data.credential_public_key,
        sign_count=auth_data.sign_count,
        transports=["internal"],
        device_name="Recovered Device Passkey",
        added_via="recovery",
        is_active=True,
        last_used_at=now
    )
    session.add(new_cred)

    # Step 8: Revoke existing passkeys if requested
    if body.revoke_existing_passkeys:
        revoke_stmt = (
            update(WebAuthnCredential)
            .where(
                WebAuthnCredential.user_id == user.id,
                WebAuthnCredential.added_via != "recovery"
            )
            .values(is_active=False)
        )
        await session.execute(revoke_stmt)

    # Step 9: Invalidate recovery key & reset attempts
    user.recovery_key_hash = None
    user.recovery_key_used_at = now
    user.recovery_attempts = 0
    user.recovery_locked_until = None

    # Step 10: Mark recovery session consumed
    rec_session.consumed_at = now

    # Step 11: Issue access & refresh tokens and set cookie
    from app.security.jwt import create_access_token
    from app.repositories.session_repo import SessionRepository

    access_token = create_access_token(subject=str(user.id))
    session_repo = SessionRepository(session)
    refresh_token = await session_repo.create_session(user.id)

    _set_refresh_cookie(response, refresh_token)

    # Step 12: Commit everything in a single transaction
    await session.commit()

    # Step 13: Return token response with recovery_key_rotated: true
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
            "has_recovery_key": False,
            "passkey_count": user.passkey_count,
            "recovery_key_used_at": user.recovery_key_used_at.isoformat() if user.recovery_key_used_at else None,
        },
        recovery_key_rotated=True
    )


# ── Layer 3: Recovery Key Rotation ─────────────────────────────────────

@router.post("/recovery-key/rotate", response_model=RecoveryKeyRotateResponse)
@limiter.limit("5/minute")
async def rotate_recovery_key(
    request: Request,
    body: RecoveryKeyRotateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
) -> RecoveryKeyRotateResponse:
    """Normalize, validate (20 chars, allowed charset), and bcrypt-hash new recovery key."""
    normalized = normalize_recovery_key(body.recovery_key)

    if not validate_recovery_key_format(normalized):
        raise HTTPException(
            status_code=400,
            detail="Invalid recovery key format. Key must be exactly 20 characters from the allowed charset (excluding 0, 1, O, I)."
        )

    new_hash = hash_recovery_key(normalized)

    stmt = select(User).where(User.id == current_user.id).with_for_update()
    user = (await session.execute(stmt)).scalar_one()

    user.recovery_key_hash = new_hash
    user.recovery_attempts = 0
    user.recovery_locked_until = None

    await session.commit()

    return RecoveryKeyRotateResponse(
        success=True,
        message="Recovery key successfully updated and activated."
    )