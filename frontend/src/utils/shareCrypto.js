// Share encryption utilities using Web Crypto API

export const wrapKeyWithPassword = async (contentKeyB64, password) => {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  
  const iterations = 100000;
  
  const wrappingKey = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true, ['encrypt']
  );
  
  const encryptedContentKeyBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, wrappingKey, enc.encode(contentKeyB64)
  );
  
  // Combine IV and Ciphertext
  const combined = new Uint8Array(iv.length + encryptedContentKeyBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedContentKeyBuffer), iv.length);
  
  // Return base64 encoded strings
  const bufferToBase64 = (buf) => btoa(String.fromCharCode.apply(null, new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  return {
    wrapped_content_key: bufferToBase64(combined),
    kdf_salt: bufferToBase64(salt),
    kdf_iterations: iterations
  };
};

export const unwrapKeyWithPassword = async (wrappedContentKeyB64, kdfSaltB64, kdfIterations, password) => {
  const enc = new TextEncoder();
  
  const base64ToBuffer = (b64) => {
    let s = b64.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const raw = atob(s);
    const result = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      result[i] = raw.charCodeAt(i);
    }
    return result;
  };

  const salt = base64ToBuffer(kdfSaltB64);
  const combined = base64ToBuffer(wrappedContentKeyB64);
  
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  
  const wrappingKey = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: kdfIterations, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true, ['decrypt']
  );
  
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv }, wrappingKey, ciphertext
  );
  
  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
};
