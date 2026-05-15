import logging
import sys
from datetime import datetime
from typing import Any, Dict

from pythonjsonlogger import jsonlogger
from app.core.config import settings

from fastapi import FastAPI

def configure_structured_logging(app: FastAPI | None = None) -> None:
    """
    Configures structured JSON logging for the application using python-json-logger.
    """
    logger = logging.getLogger("vault_logger")
    logger.setLevel(settings.LOG_LEVEL)
    
    # Remove existing handlers to avoid duplicates
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
        
    handler = logging.StreamHandler(sys.stdout)
    formatter = CustomJSONFormatter('%(timestamp)s %(level)s %(name)s %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

class CustomJSONFormatter(jsonlogger.JsonFormatter):
    """
    Custom JSON formatter to add extra enterprise fields.
    """
    def add_fields(self, log_record: Dict[str, Any], record: logging.LogRecord, message_dict: Dict[str, Any]) -> None:
        super().add_fields(log_record, record, message_dict)
        if not log_record.get('timestamp'):
            log_record['timestamp'] = datetime.utcnow().isoformat()
        if log_record.get('level'):
            log_record['level'] = log_record['level'].upper()
        else:
            log_record['level'] = record.levelname
            
        log_record["service"] = settings.APP_NAME
        log_record["environment"] = settings.ENVIRONMENT

