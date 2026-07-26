-- Run once in the Supabase SQL Editor before deploying the split-notes admin UI.
-- Adds separate tutor notes for rent and deposit. The old shared payment_note
-- column is kept for backward compatibility (no data is lost) but the app no
-- longer writes to it.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS rent_note text,
  ADD COLUMN IF NOT EXISTS deposit_note text;
