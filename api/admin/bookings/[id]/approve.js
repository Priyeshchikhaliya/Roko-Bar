import crypto from "node:crypto";

import { approvalEmailAttachments } from "../../../_contracts.js";
import {
  addBookingDerivedFields,
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../../../_adminUtils.js";
import { requireAdmin } from "../../../_auth.js";
import { isTakingBooking } from "../../../_bookingRules.js";
import { CONFIRM_WINDOW_DAYS, SITE_URL } from "../../../_config.js";
import {
  escapeHtml,
  formatNight,
  normalizeEmailLanguage,
  renderEmailLayout,
  sendEmail,
} from "../../../_email.js";
import { methodNotAllowed, sendJson } from "../../../_responses.js";
import { getSupabase } from "../../../_supabase.js";

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

function privateBookingLink(booking) {
  return `${SITE_URL.replace(/\/$/, "")}/booking/${booking.access_token}`;
}

function formatDeadline(value, lang) {
  if (!value) return lang === "en" ? "not set" : "nicht gesetzt";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return lang === "en" ? "not set" : "nicht gesetzt";
  }

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

function buildApprovalEmailHtml(booking) {
  const lang = normalizeEmailLanguage(booking.lang);
  const nightLabel = formatNight(booking.night, lang);
  const deadlineLabel = formatDeadline(booking.confirm_deadline, lang);
  const link = privateBookingLink(booking);
  const onlinePaymentNote =
    booking.payment_method === "online"
      ? lang === "en"
        ? `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#26211f;">Because you chose online rent payment, your private link will show the bank details and let you upload proof after the signed contract is uploaded.</p>`
        : `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#26211f;">Da du Online-Zahlung fuer die Miete gewaehlt hast, findest du die Bankdaten in deinem privaten Link und kannst dort nach dem Vertragsupload den Zahlungsnachweis hochladen.</p>`
      : "";
  const copy =
    lang === "en"
      ? {
          title: "Booking approved",
          preheader: `Your contract link for ${nightLabel} is ready.`,
          greeting: `Hi ${booking.requester_name},`,
          approved: `Your request for the RoKo Bar on <strong>${escapeHtml(nightLabel)}</strong> has been approved. The correct blank contract and the house rules are attached.`,
          instructions: `Open your private link, sign the contract, and upload it there as a PDF. Deadline: <strong>${escapeHtml(deadlineLabel)}</strong>.`,
          finalNote:
            "Nothing is final yet: the booking becomes binding only after you sign and we counter-sign the contract.",
        }
      : {
          title: "Buchung freigegeben",
          preheader: `Dein Vertragslink fuer ${nightLabel} ist bereit.`,
          greeting: `Hallo ${booking.requester_name},`,
          approved: `deine Anfrage fuer die RoKo Bar am <strong>${escapeHtml(nightLabel)}</strong> wurde freigegeben. Im Anhang findest du den passenden Mietvertrag und die Hausordnung.`,
          instructions: `Oeffne deinen privaten Link, unterschreibe den Vertrag und lade ihn dort als PDF hoch. Frist: <strong>${escapeHtml(deadlineLabel)}</strong>.`,
          finalNote:
            "Noch ist nichts final: verbindlich wird die Buchung erst, wenn du unterschrieben hast und wir den Vertrag gegengezeichnet haben.",
        };

  return renderEmailLayout({
    title: copy.title,
    preheader: copy.preheader,
    children: `
      <p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#26211f;">${escapeHtml(copy.greeting)}</p>
      <p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#26211f;">${copy.approved}</p>
      <p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#26211f;">${copy.instructions}</p>
      ${onlinePaymentNote}
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.55;color:#26211f;"><a href="${escapeHtml(link)}" style="color:#2F6FBF;font-weight:700;">${escapeHtml(link)}</a></p>
      <p style="margin:0;font-size:15px;line-height:1.55;color:#26211f;">${escapeHtml(copy.finalNote)}</p>
    `,
  });
}

async function sendApprovalEmail(booking) {
  const attachments = await approvalEmailAttachments(booking);

  await sendEmail({
    to: booking.email,
    subject:
      normalizeEmailLanguage(booking.lang) === "en"
        ? "RoKo Bar - Booking approved"
        : "RoKo Bar - Buchung freigegeben",
    html: buildApprovalEmailHtml(booking),
    attachments,
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

    if (booking.status !== "pending") {
      return sendJson(res, 409, {
        error: "Only pending bookings can be approved.",
      });
    }

    if (await isNightTakenByOtherBooking(supabase, booking.night, id)) {
      return sendJson(res, 409, {
        error: "This night is already taken by another booking or block.",
      });
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
      .select(BOOKING_COLUMNS)
      .single();

    if (error) throw error;

    try {
      await sendApprovalEmail(data);
    } catch (emailError) {
      console.error("booking approval email error", emailError);
    }

    return sendJson(res, 200, { booking: addBookingDerivedFields(data) });
  } catch (error) {
    console.error("admin booking approve error", error);
    return sendJson(res, 500, { error: "Could not approve booking." });
  }
}
