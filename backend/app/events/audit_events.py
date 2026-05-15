from datetime import datetime


def build_audit_payload(user_id: int | None, action: str, resource_id: str, metadata: dict) -> dict:
    return {"user_id": user_id, "action": action, "resource_id": resource_id, "metadata": metadata, "timestamp": datetime.utcnow().isoformat()}
