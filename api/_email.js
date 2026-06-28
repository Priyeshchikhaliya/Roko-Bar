import { Resend } from "resend";

import { approvalEmailAttachments } from "./_contracts.js";
import { EMAIL_FROM, SITE_URL } from "./_config.js";

let resendClient;

function getResend() {
  if (resendClient) return resendClient;

  const { RESEND_API_KEY } = process.env;

  if (!RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  resendClient = new Resend(RESEND_API_KEY);
  return resendClient;
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export function normalizeEmailLanguage(value) {
  return value === "en" ? "en" : "de";
}

export function formatNight(dateStr, lang = "de") {
  if (typeof dateStr !== "string") return String(dateStr ?? "");

  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr;

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return dateStr;
  }

  const locale = normalizeEmailLanguage(lang) === "en" ? "en-GB" : "de-DE";

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function renderEmailLayout({ title, preheader = "", children }) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f4f1;color:#26211f;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:0;padding:0;background:#f7f4f1;">
      <tr>
        <td align="center" style="padding:28px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 14px 0;font-size:20px;line-height:1.2;font-weight:700;color:#A8392E;">RoKo Bar</td>
            </tr>
            <tr>
              <td style="padding:28px;background:#ffffff;border-top:4px solid #A8392E;border-radius:8px;box-shadow:0 1px 3px rgba(38,33,31,0.08);">
                <h1 style="margin:0 0 18px 0;font-size:24px;line-height:1.25;font-weight:700;color:#26211f;">${escapeHtml(title)}</h1>
                ${children}
              </td>
            </tr>
            <tr>
              <td style="padding:14px 0 0 0;font-size:12px;line-height:1.5;color:#7b706b;">RoKo Bar, Goettingen</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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

export async function sendEmail({ to, subject, html, attachments }) {
  const result = await getResend().emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
    attachments,
  });

  if (result?.error) {
    const message =
      result.error.message || result.error.name || "Unknown Resend error";
    const error = new Error(`Resend email error: ${message}`);
    error.cause = result.error;
    throw error;
  }

  return result?.data;
}

export async function sendApprovalEmail(booking) {
  const attachments = await approvalEmailAttachments(booking);

  return sendEmail({
    to: booking.email,
    subject:
      normalizeEmailLanguage(booking.lang) === "en"
        ? "RoKo Bar - Booking approved"
        : "RoKo Bar - Buchung freigegeben",
    html: buildApprovalEmailHtml(booking),
    attachments,
  });
}

export async function sendApprovalEmailWithStatus(booking, onError) {
  try {
    await sendApprovalEmail(booking);
    return { sent: true };
  } catch (error) {
    onError?.(error);
    return {
      sent: false,
      error: "Approval email could not be sent.",
    };
  }
}

export function buildTutorIntroEmailHtml(booking, tutor) {
  const lang = normalizeEmailLanguage(booking.lang);
  const nightLabel = formatNight(booking.night, lang);
  const whatsappUrl = `https://wa.me/${tutor.wa}`;
  const copy =
    lang === "en"
      ? {
          title: `Meet your RoKo Bar tutor: ${tutor.name}`,
          preheader: `${tutor.name} is your contact for the booking on ${nightLabel}.`,
          greeting: `Hi ${booking.requester_name},`,
          introduction: `I’m ${escapeHtml(tutor.name)}, and I’ll be your contact for your RoKo Bar booking on <strong>${escapeHtml(nightLabel)}</strong>. I’m looking forward to helping you get everything sorted.`,
          invitation:
            "Message me on WhatsApp whenever you’re ready. We can arrange a visit, coordinate key pickup, or clear up any questions you have.",
          whatsapp: `Message ${tutor.name} on WhatsApp`,
          closing: `See you soon<br>${escapeHtml(tutor.name)} · RoKo Bar`,
        }
      : {
          title: `Dein Kontakt für die RoKo Bar: ${tutor.name}`,
          preheader: `${tutor.name} ist dein Kontakt für die Buchung am ${nightLabel}.`,
          greeting: `Hallo ${booking.requester_name},`,
          introduction: `ich bin ${escapeHtml(tutor.name)} und ab jetzt dein Kontakt für deine Buchung der RoKo Bar am <strong>${escapeHtml(nightLabel)}</strong>. Ich freue mich darauf, mit dir alles Weitere zu klären.`,
          invitation:
            "Schreib mir einfach per WhatsApp. Wir können einen Besichtigungstermin vereinbaren, die Schlüsselübergabe abstimmen oder alle offenen Fragen klären.",
          whatsapp: `${tutor.name} per WhatsApp schreiben`,
          closing: `Bis bald<br>${escapeHtml(tutor.name)} · RoKo Bar`,
        };

  return renderEmailLayout({
    title: copy.title,
    preheader: copy.preheader,
    children: `
      <p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#26211f;">${escapeHtml(copy.greeting)}</p>
      <p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#26211f;">${copy.introduction}</p>
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.55;color:#26211f;">${escapeHtml(copy.invitation)}</p>
      <p style="margin:0 0 18px 0;"><a href="${escapeHtml(whatsappUrl)}" style="display:inline-block;padding:12px 16px;background:#A8392E;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">${escapeHtml(copy.whatsapp)}</a></p>
      <p style="margin:0;font-size:15px;line-height:1.55;color:#26211f;">${copy.closing}</p>
    `,
  });
}

export async function sendTutorIntroEmail(booking, tutor) {
  return sendEmail({
    to: booking.email,
    subject:
      normalizeEmailLanguage(booking.lang) === "en"
        ? `RoKo Bar - Meet your tutor ${tutor.name}`
        : `RoKo Bar - Dein Kontakt ${tutor.name}`,
    html: buildTutorIntroEmailHtml(booking, tutor),
  });
}

export async function sendTutorIntroEmailWithStatus(booking, tutor, onError) {
  try {
    await sendTutorIntroEmail(booking, tutor);
    return { sent: true };
  } catch (error) {
    onError?.(error);
    return {
      sent: false,
      error: "Tutor introduction email could not be sent.",
    };
  }
}
