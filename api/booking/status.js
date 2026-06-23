import { sanitizeBookingForGuest } from "../_contracts.js";
import { BOOKING_COLUMNS, getQueryValue, isNotFoundError } from "../_adminUtils.js";
import { methodNotAllowed, sendJson } from "../_responses.js";
import { getSupabase } from "../_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, "GET");
  }

  const token = getQueryValue(req, "token");

  if (typeof token !== "string" || token.trim() === "") {
    return sendJson(res, 400, { error: "Missing booking token." });
  }

  try {
    const { data, error } = await getSupabase()
      .from("bookings")
      .select(BOOKING_COLUMNS)
      .eq("access_token", token.trim())
      .single();

    if (error) {
      if (isNotFoundError(error)) {
        return sendJson(res, 404, { error: "Booking not found." });
      }

      throw error;
    }

    return sendJson(res, 200, { booking: sanitizeBookingForGuest(data) });
  } catch (error) {
    console.error("booking status error", error);
    return sendJson(res, 500, { error: "Could not load booking." });
  }
}
