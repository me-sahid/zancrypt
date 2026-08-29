from app.main import limiter
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.api.deps import get_async_session, get_current_user
from app.schemas.auth import LoginRequest, RefreshRequest, TokenResponse, UserCreate, UserResponse, UserUpdate
from app.services.user_service import UserService
from app.services.session_service import SessionService

logger = logging.getLogger(__name__)

router = APIRouter()

from app.core.config import settings

# ── Cookie constants ───────────────────────────────────────────────
# In production, use the root domain (e.g., .zancrypt.in) to share cookies across subdomains.
# In development, it's often better to omit the domain (None) or use localhost.
COOKIE_DOMAIN = f".{settings.DOMAIN}" if settings.DOMAIN != "localhost" else None
COOKIE_PATH     = "/"
COOKIE_MAX_AGE  = 7 * 24 * 60 * 60  


def _set_refresh_cookie(response: Response, token: str) -> None:
    cookie_kwargs = {
        "key": "refresh_token",
        "value": token,
        "httponly": True,
        "secure": True,
        "samesite": "none",
        "path": COOKIE_PATH,
        "max_age": COOKIE_MAX_AGE,
    }
    if COOKIE_DOMAIN:
        cookie_kwargs["domain"] = COOKIE_DOMAIN
    response.set_cookie(**cookie_kwargs)


def _delete_refresh_cookie(response: Response) -> None:
    cookie_kwargs = {
        "key": "refresh_token",
        "httponly": True,
        "secure": True,
        "samesite": "none",
        "path": COOKIE_PATH,
    }
    if COOKIE_DOMAIN:
        cookie_kwargs["domain"] = COOKIE_DOMAIN
    response.delete_cookie(**cookie_kwargs)


# ── Routes ────────────────────────────────────────────────────────

@router.post("/register", response_model=UserResponse)
@limiter.limit("3/minute")
async def register_user(
    request: Request,
    payload: UserCreate,
    session: AsyncSession = Depends(get_async_session)
) -> UserResponse:
    user = await UserService(session).create_user(payload)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("7/minute")
async def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_async_session)
) -> TokenResponse:
    tokens = await AuthService(session).authenticate_user(
        form_data.username, form_data.password
    )
    _set_refresh_cookie(response, tokens.refresh_token)
    return tokens


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("20/hour")
async def refresh_token(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_async_session)
) -> TokenResponse:
    # Validate Origin to prevent CSRF on this endpoint
    origin = request.headers.get("origin", "")
    allowed = settings.CORS_ORIGINS
    if origin and origin not in allowed:
        raise HTTPException(status_code=403, detail="Invalid request origin")

    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    tokens = await AuthService(session).refresh_tokens(token)
    _set_refresh_cookie(response, tokens.refresh_token)
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

    # Delete cookie — attributes MUST match set_cookie exactly
    _delete_refresh_cookie(response)


@router.get("/me", response_model=UserResponse)
async def get_self(
    current_user=Depends(get_current_user)
) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    payload: UserUpdate,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
) -> UserResponse:
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.region is not None:
        current_user.region = payload.region
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return UserResponse.model_validate(current_user)