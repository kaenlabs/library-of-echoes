# Admin Setup Instructions

## Step 1: Apply Admin Migration to Supabase

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `backend/supabase/admin_migration.sql`
5. Click **Run**

## Step 2: Sign up with admin email (if not done already)

1. Go to http://localhost:3000
2. Sign up with email: **celikkaann@icloud.com**
3. Verify email if needed

## Step 3: Re-run admin migration (if needed)

If the user didn't exist when you ran the migration, run it again:

```sql
-- Find user ID
SELECT id, email FROM auth.users WHERE email = 'celikkaann@icloud.com';

-- Add as admin manually
INSERT INTO admin_users (user_id, email, notes)
VALUES ('<user_id_from_above>', 'celikkaann@icloud.com', 'Platform owner')
ON CONFLICT (user_id) DO NOTHING;
```

## Step 4: Test admin privileges

1. Sign in with celikkaann@icloud.com
2. Try sending messages - you should have unlimited quota
3. Check the message counter - it should show a very high number

## What Changed

1. **New table**: `admin_users` - stores admin user IDs
2. **New function**: `is_admin(user_id)` - checks if user is admin
3. **Rate limiting**: Admins bypass all limits (999999 messages/day shown)
4. **Reset system**: Hard reset now deletes all messages from target epoch (clean slate)

## Testing Reset

1. Send some messages to Age 1
2. Click "🔥 Trigger Babel Moment" in test panel
3. View the Babel Moment animation
4. Click "🔄 Age 1'e Geri Dön" 
5. Confirm - Age 1 should be clean with 0 messages
6. Send new messages - Babel Moment will be completely different

