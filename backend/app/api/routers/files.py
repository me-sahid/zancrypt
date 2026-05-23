from typing import List
import json

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, Form
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_async_session, get_current_user
from app.schemas.file import FileMetadataResponse, FileManifestResponse
from app.services.file_service import FileService
from app.storage.routing import StorageRouter

router = APIRouter()

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_file(
    encrypted_filename: str = Form(...),
    encrypted_metadata: str = Form(...),
    file_size: int = Form(...),
    integrity_hash: str = Form(...),
    manifest: str = Form(...),  # JSON string
    thumbnail: str = Form(None),
    folder_id: int = Form(None),
    shards: List[UploadFile] = File(...),
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> dict[str, str]:
    try:
        manifest_payload = json.loads(manifest)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid manifest format")

    shard_data = []
    for shard in shards:
        content = await shard.read()
        shard_data.append((shard.filename, content))

    file_id = await FileService(session).store_encrypted_upload(
        user_id=current_user.id,
        encrypted_filename=encrypted_filename,
        encrypted_metadata=encrypted_metadata,
        file_size=file_size,
        integrity_hash=integrity_hash,
        manifest_payload=manifest_payload,
        shards=shard_data,
        thumbnail=thumbnail,
        folder_id=folder_id
    )
    return {"file_id": str(file_id)}

@router.get("/download/{file_id}")
async def download_file(
    file_id: int, 
    current_user=Depends(get_current_user), 
    session: AsyncSession = Depends(get_async_session)
):
    shards = await FileService(session).download_file_shards(file_id, current_user.id)
    # In a real enterprise app, we might return a zip or a custom stream format.
    # For this simulation, we return the shard metadata and binary data in a JSON structure 
    # (though typically we'd use a better protocol for large files).
    return JSONResponse(content=[
        {"shard_id": s[0], "data": s[1].hex()} for s in shards
    ])

@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(file_id: int, current_user=Depends(get_current_user), session: AsyncSession = Depends(get_async_session)) -> None:
    await FileService(session).delete_file(file_id, current_user.id)

@router.get("/bin", response_model=List[FileMetadataResponse])
async def list_bin_files(current_user=Depends(get_current_user), session: AsyncSession = Depends(get_async_session)) -> List[FileMetadataResponse]:
    return await FileService(session).list_deleted_files(current_user.id)

@router.post("/{file_id}/restore", status_code=status.HTTP_200_OK)
async def restore_file(file_id: int, current_user=Depends(get_current_user), session: AsyncSession = Depends(get_async_session)) -> dict[str, str]:
    await FileService(session).restore_file(file_id, current_user.id)
    return {"status": "restored"}

@router.delete("/{file_id}/purge", status_code=status.HTTP_204_NO_CONTENT)
async def purge_file(file_id: int, current_user=Depends(get_current_user), session: AsyncSession = Depends(get_async_session)) -> None:
    await FileService(session).purge_file(file_id, current_user.id)

@router.get("/list", response_model=List[FileMetadataResponse])
async def list_files(folder_id: int = None, current_user=Depends(get_current_user), session: AsyncSession = Depends(get_async_session)) -> List[FileMetadataResponse]:
    return await FileService(session).list_user_files(current_user.id, folder_id)

@router.get("/{file_id}/manifest", response_model=FileManifestResponse)
async def get_manifest(file_id: int, current_user=Depends(get_current_user), session: AsyncSession = Depends(get_async_session)) -> FileManifestResponse:
    return await FileService(session).get_manifest(file_id, current_user.id)

@router.put("/{file_id}")
async def update_file(
    file_id: int, 
    new_filename: str = Form(...),
    current_user=Depends(get_current_user), 
    session: AsyncSession = Depends(get_async_session)
):
    file = await FileService(session).rename_file(file_id, current_user.id, new_filename)
    return {"id": file.id, "encrypted_filename": file.encrypted_filename}

@router.post("/{file_id}/copy")
async def copy_file(
    file_id: int,
    folder_id: int = None,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = FileService(session)
    new_file = await service.copy_file(file_id, current_user.id, folder_id)
    return {"status": "copied", "new_file_id": new_file.id}

@router.post("/{file_id}/move")
async def move_file(
    file_id: int,
    folder_id: int = None,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = FileService(session)
    file = await service.move_file(file_id, current_user.id, folder_id)
    return {"status": "moved", "file_id": file.id}
