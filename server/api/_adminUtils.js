export const BOOKING_COLUMNS = [
  "id",
  "created_at",
  "night",
  "requester_name",
  "email",
  "phone",
  "address",
  "residency",
  "price",
  "guest_count",
  "additional_info",
  "lang",
  "payment_method",
  "status",
  "access_token",
  "confirm_deadline",
  "reviewed_at",
  "signed_contract_path",
  "final_contract_path",
  "countersigned_at",
  "rent_paid",
  "rent_paid_at",
  "rent_proof_path",
  "deposit_paid",
  "deposit_paid_at",
  "payment_note",
  "rent_note",
  "deposit_note",
  "internal_notes",
  "assigned_tutor",
].join(", ");

export const BOOKING_STATUSES = [
  "pending",
  "approved",
  "signed",
  "confirmed",
  "rejected",
  "cancelled",
];

export function getQueryValue(req, name) {
  const value = req.query?.[name];
  return Array.isArray(value) ? value[0] : value;
}

export function isNotFoundError(error) {
  return error?.code === "PGRST116";
}

export function addBookingDerivedFields(booking, now = new Date()) {
  return {
    ...booking,
    isExpired:
      booking.status === "approved" &&
      Boolean(booking.confirm_deadline) &&
      new Date(booking.confirm_deadline) <= now,
  };
}
