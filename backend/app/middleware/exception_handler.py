from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

import traceback

def register_exception_handlers(app) -> None:
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        print("SQLAlchemyError:", exc)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": f"Database failure: {str(exc)}"})

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        print("Generic Exception:", exc)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": f"Internal server error: {str(exc)}"})
