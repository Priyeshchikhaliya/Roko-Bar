import {
  CONTRACT_BUCKET,
  PAYMENT_PROOF_BUCKET,
} from "../api/_contracts.js";
import {
  addBookingDerivedFields,
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../api/_adminUtils.js";
import { requireAdmin } from "../api/_auth.js";
import { CONFIRM_WINDOW_DAYS } from "../api/_config.js";
import { redoEmail } from "../api/_email-content.js";
import { formatNight, normalizeEmailLanguage, sendEmail } from "../api/_email.js";
import { privateBookingUrl } from "../api/_links.js";
import { methodNotAllowed, sendError, sendJson } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

const REDO_STATUSES = new Set(["approved", "signed"]);

function formatDeadline(value, lang) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return lang === "en" ? "not set" : "nicht gesetzt";

  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
    timeZoneName: "short",
  }).format(date);
}

async function sendRedoEmail(booking) {
  const lang = normalizeEmailLanguage(booking.lang);
  const message = redoEmail(booking, {
    nightLabel: formatNight(booking.night, lang),
    deadlineLabel: formatDeadline(booking.confirm_deadline, lang),
    bookingUrl: privateBookingUrl(booking.access_token),
  });

  await sendEmail({
    to: booking.email,
    subject: message.subject,
    html: message.html,
  });
}

async function removeIfPresent(supabase, bucket, storagePath) {
  if (!storagePath) return;
  await supabase.storage.from(bucket).remove([storagePath]);
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

    if (!REDO_STATUSES.has(booking.status)) {
      return sendError(req, res, 409, "cannot_request_redo");
    }

    const now = new Date();
    const confirmDeadline = new Date(
      now.getTime() + CONFIRM_WINDOW_DAYS * 24 * 60 * 60 * 1000
    );

    const { data, error } = await supabase
      .from("bookings")
      .update({
        status: "approved",
        confirm_deadline: confirmDeadline.toISOString(),
        signed_contract_path: null,
        rent_proof_path: null,
        payment_method: null,
        rent_paid: false,
        rent_paid_at: null,
        payment_note: null,
      })
      .eq("id", booking.id)
      .in("status", ["approved", "signed"])
      .select(BOOKING_COLUMNS)
      .single();

    if (error) {
      // Lost a race: the booking already advanced or closed before this update.
      if (isNotFoundError(error)) {
        return sendError(req, res, 409, "cannot_request_redo");
      }

      throw error;
    }

    await Promise.allSettled([
      removeIfPresent(supabase, CONTRACT_BUCKET, booking.signed_contract_path),
      removeIfPresent(supabase, PAYMENT_PROOF_BUCKET, booking.rent_proof_path),
    ]);

    try {
      await sendRedoEmail(data);
    } catch (emailError) {
      console.error("booking redo email error", emailError);
    }

    return sendJson(res, 200, { booking: addBookingDerivedFields(data) });
  } catch (error) {
    console.error("admin booking redo error", error);
    return sendError(req, res, 500, "redo_failed");
  }
}
