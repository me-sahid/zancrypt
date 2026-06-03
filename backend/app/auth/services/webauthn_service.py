import json
import os
from fido2.server import Fido2Server
from fido2.webauthn import (
    PublicKeyCredentialRpEntity, 
    AuthenticatorSelectionCriteria, 
    UserVerificationRequirement,
    RegistrationResponse,
    AuthenticationResponse,
    AuthenticatorAttestationResponse, 
    CollectedClientData, 
    AttestationObject,
    AuthenticatorAssertionResponse,
    AuthenticatorData
)
from fido2.utils import websafe_encode, websafe_decode
from app.core.config import settings

class WebAuthnService:
    def __init__(self):
        rp = PublicKeyCredentialRpEntity(id=settings.RP_ID, name=settings.RP_NAME)
        
        # Accept origins matching our known deployments
        def verify_origin(origin: str) -> bool:
            return origin in settings.ALLOWED_ORIGINS or origin == f"https://{settings.RP_ID}"
            
        self.server = Fido2Server(rp, verify_origin=verify_origin)

    def generate_registration_options(self, user_id: bytes, username: str, display_name: str):
        options, state = self.server.register_begin(
            user={
                "id": user_id,
                "name": username,
                "displayName": display_name,
            },
            user_verification=UserVerificationRequirement.PREFERRED
        )
        
        serializable_options = {
            "publicKey": {
                "rp": {"name": options.public_key.rp.name, "id": options.public_key.rp.id},
                "user": {
                    "id": websafe_encode(options.public_key.user.id),
                    "name": options.public_key.user.name,
                    "displayName": options.public_key.user.display_name
                },
                "challenge": websafe_encode(options.public_key.challenge),
                "pubKeyCredParams": [{"type": p.type, "alg": p.alg} for p in options.public_key.pub_key_cred_params],
                "timeout": options.public_key.timeout,
                "authenticatorSelection": {
                    "authenticatorAttachment": "platform",
                    "residentKey": "preferred",
                    "userVerification": "preferred"
                },
                "attestation": options.public_key.attestation.value if hasattr(options.public_key.attestation, 'value') else options.public_key.attestation,
                "excludeCredentials": []
            }
        }
        return serializable_options, state

    def verify_registration_response(self, response_data, state):
        client_data = CollectedClientData(websafe_decode(response_data["response"]["clientDataJSON"]))
        attestation_object = AttestationObject(websafe_decode(response_data["response"]["attestationObject"]))
        
        response = AuthenticatorAttestationResponse(
            client_data=client_data,
            attestation_object=attestation_object
        )
        
        reg_response = RegistrationResponse(
            raw_id=websafe_decode(response_data["rawId"]),
            response=response
        )
        
        auth_data = self.server.register_complete(state, reg_response)
        return auth_data

    def generate_authentication_options(self, credentials):
        options, state = self.server.authenticate_begin(
            credentials,
            user_verification=UserVerificationRequirement.PREFERRED
        )
        return {"publicKey": dict(options.public_key)}, state

    def verify_authentication_response(self, response_data, state, credentials):
        client_data = CollectedClientData(websafe_decode(response_data["response"]["clientDataJSON"]))
        auth_data_parsed = AuthenticatorData(websafe_decode(response_data["response"]["authenticatorData"]))
        
        response = AuthenticatorAssertionResponse(
            client_data=client_data,
            authenticator_data=auth_data_parsed,
            signature=websafe_decode(response_data["response"]["signature"]),
            user_handle=websafe_decode(response_data["response"]["userHandle"]) if response_data["response"].get("userHandle") else None
        )
        
        auth_response = AuthenticationResponse(
            raw_id=websafe_decode(response_data["rawId"]),
            response=response
        )
        
        auth_data = self.server.authenticate_complete(
            state,
            credentials,
            auth_response
        )
        
        return auth_data, auth_response.response.authenticator_data.counter
