-- ================================================
-- OPTIONAL: Add user_id to messages table
-- ================================================
-- This allows tracking which authenticated users sent which messages
-- Note: This is OPTIONAL and goes against the "fully anonymous" philosophy
-- Only use this if you want to track user activity

-- Add user_id column (nullable, because anonymous users don't have IDs)
ALTER TABLE messages 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for user lookups
CREATE INDEX idx_messages_user ON messages(user_id) WHERE user_id IS NOT NULL;

-- ================================================
-- Disable email confirmation for DEVELOPMENT ONLY
-- ================================================
-- Run this in SQL Editor to skip email confirmation during development
-- REMOVE THIS IN PRODUCTION!

-- You can also disable it in Dashboard: Authentication > Settings > Email Auth
-- Uncheck "Enable email confirmations"
