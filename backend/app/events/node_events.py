from datetime import datetime


def build_node_status(node_name: str, healthy: bool) -> dict:
    return {"node_name": node_name, "healthy": healthy, "checked_at": datetime.utcnow().isoformat()}
