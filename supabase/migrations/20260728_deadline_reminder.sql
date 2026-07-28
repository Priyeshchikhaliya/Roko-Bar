-- Run once in the Supabase SQL Editor before deploying the deadline reminder cron.
--
-- Nothing in this app writes anything when confirm_deadline passes: "expired" is
-- derived live (see addBookingDerivedFields and isTakingBooking), never stored.
-- That is deliberate and stays that way. This column only records that the
-- one-off reminder mail has already gone out, so a daily cron cannot send it
-- again every morning.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS deadline_reminder_sent_at timestamptz;

COMMENT ON COLUMN bookings.deadline_reminder_sent_at IS
  'Set when the pre-deadline reminder email has been sent to the requester. NULL means not yet sent. Claimed with a compare-and-swap before sending and reset to NULL if the send fails, so a booking gets at most one reminder per approval window. Redo clears it, because redo grants a fresh confirm_deadline and therefore deserves a fresh reminder.';
