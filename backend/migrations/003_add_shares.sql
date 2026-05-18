-- SQL Migration File: Add Shares Table
-- File: backend/migrations/003_add_shares.sql

CREATE TABLE IF NOT EXISTS shares (
    share_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
    owner_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    share_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    max_downloads INT,
    download_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    label VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_shares_token ON shares(share_token);
CREATE INDEX IF NOT EXISTS idx_shares_owner ON shares(owner_user_id);
