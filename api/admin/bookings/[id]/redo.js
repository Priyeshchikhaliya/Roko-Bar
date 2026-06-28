import {
  CONTRACT_BUCKET,
  PAYMENT_PROOF_BUCKET,
} from "../../../_contracts.js";
import {
  addBookingDerivedFields,
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../../../_adminUtils.js";
import { requireAdmin } from "../../../_auth.js";
import { CONFIRM_WINDOW_DAYS, SITE_URL } from "../../../_config.js";
import {
  escapeHtml,
  formatNight,
  normalizeEmailLanguage,
  renderEmailLayout,
  sendEmail,
} from "../../../_email.js";
import { methodNotAllowed, sendError, sendJson } from "../../../_responses.js";
import { getSupabase } from "../../../_supabase.js";

const REDO_STATUSES = new Set(["approved", "signed"]);

function privateBookingLink(booking) {
  return `${SITE_URL.replace(/\/$/, "")}/booking/${booking.access_token}`;
}

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

function buildRedoEmailHtml(booking) {
  const lang = normalizeEmailLanguage(booking.lang);
  const nightLabel = formatNight(booking.night, lang);
  const deadlineLabel = formatDeadline(booking.confirm_deadline, lang);
  const link = privateBookingLink(booking);
  const copy =
    lang === "en"
      ? {
          title: "Please resubmit your documents",
          preheader: `Your RoKo Bar booking link for ${nightLabel} has been reopened.`,
          greeting: `Hi ${booking.requester_name},`,
          body: `Your booking for the RoKo Bar on <strong>${escapeHtml(nightLabel)}</strong> needs a new submission. Please open your private link, upload the signed contract again, choose the rent payment method, and add payment proof if you choose online transfer.`,
          deadline: `New deadline: <strong>${escapeHtml(deadlineLabel)}</strong>.`,
        }
      : {
          title: "Bitte Unterlagen erneut einreichen",
          preheader: `Dein RoKo-Bar-Buchungslink für ${nightLabel} wurde wieder geöffnet.`,
          greeting: `Hallo ${booking.requester_name},`,
          body: `deine Buchung für die RoKo Bar am <strong>${escapeHtml(nightLabel)}</strong> braucht eine neue Abgabe. Bitte öffne deinen privaten Link, lade den unterschriebenen Vertrag erneut hoch, wähle die Mietzahlung und füge bei Online-Überweisung den Zahlungsnachweis hinzu.`,
          deadline: `Neue Frist: <strong>${escapeHtml(deadlineLabel)}</strong>.`,
        };

  return renderEmailLayout({
    title: copy.title,
    preheader: copy.preheader,
    children: `
      <p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#26211f;">${escapeHtml(copy.greeting)}</p>
      <p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#26211f;">${copy.body}</p>
      <p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#26211f;">${copy.deadline}</p>
      <p style="margin:0;font-size:15px;line-height:1.55;color:#26211f;"><a href="${escapeHtml(link)}" style="color:#2F6FBF;font-weight:700;">${escapeHtml(link)}</a></p>
    `,
  });
}

async function sendRedoEmail(booking) {
  await sendEmail({
    to: booking.email,
    subject:
      normalizeEmailLanguage(booking.lang) === "en"
        ? "RoKo Bar - Please resubmit your documents"
        : "RoKo Bar - Bitte Unterlagen erneut einreichen",
    html: buildRedoEmailHtml(booking),
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
      .select(BOOKING_COLUMNS)
      .single();

    if (error) throw error;

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
