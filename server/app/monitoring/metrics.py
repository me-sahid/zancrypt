from prometheus_client import Counter, Gauge, Histogram

UPLOAD_LATENCY = Histogram("vault_upload_latency_seconds", "Upload latency for encrypted shard uploads")
AUTH_FAILURES = Counter("vault_auth_failures_total", "Authentication failure count")
ACTIVE_NODES = Gauge("vault_active_nodes", "Number of active storage nodes")
TOTAL_FILES = Gauge("vault_total_files", "Total files stored in metadata store")
