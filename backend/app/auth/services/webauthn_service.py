import os
import base64
import json
from webauthn import (
    generate_registration_options,
    verify_registration_response,
    generate_authentication_options,
    verify_authentication_response,
    base64url_to_bytes,
)
from webauthn.helpers.structs import (
    AuthenticatorSelectionCriteria,
    UserVerificationRequirement,
    ResidentKeyRequirement,
    PublicKeyCredentialDescriptor,
    AttestationConveyancePreference,
)
from webauthn.helpers.cose import COSEAlgorithmIdentifier
from webauthn.helpers.options_to_json import options_to_json
from app.core.config import settings

RP_ID = settings.RP_ID
RP_NAME = settings.RP_NAME

ALLOWED_ORIGINS = [
    "https://zancrypt.in",
    "https://www.zancrypt.in",
    "https://vault.zancrypt.in",
    "https://zancrypt-front.pages.dev",
] + settings.CORS_ORIGINS


def _str_to_bytes(value) -> bytes:
    """Convert credential_id from string to bytes safely."""
    if isinstance(value, bytes):
        return value
    if isinstance(value, str):
        padding = 4 - len(value) % 4
        if padding != 4:
            value += '=' * padding
        return base64.urlsafe_b64decode(value)
    if isinstance(value, int):
        return value.to_bytes((value.bit_length() + 7) // 8, 'big')
    return bytes(value)


class WebAuthnService:

    def generate_registration_options(
        self,
        user_id: bytes,
        username: str,
        display_name: str
    ):
        options = generate_registration_options(
            rp_id=RP_ID,
            rp_name=RP_NAME,
            user_id=user_id,
            user_name=username,
            user_display_name=display_name,
            attestation=AttestationConveyancePreference.NONE,
            authenticator_selection=AuthenticatorSelectionCriteria(
                resident_key=ResidentKeyRequirement.REQUIRED,
                user_verification=UserVerificationRequirement.PREFERRED,
            ),
        )

        state = {"challenge": options.challenge}
        serializable_options = json.loads(options_to_json(options))
        return serializable_options, state

    def verify_registration_response(self, response_data, state):
        verification = verify_registration_response(
            credential=response_data,
            expected_challenge=state["challenge"],
            expected_rp_id=RP_ID,
            expected_origin=ALLOWED_ORIGINS,
        )
        return verification

    def generate_authentication_options(self, credentials):
        allow_credentials = []
        for c in credentials:
            raw_id = c.id if hasattr(c, 'id') else c.credential_id
            raw_id = _str_to_bytes(raw_id)
            allow_credentials.append(
                PublicKeyCredentialDescriptor(id=raw_id)
            )

        options = generate_authentication_options(
            rp_id=RP_ID,
            allow_credentials=allow_credentials,
            user_verification=UserVerificationRequirement.PREFERRED,
        )

        state = {
            "challenge": options.challenge,
            "user_verification": (
                options.user_verification.value
                if hasattr(options.user_verification, 'value')
                else options.user_verification
            )
        }

        serializable_options = json.loads(options_to_json(options))
        return serializable_options, state

    def verify_authentication_response(self, response_data, state, credentials):
        from webauthn.helpers import base64url_to_bytes
    
        credential_id = base64url_to_bytes(response_data["id"])
    
    # find matching credential — convert DB bytes properly
        target = None
        for c in credentials:
            db_cred_id = bytes(c.credential_id) if not isinstance(c.credential_id, bytes) else c.credential_id
            if db_cred_id == credential_id:
                target = c
                break

        if not target:
            raise ValueError("Credential not found")

        db_public_key = bytes(target.public_key) if not isinstance(target.public_key, bytes) else target.public_key

        verification = verify_authentication_response(
            credential=response_data,
            expected_challenge=state["challenge"],
            expected_rp_id=RP_ID,
            expected_origin=ALLOWED_ORIGINS,
            credential_public_key=db_public_key,
            credential_current_sign_count=target.sign_count,
        )

        return verification, verification.new_sign_count