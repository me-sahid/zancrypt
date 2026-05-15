from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.workers.tasks import integrity_sweep, orphan_cleanup, node_recovery, audit_archival

scheduler = AsyncIOScheduler()

scheduler.add_job(integrity_sweep.delay, "interval", minutes=30, id="integrity_sweep")
scheduler.add_job(orphan_cleanup.delay, "interval", minutes=45, id="orphan_cleanup")
scheduler.add_job(node_recovery.delay, "interval", minutes=20, id="node_recovery")
scheduler.add_job(audit_archival.delay, "interval", hours=1, id="audit_archival")

def start_scheduler() -> None:
    if not scheduler.running:
        scheduler.start()
