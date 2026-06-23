import {
  addBookingDerivedFields,
  BOOKING_COLUMNS,
  BOOKING_STATUSES,
  getQueryValue,
} from "../_adminUtils.js";
import { requireAdmin } from "../_auth.js";
import { methodNotAllowed, sendJson } from "../_responses.js";
import { getSupabase } from "../_supabase.js";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    return methodNotAllowed(res, "GET");
  }

  const status = getQueryValue(req, "status");

  if (status && status !== "all" && !BOOKING_STATUSES.includes(status)) {
    return sendJson(res, 400, { error: "Invalid status filter." });
  }

  try {
    let query = getSupabase()
      .from("bookings")
      .select(BOOKING_COLUMNS)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return sendJson(res, 200, {
      bookings: data.map((booking) => addBookingDerivedFields(booking)),
    });
  } catch (error) {
    console.error("admin bookings list error", error);
    return sendJson(res, 500, { error: "Could not load bookings." });
  }
}
