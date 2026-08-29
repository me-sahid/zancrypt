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
    PublicKeyCredentialType,
    AuthenticatorTransport,
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
    "https://drive.zancrypt.in",
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
                resident_key=ResidentKeyRequirement.REQUIRED,
                user_verification=UserVerificationRequirement.REQUIRED,
            ),
        )
        # store challenge as base64url string for safe Redis serialization
        state = {
            "challenge": base64.urlsafe_b64encode(options.challenge).rstrip(b"=").decode()
        }
        serializable_options = json.loads(options_to_json(options))
        return serializable_options, state

    def verify_registration_response(self, response_data, state):
        #  convert challenge back to bytes for verification
        challenge = state["challenge"]
        if isinstance(challenge, str):
            challenge = base64url_to_bytes(challenge)

        verification = verify_registration_response(
            credential=response_data,
            expected_challenge=challenge,
            expected_rp_id=RP_ID,
            expected_origin=ALLOWED_ORIGINS,
        )
        return verification

    def generate_authentication_options(self, credentials):
        #  debug prints — check Render logs after login attempt
        for c in credentials:
            print("DB credential_id type:", type(c.credential_id))
            print("DB credential_id value:", c.credential_id)
            print("DB credential_id length:", len(c.credential_id))

        allow_credentials = []
        for c in credentials:
            allow_credentials.append(
                PublicKeyCredentialDescriptor(
                    id=bytes(c.credential_id),
                    type=PublicKeyCredentialType.PUBLIC_KEY,
                    transports=[AuthenticatorTransport.INTERNAL],
                )
            )

        options = generate_authentication_options(
            rp_id=RP_ID,
            allow_credentials=allow_credentials,
            user_verification=UserVerificationRequirement.REQUIRED,
        )

        state = {
            "challenge": base64.urlsafe_b64encode(options.challenge).rstrip(b"=").decode(),
            "user_verification": "required"
        }

        serializable_options = {
            "challenge": base64.urlsafe_b64encode(options.challenge).rstrip(b"=").decode(),
            "timeout": options.timeout,
            "rpId": options.rp_id,
            "allowCredentials": [
                {
                    "id": base64.urlsafe_b64encode(
                        bytes(c.credential_id)
                    ).rstrip(b"=").decode(),
                    "type": "public-key",
                    "transports": c.transports or ["internal"],
                }
                for c in credentials
            ],
            "userVerification": "required",
        }

        return {"publicKey": serializable_options}, state

    def verify_authentication_response(self, response_data, state, credentials):
        credential_id = base64url_to_bytes(response_data["id"])

        print("Looking for credential_id bytes:", credential_id)
        print("Looking for credential_id length:", len(credential_id))

        target = None
        for c in credentials:
            stored_id = bytes(c.credential_id)  
            print("Comparing with stored_id:", stored_id, "length:", len(stored_id))
            if stored_id == credential_id:
                target = c
                break

        if not target:
            raise ValueError(
                f"Credential not found. "
                f"Looking for {len(credential_id)} bytes among {len(credentials)} stored credentials."
            )

        challenge = state["challenge"]
        if isinstance(challenge, str):
            challenge = base64url_to_bytes(challenge)

        verification = verify_authentication_response(
            credential=response_data,
            expected_challenge=challenge,
            expected_rp_id=RP_ID,
            expected_origin=ALLOWED_ORIGINS,
            credential_public_key=bytes(target.public_key),
            credential_current_sign_count=target.sign_count or 0,
        )

        return verification, verification.new_sign_count