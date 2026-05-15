/**
 * Zero-Knowledge Cryptography Utility
 * Uses Web Crypto API for secure, client-side key derivation and encryption.
 */

export const deriveKey = async (password, salt) => {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const saltBuffer = encoder.encode(salt);

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

export const encryptData = async (key, data) => {
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify(data))
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  };
};

export const decryptData = async (key, ciphertext, iv) => {
  const decoder = new TextDecoder();
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(atob(iv).split('').map(c => c.charCodeAt(0))) },
    key,
    new Uint8Array(atob(ciphertext).split('').map(c => c.charCodeAt(0)))
  );

  return JSON.parse(decoder.decode(decrypted));
};

export const generateSalt = () => {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};
