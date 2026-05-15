from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi import APIRouter, Response

router = APIRouter()

# Metrics
UPLOAD_COUNTER = Counter("vault_uploads_total", "Total number of file uploads")
DOWNLOAD_COUNTER = Counter("vault_downloads_total", "Total number of file downloads")
AUTH_FAILURE_COUNTER = Counter("vault_auth_failures_total", "Total number of authentication failures")
UPLOAD_LATENCY = Histogram("vault_upload_latency_seconds", "Latency of file uploads")
NODE_HEALTH_STATUS = Counter("vault_node_health_status", "Node health check status", ["node_name", "status"])

@router.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
