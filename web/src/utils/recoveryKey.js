/**
 * Zancrypt Recovery Key Utilities
 * Character set excludes O, I, 0, 1 to prevent transcription errors.
 * Format: XXXX-XXXX-XXXX-XXXX-XXXX (20 characters + 4 hyphens)
 */

export const RECOVERY_KEY_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generate a cryptographically secure 20-character recovery key.
 * Formatted as XXXX-XXXX-XXXX-XXXX-XXXX.
 */
export function generateRecoveryKey() {
  const length = 20;
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);

  let rawKey = '';
  for (let i = 0; i < length; i++) {
    rawKey += RECOVERY_KEY_CHARSET[randomBytes[i] % RECOVERY_KEY_CHARSET.length];
  }

  // Format as XXXX-XXXX-XXXX-XXXX-XXXX
  return rawKey.match(/.{1,4}/g)?.join('-') || rawKey;
}

/**
 * Normalize recovery key string: strip whitespace, hyphens, and convert to uppercase.
 */
export function normalizeRecoveryKey(key) {
  if (!key) return '';
  return String(key).replace(/[\s\-]+/g, '').toUpperCase();
}

/**
 * Validate that a recovery key matches the 20-char requirement and character set.
 */
export function isValidRecoveryKey(key) {
  const normalized = normalizeRecoveryKey(key);
  if (normalized.length !== 20) return false;
  const regex = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{20}$/;
  return regex.test(normalized);
}

/**
 * Auto-format user input as XXXX-XXXX-XXXX-XXXX-XXXX as they type.
 */
export function formatRecoveryKeyInput(input) {
  if (!input) return '';
  // Strip non-allowed characters
  const cleaned = String(input)
    .toUpperCase()
    .replace(/[^23456789ABCDEFGHJKLMNPQRSTUVWXYZ]/g, '')
    .slice(0, 20);

  const chunks = cleaned.match(/.{1,4}/g);
  return chunks ? chunks.join('-') : cleaned;
}
