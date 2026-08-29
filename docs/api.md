# API Documentation

Zancrypt provides a robust asynchronous REST API built with FastAPI. 

## Swagger Documentation
When the server server is running, FastAPI automatically generates comprehensive interactive API documentation. You can access it in your browser at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Core API Modules

### Authentication (`/auth`)
Handles zero-knowledge registration and login via FIDO2 / WebAuthn, as well as JWT issuance.
- `POST /auth/register/start`: Generates FIDO2 credential challenges.
- `POST /auth/register/verify`: Verifies the signed attestation and stores public keys.
- `POST /auth/login/fallback`: Fallback authentication using the hashed access key.
- `POST /auth/refresh`: Refresh JWT tokens.

### File Management (`/files`)
Handles file metadata, chunked uploads, and shard retrieval. Note that files must be encrypted client-side before submission.
- `POST /files/upload`: Accepts a `multipart/form-data` request containing file shards and a manifest mapping.
- `GET /files/{file_id}/download`: Retrieves the manifest to facilitate downloading distributed shards.
- `DELETE /files/{file_id}`: Soft deletes the file and queues a Celery task for eventual physical shard cleanup.

### Sharing (`/share`)
Handles the creation of secure sharing links and Self-Destructing HTML wrappers.
- `POST /share/create`: Generates a sharing token and sets expiration limits.
- `POST /share/destroyed`: A telemetry endpoint used by Self-Destructing HTML wrappers to report local deletion.

### Storage & Telemetry (`/storage`, `/metrics`)
- Routes for fetching node health, connection latency traces, and capacity metrics used by the web dashboard visualizers (Recharts).
