-- ================================================
-- RESET DATABASE FOR TESTING
-- ================================================
-- DANGER: This will DELETE ALL DATA and reset to Age 1
-- Use only for development/testing!

-- Step 1: Delete all messages
DELETE FROM messages;

-- Step 2: Delete all rooms
DELETE FROM rooms;

-- Step 3: Delete all epochs except Age 1
DELETE FROM epochs WHERE id > 1;

-- Step 5: Reset Age 1 to active state
UPDATE epochs 
SET 
  is_active = true,
  closed_at = NULL,
  stats = NULL
WHERE id = 1;

-- Step 6: Reset sequence counters (so next epoch will be Age 2)
SELECT setval('epochs_id_seq', 1, true);
SELECT setval('rooms_id_seq', 1, false);

-- Step 7: Verify - Check active epoch
SELECT id, name, is_active, created_at FROM epochs WHERE is_active = true;

-- Step 8: Verify - Check message count
SELECT COUNT(*) as message_count FROM messages;

-- ================================================
-- DONE! Database reset to Age 1
-- ================================================
-- Frontend localStorage to clear manually:
-- localStorage.clear()
-- Or specific keys:
-- localStorage.removeItem('lastSeenEpoch')
-- localStorage.removeItem('seen_new_epoch_Age 2')
