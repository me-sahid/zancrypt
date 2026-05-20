# Zancrypt Platform: Current Progress

This document tracks all completed features, active developments, and pending system backlogs. This file is kept in sync and updated dynamically.

---

## ✅ Completed Milestones

### 🧪 Zero-Knowledge Passkey & Fallback Test Harness Stabilization
- **100% Passing Test Harness**: Fully resolved long-standing test suite regressions due to legacy `/auth/register` and `/auth/login` pathways by rewiring unit testing to standard WebAuthn challenge setups and secure `/auth/login/fallback` verification.
- **Unified Session Event Loop**: Standardized `pytest-asyncio` loop scopes inside `conftest.py` and `pytest.ini` to enforce a single session-wide event loop, completely eliminating all `attached to a different loop` errors.
- **NullPool Engine Isolation**: Engineered dynamic database engine swapping utilizing `NullPool` inside the conftest execution pipeline. This guarantees concurrent safety, loop isolation, and automatic connection teardown for all mock endpoints, repositories, and background node tasks (resolving `InterfaceError: another operation is in progress`).
- **Pydantic Schema Realignment**: Resolved schema validation mismatches on the `/files/{file_id}/manifest` endpoint by updating `FileManifestResponse` fields (`node_assignments` and `replication_mapping`) to handle dynamic list formats instead of static dict definitions.
- **SQL Cascade Relationship Integrity**: Fixed foreign-key constraint violations on file deletion by mapping `cascade="all, delete-orphan"` relationships across `File` to `Manifest`, `FileVersion`, and `ShardRegistry` models in SQLAlchemy.
- **Docker Context Rebuild Speedups**: Integrated highly optimized `.dockerignore` files for both `/backend` and `/frontend` modules, preventing massive `venv` and `node_modules` folders from inflating the Docker context transfer size.

### 🛡️ Core Infrastructure & Telemetry
- **Zancrypt Brand Identity Integration**: Completed a unified brand overhaul across all frontend pages and backend endpoints.
- **Observational Telemetry Schema**: Programmed self-healing SQL migrations in `main.py` to support `storage_used` telemetry tracking in active databases.
- **Real-Time Storage Calculation**: Engineered backend `MetricsService` to calculate precise encrypted slice volumes on data uploads and deletions.
- **Dynamic Observability Bindings**: Implemented animating storage counters and auto-scaling formatters (Bytes to TB) on all Central Dashboard and Node charts.
- **Zero-Flash Layout Boundaries**: Created Route-aware skeletons and wrapped protected spaces in a nested Suspense boundary within `DashboardLayout.jsx` to prevent white/black hydration flashes.

### 🐛 Distributed Reliability & Bug Fixes
- **Duplicate Shard Primary Key Violation resolved**: Fixed PostgreSQL `UniqueViolationError` on replicated shards by appending unique `_replica_{idx}` tags inside `file_service.py`.
- **Minimal Central Dashboard layout**: Removed the redundant "System Activity" feed to achieve clean, premium, and focused B2B visual aesthetics.
- **Cinematic Outage UX**: Designed an elegant Framer Motion radar orbit scanner to completely replace text-heavy offline layouts.
- **Session-Mounting Race Condition resolved**: Eliminated loop-locking bugs in `/login` and `/register` routes by transitioning route-gating checks into React lifecycle `useEffect` hooks.

### 🔒 Client-Side Decrypted File Previews & Downloads (Implemented Today)
- **Schema Property Resolution Bug resolved**: Fixed a critical filename mapping bug where the preview modal and download handler referenced non-existent fields (`file.filename` or `file.name` instead of `file.encrypted_filename`), causing MIME types to default to `application/octet-stream` and triggering the "Direct Preview Not Available" warning panel.
  - *Approach*: Programmed priority fallback checks in `Files.jsx` to evaluate `file.encrypted_filename` first, ensuring precise MIME type deduction and correct original filename preservation on secure file downloads.
- **Sibling Overlay Modal Architecture (Click-Deadzone resolved)**: Fixed a bug where clicking the backdrop area directly below the modal card container failed to close the preview.
  - *Approach*: Refactored the modal markup in `Files.jsx` from a nested parent-child layout to a sibling-overlay structure. The backdrop is now a dedicated sibling `div` (`absolute inset-0 z-0 bg-primary-bg/85 ...`), which eliminates nested event propagation bugs (`e.stopPropagation()`) and ensures the modal closes instantly from any click outside the card.
- **React Portal Integration (Stacking Context & Stacking Order resolved)**: Fixed a layout bug where the sticky top navigation header (`TopNav`) rendered on top of the modal header, partially slicing it off due to CSS `transform` and `filter` boundaries from parent page animations.
  - *Approach*: Leveraged React's `createPortal` to mount the modal directly to `document.body` at the root of the page. This completely bypasses container boundaries, local transforms, z-index constraints, and layout clipping, ensuring a perfect overlay on top of the entire application.
- **iPhone `.MOV` Native Playback Support**: Added full secure browser previews for iPhone video recordings in `.mov` format.
  - *Approach*: Added `.mov` mapping to `'video/quicktime'` inside the `getMimeType` schema helper in `Files.jsx`, enabling modern browser engines to natively render decrypted Apple QuickTime assets using the secure HTML5 `<video>` player.

### 🌐 Premium Landing Page & Client Portal
- **Epic Games Styled Dropdown**: Integrated a premium account menu featuring display name sanitation (masking raw emails) and immediate link redirections:
  - 📊 **Dashboard** (`/dashboard`)
  - 🔒 **Private Vault** (`/vault`)
  - ☁️ **Multi-Cloud Backups** (`/nodes`)
  - 🔑 **Security Credentials** (`/security`)
  - 📄 **Immutable Audit Trail** (`/audit`)
  - ⚙️ **Account Settings** (`/settings`)
- **Interactive Multi-Platform Portal**: Constructed a standalone responsive `/download` showcase including:
  - 🍎 **macOS Client** (Apple Silicon) target deck.
  - 💻 **Windows Client** (DirectX engine) target deck.
  - 🤖 **Android Mobile App** (Key Vault) target deck.
  - A working newsletter early-beta email subscription form with active toast alerts.

---

## 🛠️ Pending Objectives (Not Completed / Backlog)

- [ ] **macOS Native Desktop Client**: Finalize deployment pipeline for Apple Silicon builds.
- [ ] **Windows Native Desktop Client**: Package DirectX-accelerated client installer.
- [ ] **Android Mobile App**: Package distributed key vault app bundle.
- [ ] **Active Node Multi-Region Recovery Simulation**: Complete live recovery failure tests on active staging clusters.
- [ ] **WebAuthn Zero-Knowledge hardware enrolment**: Write documentation for hardware-bound passkey registration.

---

## 🔄 Last Sync Telemetry
- **Last Sync**: 2026-05-20 06:59:20 UTC
- **Active Branch**: `sahid-branch-test`
- **Latest Commit**: `c049646 - Merge pull request #12 from me-sahid/TestWahid (sahidZack)`
- **Sync Action**: Git Pull / Merge Completed
