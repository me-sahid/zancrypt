/**
 * WebAuthn Ceremony Helpers
 * Uses native browser WebAuthn API directly to avoid library compatibility issues.
 */

/** Convert base64url string to ArrayBuffer */
function base64urlToBuffer(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

/** Convert ArrayBuffer to base64url string */
function bufferToBase64url(buffer) {
  const view = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < view.length; i++) {
    binary += String.fromCharCode(view[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Register a passkey.
 * @param {object} options - The { publicKey: {...} } object from the server
 */
export const registerPasskey = async (options) => {
  try {
    const publicKey = options.publicKey || options;

    const createOptions = {
      publicKey: {
        ...publicKey,
        challenge: base64urlToBuffer(publicKey.challenge),
        user: {
          ...publicKey.user,
          id: base64urlToBuffer(publicKey.user.id),
        },
        excludeCredentials: (publicKey.excludeCredentials || []).map((c) => ({
          ...c,
          id: base64urlToBuffer(c.id),
        })),
      },
    };

    const credential = await navigator.credentials.create(createOptions);

    return {
      id: credential.id,
      rawId: bufferToBase64url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
        attestationObject: bufferToBase64url(credential.response.attestationObject),
      },
    };
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
    const publicKey = options.publicKey || options;

    const getOptions = {
      publicKey: {
        ...publicKey,
        challenge: base64urlToBuffer(publicKey.challenge),
        allowCredentials: (publicKey.allowCredentials || []).map((c) => ({
          ...c,
          id: base64urlToBuffer(c.id),
        })),
      },
    };

    const assertion = await navigator.credentials.get(getOptions);

    return {
      id: assertion.id,
      rawId: bufferToBase64url(assertion.rawId),
      type: assertion.type,
      response: {
        clientDataJSON: bufferToBase64url(assertion.response.clientDataJSON),
        authenticatorData: bufferToBase64url(assertion.response.authenticatorData),
        signature: bufferToBase64url(assertion.response.signature),
        userHandle: assertion.response.userHandle
          ? bufferToBase64url(assertion.response.userHandle)
          : null,
      },
    };
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
