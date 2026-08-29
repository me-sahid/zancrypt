from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from app.core.config import settings

def instrument_app(app):
    if settings.ENABLE_OTEL:
        FastAPIInstrumentor.instrument_app(app)
