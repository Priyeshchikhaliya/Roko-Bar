import {
  addBookingDerivedFields,
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../../../_adminUtils.js";
import { requireAdmin } from "../../../_auth.js";
import { methodNotAllowed, sendJson } from "../../../_responses.js";
import { getSupabase } from "../../../_supabase.js";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    return methodNotAllowed(res, "POST");
  }

  try {
    const { data, error } = await getSupabase()
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", getQueryValue(req, "id"))
      .select(BOOKING_COLUMNS)
      .single();

    if (error) {
      if (isNotFoundError(error)) {
        return sendJson(res, 404, { error: "Booking not found." });
      }

      throw error;
    }

    return sendJson(res, 200, { booking: addBookingDerivedFields(data) });
  } catch (error) {
    console.error("admin booking cancel error", error);
    return sendJson(res, 500, { error: "Could not cancel booking." });
  }
}
