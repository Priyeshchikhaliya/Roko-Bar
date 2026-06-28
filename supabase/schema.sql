CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  night date NOT NULL,
  requester_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text NOT NULL,
  residency text NOT NULL
    CHECK (residency IN ('roko', 'christophorusweg', 'rosenbachweg', 'external')),
  price int NOT NULL,
  guest_count int,
  additional_info text,
  lang text DEFAULT 'de'
    CHECK (lang IN ('de', 'en')),
  payment_method text
    CHECK (payment_method IN ('cash', 'online')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'signed', 'confirmed', 'rejected', 'cancelled')),
  access_token uuid NOT NULL DEFAULT gen_random_uuid(),
  confirm_deadline timestamptz,
  reviewed_at timestamptz,
  signed_contract_path text,
  final_contract_path text,
  countersigned_at timestamptz,
  rent_paid boolean NOT NULL DEFAULT false,
  rent_paid_at timestamptz,
  rent_proof_path text,
  deposit_paid boolean NOT NULL DEFAULT false,
  deposit_paid_at timestamptz,
  payment_note text,
  internal_notes text,
  assigned_tutor text
);

COMMENT ON TABLE bookings IS
  'Rental booking requests for the RoKo Heimkneipe. One row represents one requested event night and stores all lifecycle columns needed for later approval, contract, payment confirmation, and release steps.';

COMMENT ON COLUMN bookings.residency IS
  'Residency determines rent. roko, christophorusweg, and rosenbachweg are long-term resident categories; external is everyone else.';

COMMENT ON COLUMN bookings.price IS
  'Rent in EUR, set by the server from residency. Resident categories pay 75 EUR; external guests pay 100 EUR. The client must never choose or override this value.';

COMMENT ON COLUMN bookings.status IS
  'Stored lifecycle status: pending, approved, signed, confirmed, rejected, or cancelled. Expired is intentionally not stored.';

COMMENT ON COLUMN bookings.lang IS
  'Requester UI language captured at booking time for guest-facing transactional emails. Nullable for older rows; application logic falls back to de.';

COMMENT ON COLUMN bookings.payment_method IS
  'Requester rent payment intent: cash or online bank transfer. This applies only to rent, not the 200 EUR cash deposit.';

COMMENT ON COLUMN bookings.confirm_deadline IS
  'Set when a tutor approves a request. An approved booking past this timestamp that has not advanced is treated as expired by application logic and must not block the night.';

COMMENT ON COLUMN bookings.final_contract_path IS
  'Supabase Storage path for the tutor counter-signed contract. Later phases should release this to the guest only after tutor counter-signing and manual rent payment confirmation.';

COMMENT ON COLUMN bookings.rent_paid IS
  'Manual tutor flag. The site never processes money; later phases use this with countersigned_at/final_contract_path to decide when the final contract can be released.';

COMMENT ON COLUMN bookings.rent_proof_path IS
  'Supabase Storage path in the private payment-proofs bucket for an uploaded rent payment proof. Used only for online rent payments.';

COMMENT ON COLUMN bookings.deposit_paid IS
  'Manual tutor flag for the 200 EUR deposit. The deposit is paid outside the site, typically at key handover.';

COMMENT ON COLUMN bookings.assigned_tutor IS
  'Display name of the configured tutor responsible for this booking. Contact details remain in server-side configuration.';

CREATE TABLE IF NOT EXISTS blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  night date NOT NULL UNIQUE,
  reason text,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE blocked_dates IS
  'Manual calendar blocks for nights that cannot be booked even without a confirmed booking, for example internal events or maintenance.';

COMMENT ON COLUMN blocked_dates.night IS
  'A blocked night is always treated as taken by availability and booking conflict checks.';

CREATE UNIQUE INDEX IF NOT EXISTS one_confirmed_booking_per_night
  ON bookings (night)
  WHERE status = 'confirmed';

COMMENT ON INDEX one_confirmed_booking_per_night IS
  'Hard database guarantee against two confirmed bookings for the same night. Pending requests may overlap; signed and active approved conflicts are enforced by server logic.';

-- Existing Supabase projects must run this once before deploying the app code:
-- ALTER TABLE bookings
--   ADD COLUMN IF NOT EXISTS lang text DEFAULT 'de'
--   CHECK (lang IN ('de', 'en'));

-- Copy/paste this once into the Supabase SQL Editor before testing rent payment proof support:
-- ALTER TABLE bookings
--   ADD COLUMN IF NOT EXISTS payment_method text CHECK (payment_method IN ('cash', 'online')),
--   ADD COLUMN IF NOT EXISTS rent_proof_path text;

-- Copy/paste this once into the Supabase SQL Editor before deploying tutor assignment:
-- ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_tutor text;
