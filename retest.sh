#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-http://localhost:3000}"
: "${ADMIN_PASSWORD:?Set ADMIN_PASSWORD}"
: "${SUPABASE_URL:?Set SUPABASE_URL}"
: "${SUPABASE_SERVICE_ROLE_KEY:?Set SUPABASE_SERVICE_ROLE_KEY}"
: "${TUTORS:?Set TUTORS}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
PDF="$TMP/doc.pdf"
FINAL="$TMP/final.pdf"
cat > "$PDF" <<'PDFEOF'
%PDF-1.4
% retest
1 0 obj
<<>>
endobj
trailer
<<>>
%%EOF
PDFEOF

cp "$PDF" "$FINAL"

AVAILABILITY="$(curl -fsS "$BASE/api/availability")"
TAKEN_JSON="$(echo "$AVAILABILITY" | jq -c '.taken // []')"
mapfile -t NIGHTS < <(TAKEN_JSON="$TAKEN_JSON" node - <<'NODE'
const taken = new Set(JSON.parse(process.env.TAKEN_JSON));
const out = [];
let d = new Date();
d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 7));
while (out.length < 8) {
  const wd = d.getUTCDay();
  const iso = d.toISOString().slice(0, 10);
  if ((wd === 5 || wd === 6) && !taken.has(iso)) out.push(iso);
  d.setUTCDate(d.getUTCDate() + 1);
}
console.log(out.join("\n"));
NODE
)

ADMIN_TOKEN="$(
  curl -fsS -X POST "$BASE/api/admin/login" \
    -H 'Content-Type: application/json' -H 'X-Roko-Lang: en' \
    --data "$(jq -n --arg p "$ADMIN_PASSWORD" '{password:$p}')" | jq -r .token
)"
AUTH=(-H "Authorization: Bearer $ADMIN_TOKEN" -H "X-Roko-Lang: en" -H "Accept-Language: en")

node --input-type=module - <<'NODE'
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const { error } = await supabase.from("bookings").select("assigned_tutor").limit(1);
if (error) {
  console.error(
    "Self-test requires the assigned_tutor migration: " +
      "supabase/migrations/20260628_add_assigned_tutor.sql",
  );
  process.exit(1);
}
NODE

create_booking() {
  local night="$1"
  local email="${2:-retest+$night@example.test}"
  curl -fsS -X POST "$BASE/api/bookings" -H 'Content-Type: application/json' \
    --data "$(jq -n --arg n "$night" --arg email "$email" '{
      night:$n, requester_name:("Retest " + $n),
      email:$email,
      phone:"+49 551 1234567", address:"Teststraße 1", residency:"external",
      guest_count:12, additional_info:"production-grade retest", lang:"en"
    }')" | jq -r .id
}

approve_and_token() {
  local id="$1"
  local approval
  approval="$(curl -fsS -X POST "${AUTH[@]}" "$BASE/api/admin/bookings/$id/approve")"
  assert_jq "$approval" '.booking.status=="approved" and (.email.sent|type=="boolean")'
  curl -fsS "${AUTH[@]}" "$BASE/api/admin/bookings?status=all" |
    jq -r --arg id "$id" '.bookings[] | select(.id==$id) | .access_token'
}

assert_jq() {
  local json="$1"
  shift
  echo "$json" | jq -e "$@" >/dev/null || { echo "assert failed: $*"; echo "$json"; exit 1; }
}

# 1 approval survives email failure; resend is available only while approved
APPROVAL_ID="$(create_booking "${NIGHTS[0]}")"
APPROVAL="$(curl -fsS -X POST "${AUTH[@]}" "$BASE/api/admin/bookings/$APPROVAL_ID/approve")"
assert_jq "$APPROVAL" '.booking.status=="approved" and .email.sent==false and .email.error=="Approval email could not be sent."'

APPROVAL_STORED="$(curl -fsS "${AUTH[@]}" "$BASE/api/admin/bookings?status=all")"
assert_jq "$APPROVAL_STORED" --arg id "$APPROVAL_ID" '.bookings[] | select(.id==$id and .status=="approved")'

