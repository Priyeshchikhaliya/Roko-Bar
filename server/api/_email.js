import { Resend } from "resend";

import { approvalEmailAttachments } from "./_contracts.js";
import { EMAIL_FROM } from "./_config.js";
import { approvalEmail, tutorIntroEmail } from "./_email-content.js";
import { privateBookingUrl } from "./_links.js";

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
  const lang = normalizeEmailLanguage(booking.lang);
  const message = approvalEmail(booking, {
    nightLabel: formatNight(booking.night, lang),
    price: booking.price,
    deadlineLabel: formatDeadline(booking.confirm_deadline, lang),
    bookingUrl: privateBookingUrl(booking.access_token),
  });

  return sendEmail({
    to: booking.email,
    subject: message.subject,
    html: message.html,
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

export async function sendTutorIntroEmail(booking, tutor) {
  const lang = normalizeEmailLanguage(booking.lang);
  const message = tutorIntroEmail(booking, {
    tutorName: tutor.name,
    whatsappUrl: `https://wa.me/${tutor.wa}`,
    nightLabel: formatNight(booking.night, lang),
  });

  return sendEmail({
    to: booking.email,
    subject: message.subject,
    html: message.html,
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
