import crypto from "node:crypto";

import {
  addBookingDerivedFields,
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../api/_adminUtils.js";
import { requireAdmin } from "../api/_auth.js";
import { isTakingBooking } from "../api/_bookingRules.js";
import { CONFIRM_WINDOW_DAYS } from "../api/_config.js";
import { sendApprovalEmailWithStatus } from "../api/_email.js";
import { methodNotAllowed, sendError, sendJson } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

async function isNightTakenByOtherBooking(supabase, night, bookingId, now = new Date()) {
  const [bookingResult, blockedResult] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, status, confirm_deadline")
      .eq("night", night)
      .neq("id", bookingId)
      .in("status", ["confirmed", "signed", "approved"]),
    supabase.from("blocked_dates").select("id").eq("night", night).limit(1),
  ]);

  if (bookingResult.error) throw bookingResult.error;
  if (blockedResult.error) throw blockedResult.error;

  return (
    blockedResult.data.length > 0 ||
    bookingResult.data.some((booking) => isTakingBooking(booking, now))
  );
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    return methodNotAllowed(req, res, "POST");
  }

  const id = getQueryValue(req, "id");

  try {
    const supabase = getSupabase();
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

    if (booking.status !== "pending") {
      return sendError(req, res, 409, "not_pending_approve");
    }

    if (!booking.assigned_tutor) {
      return sendError(req, res, 409, "tutor_required_before_approve");
    }

    if (await isNightTakenByOtherBooking(supabase, booking.night, id)) {
      return sendError(req, res, 409, "conflict_taken_or_blocked");
    }

    const now = new Date();
    const confirmDeadline = new Date(
      now.getTime() + CONFIRM_WINDOW_DAYS * 24 * 60 * 60 * 1000
    );
    const update = {
      status: "approved",
      reviewed_at: now.toISOString(),
      confirm_deadline: confirmDeadline.toISOString(),
    };

    if (!booking.access_token) {
      update.access_token = crypto.randomUUID();
    }

    const { data, error } = await supabase
      .from("bookings")
      .update(update)
      .eq("id", id)
      .eq("status", "pending")
      .select(BOOKING_COLUMNS)
      .single();

    if (error) {
      // Lost a race: the booking left "pending" between load and update.
      if (isNotFoundError(error)) {
        return sendError(req, res, 409, "not_pending_approve");
      }

      throw error;
    }

    const email = await sendApprovalEmailWithStatus(data, (emailError) => {
      console.error("booking approval email error", emailError);
    });

    return sendJson(res, 200, {
      booking: addBookingDerivedFields(data),
      email,
    });
  } catch (error) {
    console.error("admin booking approve error", error);
    return sendError(req, res, 500, "approve_failed");
  }
}
