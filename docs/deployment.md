# Deployment

This document outlines the deployment strategy for Zancrypt in a production environment. 

## Infrastructure Components
A standard production deployment requires the following containers:
- **PostgreSQL 15+**: Relational database for metadata, nodes, and audit logs.
- **Redis 7+**: Key-value store for session state, Celery message brokering, and caching.
- **FastAPI Backend**: Uvicorn/Gunicorn ASGI server running Python 3.12.
- **Celery Worker**: Background task processors.
- **Nginx**: Edge reverse proxy.
- **React Frontend**: Served via Nginx as static compiled assets.

## Docker Compose Configuration
Zancrypt ships with a `docker-compose.yml` file designed to orchestrate these components seamlessly on a single VPS or a containerized environment.

```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d --build
```

Nginx acts as the edge router:
- `/api/`, `/auth/`, `/files/` requests are reverse-proxied to the backend ASGI container.
- All other requests are served by the frontend static container.

## Environment Variables
Security relies on properly configuring the production `.env` files. Ensure the following are securely set in the production environment:
- `JWT_SECRET_KEY` and `JWT_REFRESH_SECRET_KEY`: High-entropy secrets for signing JWTs.
- `DATABASE_URL`: Connection string for PostgreSQL (e.g., `postgresql+asyncpg://user:pass@db:5432/zancrypt`).
- `REDIS_URL`: Connection string for Redis.
- Storage credentials (e.g., AWS S3 credentials, Backblaze B2 Application Keys) used by the storage router.

## Observability & Logging
- **Structured JSON Logs**: Ensure the backend loggers utilize `python-json-logger` for integration with ELK or Datadog.
- **OpenTelemetry**: Configure OTLP exporters in the backend to trace FastAPI latencies in production if required.
