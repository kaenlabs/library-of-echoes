-- ================================================
-- BABEL MOMENT TRACKING - User viewed epochs
-- ================================================

-- Track which epochs users have seen the Babel Moment for
CREATE TABLE IF NOT EXISTS user_babel_views (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    epoch_id INTEGER REFERENCES epochs(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_user_epoch_view UNIQUE(user_id, epoch_id)
);

-- Index for fast lookups
CREATE INDEX idx_user_babel_views_user ON user_babel_views(user_id);
CREATE INDEX idx_user_babel_views_epoch ON user_babel_views(epoch_id);

-- Function to check if user has seen epoch's Babel Moment
CREATE OR REPLACE FUNCTION has_seen_babel(p_user_id UUID, p_epoch_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_babel_views 
        WHERE user_id = p_user_id 
        AND epoch_id = p_epoch_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to mark epoch as seen by user
CREATE OR REPLACE FUNCTION mark_babel_seen(p_user_id UUID, p_epoch_id INTEGER)
RETURNS void AS $$
BEGIN
    INSERT INTO user_babel_views (user_id, epoch_id)
    VALUES (p_user_id, p_epoch_id)
    ON CONFLICT (user_id, epoch_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- END OF BABEL TRACKING MIGRATION
-- ================================================
