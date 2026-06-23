import { getAvailabilityNights } from "./_bookingRules.js";
import { methodNotAllowed, sendJson } from "./_responses.js";
import { getSupabase } from "./_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, "GET");
  }

  try {
    const availability = await getAvailabilityNights(getSupabase());
    return sendJson(res, 200, availability);
  } catch (error) {
    console.error("availability error", error);
    return sendJson(res, 500, { error: "Could not load availability." });
  }
}
