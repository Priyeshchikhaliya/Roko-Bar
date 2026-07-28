import { CONFIRM_WINDOW_DAYS, TUTOR_NOTIFY_EMAIL } from "../api/_config.js";
import { deadlineReminderEmail } from "../api/_email-content.js";
import {
  escapeHtml,
  formatNight,
  normalizeEmailLanguage,
  renderEmailLayout,
  sendEmail,
} from "../api/_email.js";
import { privateBookingUrl } from "../api/_links.js";
import { methodNotAllowed, sendJson } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

// How long before confirm_deadline the reminder goes out. Vercel's free plan
// runs cron once a day, so treat this as "within the last 24h of this window"
// rather than an exact T-48h.
const REMINDER_LEAD_DAYS = 2;

const DAY_MS = 24 * 60 * 60 * 1000;

const REMINDER_COLUMNS = [
  "id",
  "night",
  "requester_name",
  "email",
  "lang",
  "access_token",
  "status",
  "confirm_deadline",
].join(", ");

function formatDeadline(value, lang) {
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

function daysLeftLabel(deadline, now, lang) {
  const hours = Math.max(
    0,
    Math.ceil((new Date(deadline).getTime() - now.getTime()) / (60 * 60 * 1000))
  );

  if (hours <= 24) {
    return lang === "en" ? "less than a day left" : "weniger als ein Tag";
  }

  const days = Math.ceil(hours / 24);
  if (lang === "en") return `${days} days left`;
  return `noch ${days} Tage`;
}

// Vercel sets Authorization: Bearer <CRON_SECRET> on scheduled invocations when
// CRON_SECRET is configured. Without the secret set we refuse rather than run
// openly: this endpoint sends mail, so an unauthenticated caller could use it to
// pester guests.
function isAuthorized(req) {
  const secret = (process.env.CRON_SECRET || "").trim();
  if (!secret) return false;

  const header = req.headers?.authorization || req.headers?.Authorization || "";
  const value = Array.isArray(header) ? header[0] : header;
  return value === `Bearer ${secret}`;
}

function buildTeamSummaryHtml({ reminded, expired, now }) {
  const line = (text) =>
    `<p style="margin:0 0 10px 0;font-size:15px;line-height:1.55;color:#26211f;">${text}</p>`;

  // Guest-supplied name and email go into this HTML, so both are escaped —
  // otherwise a booking made with a name containing markup would inject into
  // the team's summary mail.
  const listOf = (rows) =>
    rows.length === 0
      ? "<p style=\"margin:0 0 10px 0;font-size:14px;color:#7b706b;\">Keine.</p>"
      : `<ul style="margin:0 0 14px 18px;padding:0;font-size:14px;line-height:1.6;color:#26211f;">${rows
          .map(
            (b) =>
              `<li>${escapeHtml(formatNight(b.night, "de"))} — ${escapeHtml(
                b.requester_name
              )} (${escapeHtml(b.email)})</li>`
          )
          .join("")}</ul>`;

  return renderEmailLayout({
    title: "RoKo Bar — Fristen",
    preheader: `${reminded.length} Erinnerung(en), ${expired.length} abgelaufen`,
    children: `
      ${line("<strong>Erinnerung verschickt</strong> (Frist in weniger als " + REMINDER_LEAD_DAYS + " Tagen, Vertrag fehlt noch):")}
      ${listOf(reminded)}
      ${line("<strong>Frist gerade abgelaufen</strong> (Nacht ist wieder frei, Gast kann nicht mehr hochladen):")}
      ${listOf(expired)}
      ${line("Abgelaufene Buchungen kannst du im Admin-Bereich mit <em>Neu einreichen</em> wieder öffnen — das gibt " + CONFIRM_WINDOW_DAYS + " neue Tage.")}
      <p style="margin:0;font-size:12px;color:#7b706b;">Automatisch erzeugt am ${formatDeadline(now.toISOString(), "de")}.</p>
    `,
  });
}

async function sendReminder(booking, now) {
  const lang = normalizeEmailLanguage(booking.lang);
  const message = deadlineReminderEmail(booking, {
    nightLabel: formatNight(booking.night, lang),
    deadlineLabel: formatDeadline(booking.confirm_deadline, lang),
    daysLeftLabel: daysLeftLabel(booking.confirm_deadline, now, lang),
    bookingUrl: privateBookingUrl(booking.access_token),
  });

  await sendEmail({
    to: booking.email,
    subject: message.subject,
    html: message.html,
  });
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return methodNotAllowed(req, res, "GET, POST");
  }

  if (!isAuthorized(req)) {
    return sendJson(res, 401, { error: "unauthorized" });
  }

  const supabase = getSupabase();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_LEAD_DAYS * DAY_MS);

  try {
    // Due a reminder: still waiting on the guest, deadline inside the lead
    // window but not yet passed, and not already reminded for this window.
    const { data: due, error: dueError } = await supabase
      .from("bookings")
      .select(REMINDER_COLUMNS)
      .eq("status", "approved")
      .is("deadline_reminder_sent_at", null)
      .gt("confirm_deadline", now.toISOString())
      .lte("confirm_deadline", windowEnd.toISOString());

    if (dueError) throw dueError;

    const reminded = [];
    const failed = [];

    for (const booking of due || []) {
      // Claim it first so a retried or overlapping run cannot double-send, then
      // release the claim if the send fails so tomorrow's run tries again.
      const { data: claimed, error: claimError } = await supabase
        .from("bookings")
        .update({ deadline_reminder_sent_at: now.toISOString() })
        .eq("id", booking.id)
        .is("deadline_reminder_sent_at", null)
        .select("id")
        .maybeSingle();

      if (claimError || !claimed) continue;

      try {
        await sendReminder(booking, now);
        reminded.push(booking);
      } catch (error) {
        console.error("deadline reminder send failed", booking.id, error);
        failed.push(booking.id);
        await supabase
          .from("bookings")
          .update({ deadline_reminder_sent_at: null })
          .eq("id", booking.id);
      }
    }

    // Newly expired since the previous daily run: reported to the team only,
    // never written to the row — "expired" stays a derived state.
    const { data: expired, error: expiredError } = await supabase
      .from("bookings")
      .select(REMINDER_COLUMNS)
      .eq("status", "approved")
      .gt("confirm_deadline", new Date(now.getTime() - DAY_MS).toISOString())
      .lte("confirm_deadline", now.toISOString());

    if (expiredError) throw expiredError;

    if ((reminded.length || (expired || []).length) && TUTOR_NOTIFY_EMAIL) {
      try {
        await sendEmail({
          to: TUTOR_NOTIFY_EMAIL,
          subject: `RoKo Bar — ${reminded.length} Erinnerung(en), ${(expired || []).length} abgelaufen`,
          html: buildTeamSummaryHtml({
            reminded,
            expired: expired || [],
            now,
          }),
        });
      } catch (error) {
        console.error("deadline summary email failed", error);
      }
    }

    return sendJson(res, 200, {
      checkedAt: now.toISOString(),
      reminded: reminded.length,
      remindFailed: failed.length,
      newlyExpired: (expired || []).length,
    });
  } catch (error) {
    console.error("deadline reminder error", error);
    return sendJson(res, 500, { error: "Could not run deadline reminders." });
  }
}
