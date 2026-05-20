-- VULN-010: Add first_accessed_at to shares table for server-side timer enforcement
-- When the wrapper is first opened, this timestamp is set.
-- If (now - first_accessed_at) > wrapper_timer_seconds, the server refuses to serve shards.

ALTER TABLE shares ADD COLUMN IF NOT EXISTS first_accessed_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE shares ADD COLUMN IF NOT EXISTS wrapper_timer_seconds INTEGER NULL;
