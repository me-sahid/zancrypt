-- Migration: Add share_password to shares table

ALTER TABLE shares ADD COLUMN IF NOT EXISTS share_password TEXT;
