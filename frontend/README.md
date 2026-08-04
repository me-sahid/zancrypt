<div align="center">

# 🔐 Zancrypt

### Zero-Knowledge Distributed Cloud Storage

Secure your files with end-to-end encryption before they ever leave your device.
Store them across multiple cloud providers while keeping complete ownership of your data.

<p align="center">
  <a href="https://zancrypt.in">
    <img src="https://img.shields.io/badge/Live-zancrypt.in-0A84FF?style=for-the-badge&logo=googlechrome&logoColor=white">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/me-sahid/zancrypt?style=for-the-badge">
  </a>
  <img src="https://img.shields.io/badge/Encryption-AES--256--GCM-success?style=for-the-badge">
  <img src="https://img.shields.io/badge/Zero--Knowledge-Enabled-blueviolet?style=for-the-badge">
</p>

---

### 🌐 Website

## https://zancrypt.in

</div>

---

# 📖 Overview

Most cloud storage services can access your files because encryption happens **after upload**.

**Zancrypt** changes that.

Every file is encrypted **inside your browser** before transmission, meaning the server never sees your original data or encryption keys.

Your encrypted file is then intelligently split into encrypted shards and distributed across multiple storage providers for increased privacy, redundancy, and resilience.

> **Your files. Your keys. Your privacy.**

---

# ✨ Features

## 🔒 Zero-Knowledge Encryption

- Client-side AES-256-GCM encryption
- Server never receives plaintext files
- Encryption keys never leave your device
- Cryptographically secure random key generation

---

## ☁️ Distributed Storage

Instead of storing an entire encrypted file in one place,

Zancrypt:

- Encrypts your file
- Splits it into secure shards
- Stores shards across multiple cloud providers

Benefits:

- Better redundancy
- Increased availability
- Improved privacy
- No single storage provider possesses your complete file

---

## 🛡 Secure Authentication

- JWT Authentication
- Refresh Token Rotation
- Secure HttpOnly Cookies
- Password Hashing
- Session Management

---

## ⚡ High Performance

- Parallel uploads
- Chunked file transfer
- Background processing
- Async workers
- Optimized API responses

---

## 📂 Modern File Manager

- Folder hierarchy
- Drag & Drop uploads
- File previews
- Search
- Sorting
- Storage analytics
- Recently accessed files

---

## 🔗 Secure Sharing

Share files without sacrificing privacy.

Features include:

- Public encrypted links
- Password protected links
- Expiration dates
- Download limits
- View limits
- One-time links
- Disable downloads

---

## 🔄 Automatic Recovery

If a storage provider becomes unavailable,

Zancrypt reconstructs your file using the remaining encrypted shards whenever possible.

---

## 🌙 Modern Interface

- Responsive UI
- Dark Mode
- Smooth animations
- Fast navigation
- Dashboard analytics

---

# 🏗 Architecture

```
                User
                  │
                  ▼
        Client-Side Encryption
          (AES-256-GCM)
                  │
                  ▼
         File Fragmentation
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
 Storage A    Storage B   Storage C
      │           │           │
      └────── Gateway API ────┘
                  │
              Metadata DB
```

---

# 🔐 Security

Zancrypt follows a **Zero-Knowledge Architecture**, meaning:

✅ Files are encrypted before upload

✅ Encryption keys never leave your browser

✅ Server stores only encrypted data

✅ Storage providers never possess complete files

---

# 🚀 Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Zustand
- React Router

---

## Backend

- FastAPI
- Python
- SQLAlchemy
- PostgreSQL
- Redis
- Celery
- APScheduler
- JWT Authentication

---

## Infrastructure

- Docker
- Nginx
- Cloud Storage Providers
- Background Workers

---

# 📷 Screenshots

> Add screenshots here

```
Dashboard

Upload

File Manager

Sharing

Security

Settings
```

---

# 🚀 Getting Started

Clone the repository

```bash
git clone https://github.com/me-sahid/zancrypt.git
```

Move into the project

```bash
cd zancrypt
```

Install dependencies

```bash
npm install
```

Run frontend

```bash
npm run dev
```

Run backend

```bash
uvicorn app.main:app --reload
```

---

# 📁 Project Structure

```
zancrypt/

├── frontend/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── store/
│   └── assets/
│
├── backend/
│   ├── api/
│   ├── services/
│   ├── models/
│   ├── database/
│   ├── middleware/
│   └── workers/
│
├── docker/
├── nginx/
└── README.md
```

---

# 🎯 Roadmap

- [x] Client-side encryption
- [x] Multi-cloud storage
- [x] Secure authentication
- [x] File sharing
- [x] Dashboard
- [x] Storage analytics
- [ ] Desktop Client
- [ ] Mobile Apps
- [ ] Real-time Collaboration
- [ ] Version History
- [ ] AI-powered File Search

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create your feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

```bash
git commit -m "Add amazing feature"
```

4. Push to your branch

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

---

# 📜 License

This project is licensed under the MIT License.

---

<div align="center">

**Privacy is not a feature. It's a fundamental right.**

⭐ If you like Zancrypt, consider starring the repository.

https://zancrypt.in

</div>