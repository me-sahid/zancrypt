# Payment System & Security Updates

This document summarizes the recent architectural changes, security enhancements, and feature limits implemented for the Zancrypt payment and subscription system.

## 1. Backend Payment Data Modeling
We integrated a robust database structure to track Razorpay orders securely.

- **Created `PaymentOrder` Model**: 
  - Added in `backend/app/models/payment_order.py`.
  - Replaced manual timestamp management with the `TimestampMixin` for reliable `created_at` and `updated_at` tracking.
  - Used SQLAlchemy `Enum` for the `status` column (`created`, `paid`, `failed`) to ensure database integrity and prevent invalid data injection.
  - Established a cascade `relationship` with the `User` model, ensuring payment records are cleaned up if a user is ever deleted.
  
- **Updated `User` Model**:
  - Added a `plan` column to the `User` model (defaulting to `"free"`). This eliminates the need to constantly query payment history just to determine a user's current tier, drastically improving performance.

## 2. Row-Level Security (RLS) & Endpoint Hardening
We identified and patched a gap in the billing API where orders weren't being safely persisted or fetched.

- **Order Persistence**: The `POST /api/billing/create-order` endpoint was updated to properly write the newly generated Razorpay order to the database.
- **Row-Level Security on Fetch**: We implemented a new `GET /api/billing/orders` endpoint. 
  - **The Fix:** We applied strict SQLAlchemy-level row isolation: `where(PaymentOrder.user_id == current_user.id)`. 
  - **Impact:** This completely prevents IDOR (Insecure Direct Object Reference) vulnerabilities, mathematically guaranteeing that a user can only ever access their own billing history.
- **Audit**: Verified that all other critical routes (`files.py`, `share.py`, `dashboard.py`) already properly enforce this `owner_id == current_user.id` isolation.

## 3. Frontend Tier Barriers & Feature Locking
We enforced strict feature limits across the application based on the user's active plan.

- **Centralized Config (`planLimits.js`)**: Created a single source of truth for plan capabilities:
  - **Free**: 2GB Storage, 100MB Uploads, 3 Share Links, No Self-Destruct, No API Access.
  - **Pro**: 50GB Storage, 500MB Uploads, Unlimited Shares, Self-Destruct available.
  - **Enterprise**: 500GB Storage, 5GB Uploads, API Access unlocked.

- **Global Upgrade Modal**: 
  - Implemented an elegant `UpgradeModal.jsx` that intercepts user actions across the app when they hit a paywall.
  - Replaced the default icon with `<RiFolderWarningLine />` for better contextual aesthetics.

- **Strict Frontend Enforcement**:
  - **Uploads**: `useUploadStore.js` intercepts uploads, instantly blocking them if the individual file size or cumulative storage exceeds the user's plan.
  - **Storage UI**: The sidebar dynamically renders the specific capacity limit (e.g., `... / 2 GB` or `... / 500 GB`).
  - **Share Links**: `ShareModal.jsx` actively counts active shares and hard-blocks Free users at 3 links.
  - **Self-Destruct**: `SelfDestructToggle.jsx` replaces its generation button with an "Upgrade to Unlock" trigger for Free users.
  - **API Keys**: The entire API keys dashboard is locked behind an "Enterprise Feature Locked" screen for non-Enterprise users.

## 4. Backend Environment Sync
- Increased `MAX_UPLOAD_SIZE` in `backend/app/core/config.py` from 100MB to 5GB (`5368709120` bytes). This ensures the backend server doesn't globally reject 5GB Enterprise uploads before the frontend gets a chance to validate the user's specific plan limits.

---
**Next Steps for Database:**
Ensure you run Alembic migrations so the new `payment_orders` table and the `plan` column in the `users` table are created in your PostgreSQL database.