RESENT="$(curl -fsS -X POST "${AUTH[@]}" "$BASE/api/admin/bookings/$APPROVAL_ID/resend-approval")"
assert_jq "$RESENT" '.email.sent==false and .email.error=="Approval email could not be sent."'

PENDING_ID="$(create_booking "${NIGHTS[1]}")"
PENDING_RESEND_BODY="$TMP/pending-resend.json"
PENDING_RESEND_CODE="$(curl -sS -o "$PENDING_RESEND_BODY" -w '%{http_code}' \
  -X POST "${AUTH[@]}" "$BASE/api/admin/bookings/$PENDING_ID/resend-approval")"
test "$PENDING_RESEND_CODE" = "409"
assert_jq "$(cat "$PENDING_RESEND_BODY")" '.code=="not_approved_resend"'

# 2 tutor assignment exposes names only, persists assignment, and validates names
TUTOR_LIST="$(curl -fsS "${AUTH[@]}" "$BASE/api/admin/tutors")"
assert_jq "$TUTOR_LIST" '.tutors | type=="array" and length>0 and all(type=="string")'
FIRST_TUTOR="$(echo "$TUTOR_LIST" | jq -r '.tutors[0]')"
ASSIGNED="$(curl -fsS -X POST "${AUTH[@]}" \
  -H 'Content-Type: application/json' "$BASE/api/admin/bookings/$PENDING_ID/assign" \
  --data "$(jq -n --arg tutor "$FIRST_TUTOR" '{tutor:$tutor}')")"
assert_jq "$ASSIGNED" --arg tutor "$FIRST_TUTOR" \
  '.booking.assigned_tutor==$tutor and (.email.sent|type=="boolean")'

UNKNOWN_TUTOR_BODY="$TMP/unknown-tutor.json"
UNKNOWN_TUTOR_CODE="$(curl -sS -o "$UNKNOWN_TUTOR_BODY" -w '%{http_code}' \
  -X POST "${AUTH[@]}" -H 'Content-Type: application/json' \
  "$BASE/api/admin/bookings/$PENDING_ID/assign" --data '{"tutor":"Unknown Tutor"}')"
test "$UNKNOWN_TUTOR_CODE" = "400"
assert_jq "$(cat "$UNKNOWN_TUTOR_BODY")" '.code=="tutor_invalid"'

# 3 phone is required when creating a booking
MISSING_PHONE_BODY="$TMP/missing-phone.json"
MISSING_PHONE_CODE="$(curl -sS -o "$MISSING_PHONE_BODY" -w '%{http_code}' \
  -X POST "$BASE/api/bookings" -H 'Content-Type: application/json' \
  -H 'X-Roko-Lang: en' --data "$(jq -n --arg n "${NIGHTS[7]}" '{
    night:$n, requester_name:"No Phone", email:"no-phone@example.test",
    address:"Test Street 1", residency:"external", lang:"en"
  }')")"
test "$MISSING_PHONE_CODE" = "400"
assert_jq "$(cat "$MISSING_PHONE_BODY")" '.code=="phone_required" and (.error|test("phone"; "i"))'

# 4 online happy path, atomic submit
ONLINE_ID="$(create_booking "${NIGHTS[2]}")"
ONLINE_TOKEN="$(approve_and_token "$ONLINE_ID")"
ONLINE_SUBMIT="$(
  curl -fsS -X POST "$BASE/api/booking/submit?token=$ONLINE_TOKEN" \
    -H 'X-Roko-Lang: en' \
    -F payment_method=online -F signed_contract=@"$PDF" -F payment_proof=@"$PDF"
)"
assert_jq "$ONLINE_SUBMIT" '.booking.status=="signed" and .booking.payment_method=="online" and .booking.hasSignedContract and .booking.hasRentProof'

