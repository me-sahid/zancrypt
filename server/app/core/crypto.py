import base64
import hashlib
from cryptography.fernet import Fernet
from app.core.config import settings

def get_fernet_key() -> bytes:
    """
    Derive a 32-byte url-safe base64 key from the application SECRET_KEY
    to be used for Fernet symmetric encryption.
    """
    digest = hashlib.sha256(settings.SECRET_KEY.encode('utf-8')).digest()
    return base64.urlsafe_b64encode(digest)

fernet = Fernet(get_fernet_key())

def encrypt_symmetric(data: str) -> str:
    """Encrypt a string symmetrically using Fernet."""
    if not data:
        return data
    return fernet.encrypt(data.encode('utf-8')).decode('utf-8')

def decrypt_symmetric(encrypted_data: str) -> str:
    """Decrypt a Fernet encrypted string."""
    if not encrypted_data:
        return encrypted_data
    try:
        return fernet.decrypt(encrypted_data.encode('utf-8')).decode('utf-8')
    except Exception:
        return None
