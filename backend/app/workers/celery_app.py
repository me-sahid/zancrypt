from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "vault_workers",
    broker=settings.REDIS_BROKER_URL,
    backend=settings.REDIS_BACKEND_URL,
    include=["app.tasks.maintenance"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour
)

if __name__ == "__main__":
    celery_app.start()
