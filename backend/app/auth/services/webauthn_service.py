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
from webauthn.helpers.structs import (
    UserVerificationRequirement,
    PublicKeyCredentialDescriptor,
    PublicKeyCredentialType,
    AuthenticatorTransport,        # ← add this
)
from webauthn.helpers.options_to_json import options_to_json

from app.core.config import settings

RP_ID = settings.RP_ID
RP_NAME = settings.RP_NAME
ORIGIN = os.environ.get("WEBAUTHN_ORIGIN", "https://zancrypt.in")

ALLOWED_ORIGINS = settings.CORS_ORIGINS + [
    "https://zancrypt.in",
    "https://www.zancrypt.in",
    "https://vault.zancrypt.in",
    "https://zancrypt-front.pages.dev",
]


def _to_bytes(value) -> bytes:
    if isinstance(value, (bytes, bytearray, memoryview)):
        return bytes(value)
    if isinstance(value, str):
        try:
            padding = 4 - len(value) % 4
            if padding != 4:
                value += '=' * padding
            return base64.urlsafe_b64decode(value)
        except Exception:
            return value.encode()
    if isinstance(value, int):
        return value.to_bytes((value.bit_length() + 7) // 8, 'big')
    return bytes(value)


class WebAuthnService:

    def generate_registration_options(self, user_id: bytes, username: str, display_name: str):
        options = generate_registration_options(
            rp_id=RP_ID,
            rp_name=RP_NAME,
            user_id=user_id,
            user_name=username,
            user_display_name=display_name,
            attestation=AttestationConveyancePreference.NONE,
            authenticator_selection=AuthenticatorSelectionCriteria(
                resident_key=ResidentKeyRequirement.PREFERRED,
                user_verification=UserVerificationRequirement.REQUIRED,
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
            raw_id = _to_bytes(raw_id)
            allow_credentials.append(
                PublicKeyCredentialDescriptor(
                    id=raw_id,
                    type=PublicKeyCredentialType.PUBLIC_KEY,
                    transports=[AuthenticatorTransport.INTERNAL],
                    )
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

        serializable_options = {
            "challenge": base64.urlsafe_b64encode(options.challenge).rstrip(b"=").decode(),
            "timeout": options.timeout,
            "rpId": options.rp_id,
            "allowCredentials": [
                {
                    "id": base64.urlsafe_b64encode(
                        _to_bytes(c.id if hasattr(c, 'id') else c.credential_id)
                    ).rstrip(b"=").decode(),
                    "type": "public-key"
                }
                for c in credentials
            ],
            "userVerification": "preferred",
        }

        return {"publicKey": serializable_options}, state

    def verify_authentication_response(self, response_data, state, credentials):
        credential_id = base64url_to_bytes(response_data["id"])

        target = None
        for c in credentials:
            stored_id = _to_bytes(
                c.id if hasattr(c, 'id') else c.credential_id
            )
            if stored_id == credential_id:
                target = c
                break

        if not target:
            raise ValueError(f"Credential not found. Looking for {len(credential_id)} bytes among {len(credentials)} stored credentials.")

        public_key = _to_bytes(target.public_key)

        verification = verify_authentication_response(
            credential=response_data,
            expected_challenge=state["challenge"],
            expected_rp_id=RP_ID,
            expected_origin=ALLOWED_ORIGINS,
            credential_public_key=public_key,
            credential_current_sign_count=target.sign_count or 0,
        )

        return verification, verification.new_sign_count