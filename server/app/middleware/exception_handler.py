import logging
import traceback
import uuid

from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)


def register_exception_handlers(app) -> None:
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        error_id = str(uuid.uuid4())[:8]
        logger.error(
            "SQLAlchemyError [%s] %s %s: %s",
            error_id,
            request.method,
            request.url.path,
            exc,
            exc_info=True,
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "A database error occurred.", "error_id": error_id},
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        error_id = str(uuid.uuid4())[:8]
        logger.error(
            "Unhandled exception [%s] %s %s: %s",
            error_id,
            request.method,
            request.url.path,
            exc,
            exc_info=True,
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal server error occurred.", "error_id": error_id},
        )

