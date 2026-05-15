from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
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
    
    # In a real enterprise app, we'd use a real collector URL
    # exporter = OTLPSpanExporter(endpoint="http://otel-collector:4317")
    # provider.add_span_processor(BatchSpanProcessor(exporter))
    
    trace.set_tracer_provider(provider)
