# Secure Distributed File Vault

Enterprise-grade backend for a zero-knowledge encrypted distributed storage platform.

## Architecture

- FastAPI async API gateway
- PostgreSQL encrypted metadata storage
- Redis sessions, rate limiting, and Celery broker
- Celery background jobs for integrity sweeps and recovery
- Nginx reverse proxy for TLS termination, buffering, and security headers
- OpenTelemetry tracing and Prometheus observability

## Features

- JWT auth with refresh tokens and session revocation
- Role-based access control
- Encrypted shard upload/download
- Manifest-based metadata management
- Distributed storage node routing with rendezvous hashing
- Immutable audit trail and security event logging

## Local Development

1. Copy `.env.example` to `.env`
2. Build and start with Docker Compose:

```bash
cd backend
docker compose up --build
```

3. Visit `http://localhost:8000/docs`

## Services

- `web` - FastAPI application
- `worker` - Celery worker for async tasks
- `postgres` - PostgreSQL metadata database
- `redis` - Redis cache and broker
- `nginx` - Reverse proxy and edge security layer

## Project Layout

- `app/` - application code
- `tests/` - automated tests
- `docker/` - container build definitions
- `nginx/` - reverse proxy configuration
- `prometheus/` - metrics collection config
- `grafana/` - dashboard definitions

## API Endpoints

- `/auth/register`
- `/auth/login`
- `/auth/refresh`
- `/auth/logout`
- `/auth/me`
- `/files/upload`
- `/files/download/{id}`
- `/files/{id}`
- `/files/list`
- `/files/{id}/manifest`
- `/files/{id}/restore`
- `/admin/logs`
- `/admin/security-events`
- `/admin/node-health`
- `/admin/system-metrics`
- `/health`
- `/health/redis`
- `/health/postgres`
- `/health/nodes`

## Testing

```bash
cd backend
pip install -r requirements/dev.txt
pytest
```
