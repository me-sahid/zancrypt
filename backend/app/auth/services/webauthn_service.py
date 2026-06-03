from fido2.server import Fido2Server
from fido2.webauthn import (
    PublicKeyCredentialRpEntity, 
    AuthenticatorSelectionCriteria, 
    UserVerificationRequirement,
    RegistrationResponse,
    AuthenticationResponse
)
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
        return {"publicKey": dict(options.public_key)}, state

    def verify_registration_response(self, response_data, state):
        reg_response = RegistrationResponse.from_dict(response_data)
        auth_data = self.server.register_complete(state, reg_response)
        return auth_data

    def generate_authentication_options(self, credentials):
        options, state = self.server.authenticate_begin(
            credentials,
            user_verification=UserVerificationRequirement.PREFERRED
        )
        return {"publicKey": dict(options.public_key)}, state

    def verify_authentication_response(self, response_data, state, credentials):
        auth_response = AuthenticationResponse.from_dict(response_data)
        auth_data = self.server.authenticate_complete(
            state,
            credentials,
            auth_response
        )
        return auth_data, auth_response.response.authenticator_data.counter
