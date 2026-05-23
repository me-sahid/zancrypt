from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from app.core.config import settings

def setup_tracing() -> None:
    if not settings.ENABLE_OTEL:
        return

    resource = Resource(attributes={
        "service.name": settings.APP_NAME,
        "environment": settings.ENVIRONMENT
    })

    provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(provider)