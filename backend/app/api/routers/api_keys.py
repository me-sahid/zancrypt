from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_async_session
from app.models.user import User
from app.schemas.api_key import ApiKeyCreate, ApiKeyResponse
from app.repositories.api_key_repo import ApiKeyRepository
from app.services.api_key_service import ApiKeyService
from app.api.deps import get_current_user

router = APIRouter()

@router.post("", response_model=ApiKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    data: ApiKeyCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Create a new API Key for the current user."""
    raw_key = ApiKeyService.generate_raw_key()
    prefix = ApiKeyService.extract_prefix(raw_key)
    encrypted_key = ApiKeyService.encrypt_key(raw_key)
    
    repo = ApiKeyRepository(session)
    api_key = await repo.create(
        user_id=current_user.id,
        name=data.name,
        prefix=prefix,
        encrypted_key=encrypted_key,
        scopes=data.scopes,
        app_restrictions=data.app_restrictions.model_dump() if data.app_restrictions else {}
    )
    
    # Return the key with the raw secret for the user to copy
    response = ApiKeyResponse.model_validate(api_key)
    response.secret_key = raw_key
    return response

@router.get("", response_model=List[ApiKeyResponse])
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """List all API Keys for the current user."""
    repo = ApiKeyRepository(session)
    keys = await repo.list_for_user(current_user.id)
    
    # We decrypt the secret key for each so they can copy them in the UI
    responses = []
    for key in keys:
        resp = ApiKeyResponse.model_validate(key)
        resp.secret_key = ApiKeyService.decrypt_key(key.encrypted_key)
        responses.append(resp)
        
    return responses

@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    key_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Revoke (delete) an API Key."""
    repo = ApiKeyRepository(session)
    key = await repo.get_by_id_and_user(key_id, current_user.id)
    if not key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API Key not found")
        
    await repo.delete(key_id)
