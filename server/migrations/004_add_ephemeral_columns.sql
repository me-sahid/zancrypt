-- ============================================================
-- Migration 004: Ephemeral Share Auto-Deletion Engine
-- Adds delete_original / notify_on_expire to shares table,
-- creates pending_deletions retry queue, and notifications table.
-- ============================================================

-- 1. New columns on shares
ALTER TABLE shares ADD COLUMN IF NOT EXISTS delete_original   BOOLEAN DEFAULT FALSE;
ALTER TABLE shares ADD COLUMN IF NOT EXISTS notify_on_expire  BOOLEAN DEFAULT TRUE;

-- Partial index: only active shares with an expiry — keeps the TTL worker query fast
CREATE INDEX IF NOT EXISTS idx_shares_expiry
    ON shares(expires_at)
    WHERE is_active = true;

-- 2. Pending shard deletion retry queue
--    Written to when a node DELETE /shards/:id call fails so the retry worker can
--    pick it up without blocking the main deletion flow.
CREATE TABLE IF NOT EXISTS pending_deletions (
    pending_deletion_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    shard_id            TEXT        NOT NULL,
    node_url            TEXT        NOT NULL,
    file_id             INTEGER     REFERENCES files(id) ON DELETE SET NULL,
    failed_at           TIMESTAMPTZ DEFAULT NOW(),
    retry_count         INT         DEFAULT 0,
    last_error          TEXT
);

CREATE INDEX IF NOT EXISTS idx_pending_deletions_failed_at ON pending_deletions(failed_at);

-- 3. In-app notifications table
--    Stores ephemeral auto-deletion events shown in the NotificationBell UI.
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         INTEGER     REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type            VARCHAR(64) NOT NULL,                -- e.g. 'FILE_AUTO_DELETED'
    file_id         INTEGER     REFERENCES files(id) ON DELETE SET NULL,
    file_name       TEXT,                               -- snapshot of filename at deletion time
    trigger         VARCHAR(64),                        -- 'ttl_expiry' | 'download_limit' | 'manual'
    is_read         BOOLEAN     DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON notifications(user_id, is_read)
    WHERE is_read = false;
