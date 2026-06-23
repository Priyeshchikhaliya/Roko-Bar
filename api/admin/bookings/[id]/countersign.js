import {
  readMultipartPdf,
  sanitizeBookingForGuest,
  sendUploadValidationError,
  uploadPdfToContractBucket,
} from "../../../_contracts.js";
import {
  addBookingDerivedFields,
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../../../_adminUtils.js";
import { requireAdmin } from "../../../_auth.js";
import { SITE_URL } from "../../../_config.js";
import {
  escapeHtml,
  formatNight,
  normalizeEmailLanguage,
  renderEmailLayout,
  sendEmail,
} from "../../../_email.js";
import { methodNotAllowed, sendJson } from "../../../_responses.js";
import { getSupabase } from "../../../_supabase.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function hasOtherConfirmedBooking(supabase, night, bookingId) {
  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("night", night)
    .eq("status", "confirmed")
    .neq("id", bookingId)
    .limit(1);

  if (error) throw error;

  return data.length > 0;
}

function privateBookingLink(booking) {
  return `${SITE_URL.replace(/\/$/, "")}/booking/${booking.access_token}`;
}

function buildConfirmationEmailHtml(booking) {
  const lang = normalizeEmailLanguage(booking.lang);
  const nightLabel = formatNight(booking.night, lang);
  const link = privateBookingLink(booking);
  const copy =
    lang === "en"
      ? {
          title: "Booking confirmed",
          preheader: `The final contract for ${nightLabel} is available.`,
          greeting: `Hi ${booking.requester_name},`,
          body: `Your booking for the RoKo Bar on <strong>${escapeHtml(nightLabel)}</strong> is confirmed. The counter-signed contract is now available at your private link.`,
          deposit:
            "Please remember the 200 &euro; cash deposit at handover.",
        }
      : {
          title: "Buchung bestaetigt",
          preheader: `Finaler Vertrag fuer ${nightLabel} ist verfuegbar.`,
          greeting: `Hallo ${booking.requester_name},`,
          body: `deine Buchung fuer die RoKo Bar am <strong>${escapeHtml(nightLabel)}</strong> ist bestaetigt. Der gegengezeichnete Vertrag liegt jetzt in deinem privaten Link bereit.`,
          deposit: "Bitte denke an die 200 &euro; Kaution bar bei der Uebergabe.",
        };

  return renderEmailLayout({
    title: copy.title,
    preheader: copy.preheader,
    children: `
      <p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#26211f;">${escapeHtml(copy.greeting)}</p>
      <p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#26211f;">${copy.body}</p>
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.55;color:#26211f;"><a href="${escapeHtml(link)}" style="color:#2F6FBF;font-weight:700;">${escapeHtml(link)}</a></p>
      <p style="margin:0;font-size:15px;line-height:1.55;color:#26211f;">${copy.deposit}</p>
    `,
  });
}

async function sendConfirmationEmail(booking) {
  await sendEmail({
    to: booking.email,
    subject:
      normalizeEmailLanguage(booking.lang) === "en"
        ? "RoKo Bar - Booking confirmed"
        : "RoKo Bar - Buchung bestaetigt",
    html: buildConfirmationEmailHtml(booking),
  });
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    return methodNotAllowed(res, "POST");
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
        return sendJson(res, 404, { error: "Booking not found." });
      }

      throw loadError;
    }

    if (booking.status !== "signed" || !booking.signed_contract_path) {
      return sendJson(res, 409, {
        error: "Only bookings with an uploaded signed contract can be counter-signed.",
      });
    }

    if (sanitizeBookingForGuest(booking).status === "expired") {
      return sendJson(res, 409, {
        error: "This approval deadline has passed.",
      });
    }

    if (await hasOtherConfirmedBooking(supabase, booking.night, id)) {
      return sendJson(res, 409, {
        error: "This night already has a confirmed booking.",
      });
    }

    const validation = await readMultipartPdf(req);
    if (validation.error) {
      return sendUploadValidationError(res, validation);
    }

    const storagePath = `final/${booking.id}.pdf`;
    await uploadPdfToContractBucket(supabase, storagePath, validation.file.buffer);

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("bookings")
      .update({
        final_contract_path: storagePath,
        countersigned_at: now,
        status: "confirmed",
      })
      .eq("id", booking.id)
      .select(BOOKING_COLUMNS)
      .single();

    if (error) {
      if (error.code === "23505") {
        return sendJson(res, 409, {
          error: "This night already has a confirmed booking.",
        });
      }

      throw error;
    }

    try {
      await sendConfirmationEmail(data);
    } catch (emailError) {
      console.error("booking confirmation email error", emailError);
    }

    return sendJson(res, 200, { booking: addBookingDerivedFields(data) });
  } catch (error) {
    console.error("admin booking countersign error", error);
    return sendJson(res, 500, { error: "Could not counter-sign booking." });
  }
}
