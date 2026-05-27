from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.api.deps import get_async_session, get_current_user
from app.schemas.auth import LoginRequest, RefreshRequest, TokenResponse, UserCreate, UserResponse, UserUpdate
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.services.session_service import SessionService

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(payload: UserCreate, session: AsyncSession = Depends(get_async_session)) -> UserResponse:
    user = await UserService(session).create_user(payload)
    return UserResponse.model_validate(user)

@router.post("/login", response_model=TokenResponse)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(), 
    session: AsyncSession = Depends(get_async_session)
) -> TokenResponse:
    tokens = await AuthService(session).authenticate_user(form_data.username, form_data.password)
    
    # Set the refresh token in an HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        httponly=True,
        secure=True, # Must be True for SameSite=None
        samesite="none",  # Cross-site cookies mandatory for detached frontend deployments
        max_age=7 * 24 * 60 * 60, # 7 days
    )
    return tokens

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
    
    # Rotate the refresh cookie
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        httponly=True,
        secure=True,
        samesite="none",
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
    
    # Clear the refresh token cookie
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=True,
        samesite="none"
    )

@router.get("/me", response_model=UserResponse)
async def get_self(current_user = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    payload: UserUpdate,
    current_user = Depends(get_current_user),
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
