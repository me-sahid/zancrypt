<div align="center">

# Zancrypt

### Zero-Knowledge Distributed Cloud Storage

Secure cloud storage with client-side encryption, distributed storage, and privacy by design.

<p align="center">
    <a href="https://zancrypt.in"><strong>Website</strong></a> •
    <a href="#features"><strong>Features</strong></a> •
    <a href="#architecture"><strong>Architecture</strong></a> •
    <a href="#getting-started"><strong>Getting Started</strong></a> •
    <a href="#roadmap"><strong>Roadmap</strong></a>
</p>

<p align="center">
    <img src="https://img.shields.io/github/license/me-sahid/zancrypt?style=flat-square">
    <img src="https://img.shields.io/badge/Encryption-AES--256--GCM-blue?style=flat-square">
    <img src="https://img.shields.io/badge/Architecture-Zero--Knowledge-success?style=flat-square">
    <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square">
</p>

</div>

---

## Overview

Zancrypt is a modern cloud storage platform built around a simple principle:

**Your files should belong only to you.**

Unlike traditional cloud storage providers, every file is encrypted locally before upload. The server never has access to your original data or encryption keys. Encrypted files are fragmented and distributed across multiple storage providers, providing additional privacy, redundancy, and fault tolerance.

---

## Features

### Client-side Encryption

- AES-256-GCM encryption
- Encryption performed entirely in the browser
- Encryption keys never leave the client
- Zero-knowledge architecture

### Distributed Storage

- File fragmentation
- Multi-cloud storage
- Increased redundancy
- Improved fault tolerance
- No single provider stores the complete file

### Secure Authentication

- JWT authentication
- Refresh token rotation
- HttpOnly secure cookies
- Session management
- Password hashing

### File Management

- Folder organization
- Drag and drop uploads
- File previews
- Search
- Sorting
- Storage analytics
- Recently accessed files

### Secure Sharing

- Public links
- Password-protected links
- Expiration dates
- Download limits
- View limits
- One-time access
- Download restrictions

### Performance

- Parallel uploads
- Chunked file transfer
- Background processing
- Asynchronous workers
- Optimized API responses

---

## Security Model

Zancrypt follows a zero-knowledge security architecture.

- Files are encrypted before leaving the user's device.
- Servers never receive plaintext files.
- Encryption keys are never stored on the server.
- Storage providers only store encrypted fragments.
- User data remains inaccessible without the user's credentials.

---

## Architecture

```
                 User
                   │
                   ▼
        Client-side Encryption
             (AES-256-GCM)
                   │
                   ▼
           File Fragmentation
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   Storage A   Storage B   Storage C
        │          │          │
        └──────── Gateway ────────┘
                   │
              Metadata Database
```

---

## Technology Stack

### web

- React
- Vite
- Tailwind CSS
- Zustand
- React Router

### server

- FastAPI
- Python
- SQLAlchemy
- PostgreSQL
- Redis
- Celery
- APScheduler

### Infrastructure

- Docker
- Nginx
- Cloud Storage Providers

---

## Project Structure

```
zancrypt/
│
├── web/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   └── assets/
│
├── server/
│   ├── api/
│   ├── core/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   └── workers/
│
├── docker/
├── nginx/
└── README.md
```

---

## Screenshots

| Dashboard | File Manager |
|-----------|--------------|
| Add screenshot | Add screenshot |

| Upload | Sharing |
|--------|----------|
| Add screenshot | Add screenshot |

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/me-sahid/zancrypt.git
cd zancrypt
```

### web

```bash
npm install
npm run dev
```

### server

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## Roadmap

- [x] Client-side encryption
- [x] Distributed storage
- [x] Secure authentication
- [x] Dashboard
- [x] File sharing
- [x] Storage analytics
- [ ] Desktop application
- [ ] Mobile application
- [ ] Version history
- [ ] Real-time collaboration
- [ ] AI-powered search

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/new-feature
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push your branch.

```bash
git push origin feature/new-feature
```

5. Open a Pull Request.

---

## License

This project is licensed under the MIT License.

---

## Author

**Sahid Al Hassan**

Website: https://zancrypt.in

---

<p align="center">
Built with a privacy-first approach.
</p>
