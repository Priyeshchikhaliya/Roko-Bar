import { sanitizeBookingForGuest } from "../_contracts.js";
import { BOOKING_COLUMNS, getQueryValue, isNotFoundError } from "../_adminUtils.js";
import { methodNotAllowed, sendError, sendJson } from "../_responses.js";
import { getSupabase } from "../_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return methodNotAllowed(req, res, "GET");
  }

  const token = getQueryValue(req, "token");

  if (typeof token !== "string" || token.trim() === "") {
    return sendError(req, res, 400, "missing_booking_token");
  }

  try {
    const { data, error } = await getSupabase()
      .from("bookings")
      .select(BOOKING_COLUMNS)
      .eq("access_token", token.trim())
      .single();

    if (error) {
      if (isNotFoundError(error)) {
        return sendError(req, res, 404, "booking_not_found");
      }

      throw error;
    }

    return sendJson(res, 200, { booking: sanitizeBookingForGuest(data) });
  } catch (error) {
    console.error("booking status error", error);
    return sendError(req, res, 500, "booking_load_failed");
  }
}
