import { sanitizeBookingForGuest } from "../api/_contracts.js";
import { BOOKING_COLUMNS, getQueryValue, isNotFoundError } from "../api/_adminUtils.js";
import { enforceRateLimit } from "../api/_rateLimit.js";
import { methodNotAllowed, sendError, sendJson } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return methodNotAllowed(req, res, "GET");
  }

  // Generous per-IP cap: real guests poll a handful of times, but this slows any
  // attempt to brute-force access tokens. Dorm NAT keeps this well clear of use.
  if (!(await enforceRateLimit(req, res, { scope: "booking-status", max: 120, windowSeconds: 60 }))) {
    return;
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
