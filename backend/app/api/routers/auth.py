from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_async_session, get_current_user
from app.schemas.auth import LoginRequest, RefreshRequest, TokenResponse, UserCreate, UserResponse
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.services.session_service import SessionService

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(payload: UserCreate, session: AsyncSession = Depends(get_async_session)) -> UserResponse:
    user = await UserService(session).create_user(payload)
    return UserResponse.model_validate(user)

@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_async_session)) -> TokenResponse:
    tokens = await AuthService(session).authenticate_user(form_data.username, form_data.password)
    return tokens

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshRequest, session: AsyncSession = Depends(get_async_session)) -> TokenResponse:
    return await AuthService(session).refresh_tokens(payload.refresh_token)

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(current_user = Depends(get_current_user), session: AsyncSession = Depends(get_async_session)) -> None:
    await SessionService(session).revoke_active_sessions(current_user.id)

@router.get("/me", response_model=UserResponse)
async def get_self(current_user = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)
