import {
  addBookingDerivedFields,
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../api/_adminUtils.js";
import { requireAdmin } from "../api/_auth.js";
import { rejectionEmail } from "../api/_email-content.js";
import { formatNight, normalizeEmailLanguage, sendEmail } from "../api/_email.js";
import { bookingPageUrl } from "../api/_links.js";
import { methodNotAllowed, sendError, sendJson } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

async function sendRejectionEmail(booking) {
  const lang = normalizeEmailLanguage(booking.lang);
  const message = rejectionEmail(booking, {
    nightLabel: formatNight(booking.night, lang),
    bookingUrl: bookingPageUrl(),
  });

  await sendEmail({
    to: booking.email,
    subject: message.subject,
    html: message.html,
  });
}

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

    if (booking.status !== "pending") {
      return sendError(req, res, 409, "cannot_reject_status");
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "pending")
      .select(BOOKING_COLUMNS)
      .single();

    if (error) {
      // Lost a race: no longer pending by the time the update ran.
      if (isNotFoundError(error)) {
        return sendError(req, res, 409, "cannot_reject_status");
      }

      throw error;
    }

    try {
      await sendRejectionEmail(data);
    } catch (emailError) {
      console.warn("booking rejection email error", emailError);
    }

    return sendJson(res, 200, { booking: addBookingDerivedFields(data) });
  } catch (error) {
    console.error("admin booking reject error", error);
    return sendError(req, res, 500, "reject_failed");
  }
}
