/**
 * WebAuthn Ceremony Helpers
 * Uses @github/webauthn-json to handle base64url padding and conversion automatically.
 */
import { create, get } from '@github/webauthn-json';

/**
 * Register a passkey.
 * @param {object} options - The { publicKey: {...} } object from the server
 */
export const registerPasskey = async (options) => {
  try {
    const publicKeyOptions = options.publicKey || options;

    // Override RP ID to match the current domain dynamically if necessary
    if (publicKeyOptions.rp && publicKeyOptions.rp.id === 'localhost') {
        publicKeyOptions.rp.id = window.location.hostname;
    }

    // Remove authenticatorAttachment to allow cross-platform authenticators (like phones)
    if (publicKeyOptions.authenticatorSelection?.authenticatorAttachment) {
      delete publicKeyOptions.authenticatorSelection.authenticatorAttachment;
    }

    return await create({ publicKey: publicKeyOptions });
  } catch (error) {
    console.error('WebAuthn Registration Error:', error);
    throw error;
  }
};

/**
 * Authenticate with a passkey.
 * @param {object} options - The { publicKey: {...} } object from the server
 */
export const authenticatePasskey = async (options) => {
  try {
    const publicKeyOptions = options.publicKey || options;
    return await get({ publicKey: publicKeyOptions });
  } catch (error) {
    console.error('WebAuthn Authentication Error:', error);
    throw error;
  }
};

export const isWebAuthnSupported = () => {
  return !!(
    window.PublicKeyCredential &&
    navigator.credentials &&
    navigator.credentials.create &&
    navigator.credentials.get
  );
};