# 5 counter-sign blocked until rent_paid
BLOCK_BODY="$TMP/block.json"
BLOCK_CODE="$(curl -sS -o "$BLOCK_BODY" -w '%{http_code}' -X POST "${AUTH[@]}" \
  "$BASE/api/admin/bookings/$ONLINE_ID/countersign" -F file=@"$FINAL")"
test "$BLOCK_CODE" = "409"
assert_jq "$(cat "$BLOCK_BODY")" '.code=="rent_not_paid"'

curl -fsS -X POST "${AUTH[@]}" "$BASE/api/admin/bookings/$ONLINE_ID/payment" \
  -H 'Content-Type: application/json' --data '{"rent_paid":true}' >/dev/null
CONFIRMED="$(
  curl -fsS -X POST "${AUTH[@]}" "$BASE/api/admin/bookings/$ONLINE_ID/countersign" \
    -F file=@"$FINAL"
)"
assert_jq "$CONFIRMED" '.booking.status=="confirmed"'

# 6 online without proof blocked, no partial write, German localization
NO_PROOF_ID="$(create_booking "${NIGHTS[3]}")"
NO_PROOF_TOKEN="$(approve_and_token "$NO_PROOF_ID")"
NO_PROOF_BODY="$TMP/no-proof.json"
NO_PROOF_CODE="$(curl -sS -o "$NO_PROOF_BODY" -w '%{http_code}' -X POST \
  "$BASE/api/booking/submit?token=$NO_PROOF_TOKEN" \
  -H 'X-Roko-Lang: de' -H 'Accept-Language: de' \
  -F payment_method=online -F signed_contract=@"$PDF")"
test "$NO_PROOF_CODE" = "400"
assert_jq "$(cat "$NO_PROOF_BODY")" '.code=="payment_proof_required" and (.error|test("Zahlungsnachweis"))'
UNCHANGED="$(curl -fsS -H 'X-Roko-Lang: en' "$BASE/api/booking/status?token=$NO_PROOF_TOKEN")"
assert_jq "$UNCHANGED" '.booking.status=="approved" and (.booking.hasSignedContract|not) and (.booking.hasRentProof|not)'

# 7 cash path, proof ignored/cleared
CASH_ID="$(create_booking "${NIGHTS[4]}")"
CASH_TOKEN="$(approve_and_token "$CASH_ID")"
CASH_SUBMIT="$(
  curl -fsS -X POST "$BASE/api/booking/submit?token=$CASH_TOKEN" \
    -F payment_method=cash -F signed_contract=@"$PDF" -F payment_proof=@"$PDF"
)"
assert_jq "$CASH_SUBMIT" '.booking.status=="signed" and .booking.payment_method=="cash" and .booking.hasSignedContract and (.booking.hasRentProof|not)'

# 8 request-redo reopening
REDO="$(
  curl -fsS -X POST "${AUTH[@]}" "$BASE/api/admin/bookings/$CASH_ID/redo"
)"
assert_jq "$REDO" '.booking.status=="approved" and (.booking.signed_contract_path == null) and (.booking.rent_proof_path == null) and (.booking.payment_method == null)'

# 9 expired handling
EXP_ID="$(create_booking "${NIGHTS[5]}")"
EXP_TOKEN="$(approve_and_token "$EXP_ID")"
EXPIRED_ID="$EXP_ID" node --input-type=module - <<'NODE'
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { error } = await supabase.from("bookings")
  .update({ confirm_deadline: new Date(Date.now() - 60000).toISOString() })
  .eq("id", process.env.EXPIRED_ID);
if (error) throw error;
NODE
EXPIRED_LIST="$(curl -fsS "${AUTH[@]}" "$BASE/api/admin/bookings?status=expired")"
assert_jq "$EXPIRED_LIST" --arg id "$EXP_ID" '.bookings[] | select(.id==$id and .isExpired==true)'
EXPIRED_GUEST="$(curl -fsS -H 'X-Roko-Lang: en' "$BASE/api/booking/status?token=$EXP_TOKEN")"
assert_jq "$EXPIRED_GUEST" '.booking.status=="expired"'

echo "All local retests passed."
