import os
import base64
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

RP_ID = os.environ.get("WEBAUTHN_RP_ID", "zancrypt.in")
RP_NAME = os.environ.get("WEBAUTHN_RP_NAME", "Zancrypt")
ORIGIN = os.environ.get("WEBAUTHN_ORIGIN", "https://zancrypt.in")

ALLOWED_ORIGINS = [
    "https://zancrypt.in",
    "https://www.zancrypt.in",
    "https://vault.zancrypt.in",
]

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
                user_verification=UserVerificationRequirement.PREFERRED,
            ),
        )

        # Store challenge as bytes for later verification
        state = {"challenge": options.challenge}

        import json
        from webauthn.helpers.options_to_json import options_to_json
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
        allow_credentials = [
            PublicKeyCredentialDescriptor(id=c.id if hasattr(c, 'id') else c.credential_id)
            for c in credentials
        ]

        options = generate_authentication_options(
            rp_id=RP_ID,
            allow_credentials=allow_credentials,
            user_verification=UserVerificationRequirement.PREFERRED,
        )

        state = {"challenge": options.challenge, "user_verification": options.user_verification.value if hasattr(options.user_verification, 'value') else options.user_verification}

        import json
        from webauthn.helpers.options_to_json import options_to_json
        serializable_options = json.loads(options_to_json(options))

        return serializable_options, state

    def verify_authentication_response(self, response_data, state, credentials):
        # Find the credential that matches
        credential_id = base64url_to_bytes(response_data["id"])
        target = next(
            (c for c in credentials if c.credential_id == credential_id), None
        )
        if not target:
            raise ValueError("Credential not found")

        verification = verify_authentication_response(
            credential=response_data,
            expected_challenge=state["challenge"],
            expected_rp_id=RP_ID,
            expected_origin=ALLOWED_ORIGINS,
            credential_public_key=target.public_key,
            credential_current_sign_count=target.sign_count,
        )

        return verification, verification.new_sign_count