from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "vault_workers",
    broker=settings.REDIS_BROKER_URL,
    backend=settings.REDIS_BACKEND_URL,
    include=["app.tasks.maintenance", "app.workers.expiry_worker"]
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

celery_app.conf.beat_schedule = {
    "expire-shares-every-5-min": {
        "task": "app.workers.expiry_worker.expire_shares",
        "schedule": crontab(minute="*/5"),
    },
    "retry-pending-deletions-every-30-min": {
        "task": "app.workers.expiry_worker.retry_pending_deletions",
        "schedule": crontab(minute="*/30"),
    },
}

if __name__ == "__main__":
    celery_app.start()

