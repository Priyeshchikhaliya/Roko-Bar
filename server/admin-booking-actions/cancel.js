import {
  addBookingDerivedFields,
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../api/_adminUtils.js";
import { requireAdmin } from "../api/_auth.js";
import { methodNotAllowed, sendError, sendJson } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

// Cancellable at any live stage, including "confirmed" — a tutor must be able to
// release a night if a confirmed event falls through. Only already-closed
// bookings (rejected/cancelled) cannot be cancelled again.
const CANCELLABLE_STATUSES = ["pending", "approved", "signed", "confirmed"];

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    return methodNotAllowed(req, res, "POST");
  }

  try {
    const supabase = getSupabase();
    const id = getQueryValue(req, "id");
    const { data: booking, error: loadError } = await supabase
      .from("bookings")
      .select(BOOKING_COLUMNS)
      .eq("id", id)
      .single();

    if (loadError) {
      if (isNotFoundError(loadError)) {
        return sendError(req, res, 404, "booking_not_found");
      }

      throw loadError;
    }

    if (!CANCELLABLE_STATUSES.includes(booking.status)) {
      return sendError(req, res, 409, "cannot_cancel_terminal");
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .in("status", CANCELLABLE_STATUSES)
      .select(BOOKING_COLUMNS)
      .single();

    if (error) {
      // Lost a race: already closed by the time the update ran.
      if (isNotFoundError(error)) {
        return sendError(req, res, 409, "cannot_cancel_terminal");
      }

      throw error;
    }

    return sendJson(res, 200, { booking: addBookingDerivedFields(data) });
  } catch (error) {
    console.error("admin booking cancel error", error);
    return sendError(req, res, 500, "cancel_failed");
  }
}
