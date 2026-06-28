import {
  addBookingDerivedFields,
  BOOKING_COLUMNS,
  BOOKING_STATUSES,
  getQueryValue,
} from "../_adminUtils.js";
import { requireAdmin } from "../_auth.js";
import { methodNotAllowed, sendError, sendJson } from "../_responses.js";
import { getSupabase } from "../_supabase.js";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    return methodNotAllowed(req, res, "GET");
  }

  const status = getQueryValue(req, "status");
  const allowedStatuses = [...BOOKING_STATUSES, "expired"];

  if (status && status !== "all" && !allowedStatuses.includes(status)) {
    return sendError(req, res, 400, "invalid_status_filter");
  }

  try {
    const query = getSupabase()
      .from("bookings")
      .select(BOOKING_COLUMNS)
      .order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    const bookings = data.map((booking) => addBookingDerivedFields(booking));
    const filteredBookings =
      !status || status === "all"
        ? bookings
        : status === "expired"
          ? bookings.filter((booking) => booking.isExpired)
          : status === "approved"
            ? bookings.filter(
                (booking) => booking.status === "approved" && !booking.isExpired
              )
            : bookings.filter((booking) => booking.status === status);

    return sendJson(res, 200, {
      bookings: filteredBookings,
    });
  } catch (error) {
    console.error("admin bookings list error", error);
    return sendError(req, res, 500, "booking_load_failed");
  }
}
