from fastapi import HTTPException, status


def validate_upload_size(size: int, max_size: int) -> None:
    if size > max_size:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Upload exceeds maximum allowed size")
