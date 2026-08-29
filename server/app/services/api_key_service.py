import secrets
import string
from typing import Tuple

from app.core.crypto import encrypt_symmetric, decrypt_symmetric

class ApiKeyService:
    PREFIX = "zan_sk_"

    @staticmethod
    def generate_raw_key() -> str:
        """Generate a secure, random API key string."""
        alphabet = string.ascii_letters + string.digits
        secret_part = ''.join(secrets.choice(alphabet) for _ in range(32))
        return f"{ApiKeyService.PREFIX}{secret_part}"

    @staticmethod
    def extract_prefix(raw_key: str) -> str:
        """Extract the first 15 characters to use as a DB lookup prefix."""
        return raw_key[:15]

    @staticmethod
    def encrypt_key(raw_key: str) -> str:
        """Encrypt the API key for storage."""
        return encrypt_symmetric(raw_key)
    
    @staticmethod
    def decrypt_key(encrypted_key: str) -> str:
        """Decrypt the API key from storage to show to the user."""
        return decrypt_symmetric(encrypted_key)
