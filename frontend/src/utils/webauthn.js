import { create, get } from '@github/webauthn-json';

/**
 * WebAuthn Ceremony Helpers
 */

export const registerPasskey = async (options) => {
  try {
    // Perform the registration ceremony
    const credential = await create(options);
    return credential;
  } catch (error) {
    console.error('WebAuthn Registration Error:', error);
    throw error;
  }
};

export const authenticatePasskey = async (options) => {
  try {
    // Perform the authentication ceremony
    const assertion = await get(options);
    return assertion;
  } catch (error) {
    console.error('WebAuthn Authentication Error:', error);
    throw error;
  }
};

export const isWebAuthnSupported = () => {
  return !!(window.PublicKeyCredential && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable);
};
