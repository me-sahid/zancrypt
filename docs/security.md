# Security Model

Zancrypt follows a strict zero-knowledge security architecture. User data remains inaccessible without the user's credentials, and files are protected both at rest and in transit.

## Zero-Knowledge Hardware Identity (FIDO2 / WebAuthn)
Rather than relying on passwords sent over the network, Zancrypt anchors user identities to hardware biometrics:
1. **Registration**: The server generates challenges using the `fido2` Python library. The web prompts the browser's native `navigator.credentials.create()` for TouchID, FaceID, or YubiKey authentication.
2. **Verification**: The client sends back a signed attestation, an `access_key`, and a `master_key_salt`.
3. **Storage**: The server hashes the `access_key` using SHA-256 and `bcrypt` for fallback authentication, while `WebAuthnCredential` models store the public key and sign counts. 

## Client-Side Cryptography (Web Crypto API)
To enforce absolute privacy, file contents are processed completely inside the browser before any network transmission:
* **Key Derivation**: Keys are derived from the user's master key and the stored `master_key_salt` using **PBKDF2** (100,000 iterations and SHA-256 hashing).
* **Encryption Scheme**: Files are encrypted client-side using **AES-GCM 256** with a randomly generated 12-byte Initialization Vector (IV).
* **Metadata Shielding**: File names and MIME types are encrypted on the client and stored as ciphertext (`encrypted_filename`, `encrypted_metadata`), preventing metadata leaks on the server.

## Self-Destructing HTML Wrappers
Zancrypt includes a sharing protocol that wraps file payloads inside secure, self-destructing HTML files:
1. **Obfuscation**: The server derives a key by hashing the share token (`SHA-256`), and obfuscates the file bytes using a repeating XOR operation to obscure them from basic inspection tools.
2. **Self-Contained Countdown**: The generated HTML page contains a visual countdown timer (e.g., 1h, 24h).
3. **Memory Scrubbing**: Upon expiration, or if a clock rollback is detected, the page triggers memory scrubbing by nullifying all variables containing the payload.
4. **Destruction Telemetry**: The client sends a `navigator.sendBeacon` request back to `/api/share/destroyed` to inform the server for auditing purposes.
