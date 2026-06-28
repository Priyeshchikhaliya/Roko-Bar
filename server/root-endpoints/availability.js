import { getAvailabilityNights } from "../api/_bookingRules.js";
import { methodNotAllowed, sendJson } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return methodNotAllowed(req, res, "GET");
  }

  try {
    const availability = await getAvailabilityNights(getSupabase());
    return sendJson(res, 200, availability);
  } catch (error) {
    console.error("availability error", error);
    return sendJson(res, 500, { error: "Could not load availability." });
  }
}
