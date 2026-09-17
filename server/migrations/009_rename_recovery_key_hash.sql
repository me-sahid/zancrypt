-- Migration 009: Rename identity_verifier or access_key to recovery_key_hash for vault recovery
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='identity_verifier') THEN
    ALTER TABLE users RENAME COLUMN identity_verifier TO recovery_key_hash;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='access_key') THEN
    ALTER TABLE users RENAME COLUMN access_key TO recovery_key_hash;
  ELSE
    ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_key_hash VARCHAR(255);
  END IF;
END $$;
