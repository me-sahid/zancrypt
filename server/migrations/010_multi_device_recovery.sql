-- Migration 010: Multi-Device Passkey & Account Recovery
-- 1. Ensure recovery_key_hash column exists and is safely renamed from legacy column names
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='identity_verifier') THEN
    ALTER TABLE users RENAME COLUMN identity_verifier TO recovery_key_hash;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='access_key') THEN
    ALTER TABLE users RENAME COLUMN access_key TO recovery_key_hash;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='access_key_hash') THEN
    ALTER TABLE users RENAME COLUMN access_key_hash TO recovery_key_hash;
  ELSE
    ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_key_hash VARCHAR(255);
  END IF;
END $$;

-- 2. Add columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_key_used_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_locked_until TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS passkey_count INTEGER DEFAULT 0;

-- 3. Add columns to webauthn_credentials table
ALTER TABLE webauthn_credentials ADD COLUMN IF NOT EXISTS device_name VARCHAR(100);
ALTER TABLE webauthn_credentials ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;
ALTER TABLE webauthn_credentials ADD COLUMN IF NOT EXISTS added_via VARCHAR(50) DEFAULT 'registration';
ALTER TABLE webauthn_credentials ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 4. Create recovery_sessions table
CREATE TABLE IF NOT EXISTS recovery_sessions (
    id UUID PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(64) UNIQUE NOT NULL,
    webauthn_challenge_hash VARCHAR(64) NOT NULL,
    webauthn_challenge TEXT NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes'),
    consumed_at TIMESTAMPTZ
);

-- 5. Trigger to automatically increment and decrement passkey_count on users
CREATE OR REPLACE FUNCTION update_user_passkey_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.is_active = TRUE THEN
            UPDATE users SET passkey_count = COALESCE(passkey_count, 0) + 1 WHERE id = NEW.user_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF (OLD.is_active IS NULL OR OLD.is_active = TRUE) AND NEW.is_active = FALSE THEN
            UPDATE users SET passkey_count = GREATEST(COALESCE(passkey_count, 0) - 1, 0) WHERE id = NEW.user_id;
        ELSIF OLD.is_active = FALSE AND NEW.is_active = TRUE THEN
            UPDATE users SET passkey_count = COALESCE(passkey_count, 0) + 1 WHERE id = NEW.user_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.is_active IS NULL OR OLD.is_active = TRUE THEN
            UPDATE users SET passkey_count = GREATEST(COALESCE(passkey_count, 0) - 1, 0) WHERE id = OLD.user_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_webauthn_credentials_passkey_count ON webauthn_credentials;
CREATE TRIGGER trg_webauthn_credentials_passkey_count
AFTER INSERT OR UPDATE OR DELETE ON webauthn_credentials
FOR EACH ROW EXECUTE FUNCTION update_user_passkey_count();

-- 6. Backfill passkey_count for all existing users
UPDATE users u
SET passkey_count = (
    SELECT COUNT(*) FROM webauthn_credentials c WHERE c.user_id = u.id AND (c.is_active IS NULL OR c.is_active = TRUE)
);

-- 7. Create required indexes
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_active ON webauthn_credentials(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_recovery_sessions_token ON recovery_sessions(session_token_hash) WHERE consumed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_recovery_sessions_user_created ON recovery_sessions(user_id, created_at DESC);
