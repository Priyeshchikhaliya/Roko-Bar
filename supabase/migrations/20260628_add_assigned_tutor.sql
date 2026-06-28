ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS assigned_tutor text;

COMMENT ON COLUMN bookings.assigned_tutor IS
  'Display name of the configured tutor responsible for this booking. Contact details remain in server-side configuration.';
