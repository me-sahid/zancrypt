from typing import AsyncGenerator

from fastapi import Depends, HTTPException, status, Request
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import UserRole

from app.core.config import settings
from app.models.session import Session
from app.models.user import User
from app.repositories.session_repo import SessionRepository
from app.repositories.user_repo import UserRepository
from app.security.jwt import decode_access_token
from app.security.tokens import TokenData
from app.services.auth_service import AuthService
from app.services.session_service import SessionService
from app.storage.routing import StorageRouter
from app.db import get_async_session

async def get_current_user(token: str = Depends(AuthService.oauth2_scheme), session: AsyncSession = Depends(get_async_session)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    user = await UserRepository(session).get_by_id(int(token_data.user_id))
    if not user:
        raise credentials_exception
    return user


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Requires the current user to have admin role. Raises 403 otherwise."""
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )
    return current_user


from fastapi.security import APIKeyHeader, SecurityScopes
from app.repositories.api_key_repo import ApiKeyRepository
from app.services.api_key_service import ApiKeyService
from sqlalchemy import update

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def get_current_user_from_api_key(
    request: Request,
    security_scopes: SecurityScopes,
    api_key_header: str = Depends(api_key_header),
    session: AsyncSession = Depends(get_async_session)
) -> User:
    if not api_key_header:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing API Key")
    
    prefix = ApiKeyService.extract_prefix(api_key_header)
    api_key_repo = ApiKeyRepository(session)
    api_key = await api_key_repo.get_by_prefix(prefix)
    
    if not api_key or not api_key.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or inactive API Key")
    
    decrypted_key = ApiKeyService.decrypt_key(api_key.encrypted_key)
    if decrypted_key != api_key_header:
         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API Key")

    # Scope validation
    if security_scopes.scopes:
        key_scopes = set(api_key.scopes or [])
        if "*" not in key_scopes and not set(security_scopes.scopes).intersection(key_scopes):
             raise HTTPException(
                 status_code=status.HTTP_403_FORBIDDEN, 
                 detail=f"API Key lacks required scopes. Required: {security_scopes.scopes}"
             )

    # App Restrictions validation
    restrictions = api_key.app_restrictions or {}
    android_apps = restrictions.get("android_apps", [])
    ios_bundles = restrictions.get("ios_bundle_ids", [])
    web_origins = restrictions.get("web_origins", [])
    ip_addresses = restrictions.get("ip_addresses", [])
    
    if android_apps or ios_bundles or web_origins or ip_addresses:
        is_valid = False
        
        # Check Android
        if android_apps and not is_valid:
            pkg_name = request.headers.get("X-Android-Package")
            cert = request.headers.get("X-Android-Cert")
            if pkg_name and cert:
                for app in android_apps:
                    if app.get("package_name") == pkg_name and (app.get("sha1") == cert or app.get("sha256") == cert):
                        is_valid = True
                        break

        # Check iOS
        if ios_bundles and not is_valid:
            bundle_id = request.headers.get("X-Ios-Bundle-Identifier")
            if bundle_id and bundle_id in ios_bundles:
                is_valid = True
                
        # Check Web
        if web_origins and not is_valid:
            origin = request.headers.get("Origin") or request.headers.get("Referer")
            if origin:
                import fnmatch
                for allowed in web_origins:
                    if fnmatch.fnmatch(origin, allowed) or fnmatch.fnmatch(origin, allowed + "*"):
                        is_valid = True
                        break
                        
        # Check IPs
        if ip_addresses and not is_valid:
            client_ip = request.client.host if request.client else None
            if client_ip and client_ip in ip_addresses:
                is_valid = True
                
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="API Key application restriction failed. Missing or invalid origin headers.")

    # Rules Enforcement (Expiration & Rate Limiting)
    rules = api_key.rules or {}
    
    expires_at = rules.get("expires_at")
    if expires_at:
        from datetime import datetime
        if isinstance(expires_at, str):
            try:
                # Handle basic iso format
                expires_dt = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
                # If naive, make it UTC
                if expires_dt.tzinfo is None:
                    from datetime import timezone
                    expires_dt = expires_dt.replace(tzinfo=timezone.utc)
                
                now = datetime.utcnow().replace(tzinfo=timezone.utc)
                if now > expires_dt:
                    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="API Key has expired")
            except ValueError:
                pass
                
    rate_limit_rpm = rules.get("rate_limit_rpm")
    if rate_limit_rpm:
        import redis.asyncio as redis
        from app.core.config import settings
        redis_client = redis.from_url(settings.REDIS_URL)
        rl_key = f"ratelimit:apikey:{api_key.id}"
        try:
            current = await redis_client.incr(rl_key)
            if current == 1:
                await redis_client.expire(rl_key, 60)
            if current > rate_limit_rpm:
                raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="API Key rate limit exceeded")
        finally:
            await redis_client.aclose()
            
    # Inject api_key for downstream endpoint usage
    request.state.api_key = api_key

    user_repo = UserRepository(session)
    user = await user_repo.get_by_id(api_key.user_id)
    
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive")
        
    if user.api_credits <= 0:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="Insufficient API credits. Please purchase more credits to continue.")
        
    # Deduct credit and record usage
    await api_key_repo.record_usage(api_key.id)
    
    stmt = (
        update(User)
        .where(User.id == user.id)
        .values(api_credits=User.api_credits - 1, total_api_calls=User.total_api_calls + 1)
    )
    await session.execute(stmt)
    await session.commit()
    await session.refresh(user)

    return user

async def get_current_user_or_api_key(
    request: Request,
    security_scopes: SecurityScopes,
    token: str = Depends(AuthService.oauth2_scheme),
    api_key: str = Depends(api_key_header),
    session: AsyncSession = Depends(get_async_session)
) -> User:
    """Allows either JWT token or API Key"""
    if api_key:
        return await get_current_user_from_api_key(request, security_scopes, api_key, session)
    return await get_current_user(token, session)

async def get_storage_router() -> StorageRouter:
    return StorageRouter()
