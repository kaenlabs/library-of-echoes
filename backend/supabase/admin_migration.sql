-- ================================================
-- ADMIN SYSTEM - Add admin role support
-- ================================================

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,               -- References auth.users
    email TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    notes TEXT                                   -- Optional notes about admin
);

-- Index for fast lookups
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Insert initial admin (celikkaann@icloud.com)
-- Note: This will fail silently if user doesn't exist yet
-- Run this after the user signs up
DO $$
DECLARE
    admin_uuid UUID;
BEGIN
    -- Try to find user by email
    SELECT id INTO admin_uuid
    FROM auth.users
    WHERE email = 'celikkaann@icloud.com'
    LIMIT 1;
    
    -- If found, add as admin
    IF admin_uuid IS NOT NULL THEN
        INSERT INTO admin_users (user_id, email, notes)
        VALUES (admin_uuid, 'celikkaann@icloud.com', 'Platform owner')
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Admin user added successfully';
    ELSE
        RAISE NOTICE 'User celikkaann@icloud.com not found. Sign up first, then run this migration again.';
    END IF;
END $$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- END OF ADMIN MIGRATION
-- ================================================
