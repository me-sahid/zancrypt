# Frequently Asked Questions (FAQ)

### What is Zancrypt (YuuVault)?
Zancrypt is a zero-knowledge distributed cloud storage platform. It secures your files by encrypting them on your local device before they ever touch a server. The encrypted data is then broken into shards and distributed across multiple cloud providers.

### What does "Zero-Knowledge" mean?
Zero-knowledge means that the server hosting Zancrypt never knows your passwords, encryption keys, or the contents of your files. All encryption happens in the browser via the Web Crypto API, meaning even if the server is compromised, your files cannot be decrypted by attackers.

### How does authentication work without passwords?
Zancrypt uses **WebAuthn (FIDO2)**. This relies on hardware-bound biometric authenticators like FaceID, TouchID, Windows Hello, or hardware security keys (like YubiKey). This guarantees high security and resists phishing. If biometrics are unavailable, a secure fallback access key is used.

### Why does the platform use shards?
By slicing large files into 10MB shards, Zancrypt avoids cloud provider size limitations (e.g., 50MB caps) and memory bloat on the server. Furthermore, distributing shards using **Rendezvous Hashing** across different cloud providers increases redundancy and fault tolerance. No single provider stores a complete file.

### What are Self-Destructing HTML files?
When you share a file securely, Zancrypt can package the encrypted file payload directly inside an HTML file wrapper. This HTML file is entirely self-contained. It renders a timer and, when time expires, it executes memory scrubbing techniques locally to delete the file data, providing secure, time-boxed sharing.
