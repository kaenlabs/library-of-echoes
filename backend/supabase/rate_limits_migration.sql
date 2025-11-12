-- ================================================
-- RATE LIMITS TABLE - Add this to your Supabase SQL Editor
-- ================================================

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
    id SERIAL PRIMARY KEY,
    identifier TEXT NOT NULL,                    -- user_id or ip_hash
    is_authenticated BOOLEAN DEFAULT false,      -- true if user is logged in
    message_count INTEGER DEFAULT 0,             -- messages sent today
    last_reset TIMESTAMP DEFAULT NOW(),          -- last time counter was reset
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_identifier UNIQUE(identifier)
);

-- Index for fast lookups
CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier);

-- Function to auto-reset daily counters
CREATE OR REPLACE FUNCTION reset_rate_limit_if_needed(p_identifier TEXT)
RETURNS void AS $$
BEGIN
    UPDATE rate_limits
    SET message_count = 0, last_reset = NOW()
    WHERE identifier = p_identifier
    AND last_reset < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
