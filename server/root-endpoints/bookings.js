import {
  isNightTaken,
  isValidResidency,
  normalizeResidency,
  priceForResidency,
  validateBookableNight,
} from "../api/_bookingRules.js";
import {
  DEPOSIT_AMOUNT,
  PRICE_EXTERNAL,
  PRICE_RESIDENT,
  TUTOR_NOTIFY_EMAIL,
} from "../api/_config.js";
import {
  escapeHtml,
  formatNight,
  normalizeEmailLanguage,
  renderEmailLayout,
  sendEmail,
} from "../api/_email.js";
import { normalizePaymentMethod } from "../api/_payments.js";
import { methodNotAllowed, readJsonBody, sendError, sendJson } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()./-]{7,25}$/;
const RESIDENCY_LABELS = {
  roko: `RoKo resident rate (${PRICE_RESIDENT} &euro;)`,
  christophorusweg: `Christophorusweg resident rate (${PRICE_RESIDENT} &euro;)`,
  rosenbachweg: `Rosenbachweg resident rate (${PRICE_RESIDENT} &euro;)`,
  external: `External rate (${PRICE_EXTERNAL} &euro;)`,
};

function requiredText(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    return { error: `${fieldName} is required.` };
  }

  return { value: value.trim() };
}

function optionalText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return PHONE_RE.test(value) && digits.length >= 7 && digits.length <= 15;
}

function normalizeGuestCount(value) {
  if (value === undefined || value === null || value === "") return null;

  const guestCount = Number(value);
  if (!Number.isInteger(guestCount) || guestCount <= 0) {
    return { error: "guest_count must be a positive integer." };
  }

  return { value: guestCount };
}

function normalizeBookingLanguage(value) {
  return value === "en" ? "en" : "de";
}

function textToHtml(value, fallback = "Nicht angegeben") {
  const text =
    value === undefined || value === null || value === "" ? fallback : value;
  return escapeHtml(text).replace(/\n/g, "<br>");
}

function detailRow(label, value, { raw = false } = {}) {
  return `<tr>
    <td style="padding:8px 12px 8px 0;font-size:14px;line-height:1.45;color:#7b706b;vertical-align:top;width:160px;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;font-size:14px;line-height:1.45;color:#26211f;vertical-align:top;">${raw ? value : escapeHtml(value)}</td>
  </tr>`;
}

function buildTutorNotificationHtml(booking) {
  const nightLabel = formatNight(booking.night, "de");
  const paymentMethod =
    booking.payment_method === "online"
      ? "Online / Ueberweisung"
      : booking.payment_method === "cash"
        ? "Barzahlung"
        : "Nicht angegeben";
  const rows = [
    detailRow("Datum", nightLabel),
    detailRow("Name", booking.requester_name),
    detailRow("E-Mail", booking.email),
    detailRow("Telefon", booking.phone || "Nicht angegeben"),
    detailRow("Adresse", textToHtml(booking.address), { raw: true }),
    detailRow("Residency / Tarif", RESIDENCY_LABELS[booking.residency], {
      raw: true,
    }),
    detailRow("Mietzahlung", paymentMethod),
    detailRow(
      "Gaestezahl",
      booking.guest_count === null ? "Nicht angegeben" : booking.guest_count
    ),
    detailRow("Weitere Infos", textToHtml(booking.additional_info), {
      raw: true,
    }),
    detailRow("Buchungs-ID", booking.id),
  ].join("");

  return renderEmailLayout({
    title: "Neue Buchungsanfrage",
    preheader: `Neue Anfrage fuer ${nightLabel} von ${booking.requester_name}`,
    children: `
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.55;color:#26211f;">Eine neue Anfrage wartet auf Pruefung.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;">
        ${rows}
      </table>
    `,
  });
}

function buildGuestAcknowledgementHtml(booking) {
  const lang = normalizeEmailLanguage(booking.lang);
  const nightLabel = formatNight(booking.night, lang);
  const copy =
    lang === "en"
      ? {
          title: "Request received",
          preheader: `We received your request for ${nightLabel}.`,
          greeting: `Hi ${booking.requester_name},`,
          body: `We received your request for the RoKo Bar on <strong>${escapeHtml(nightLabel)}</strong>. Nothing is booked or confirmed yet. A bar tutor will review it and email you next with the contract link.`,
          closing: "Thanks and see you soon<br>RoKo Bar",
          rows: {
            date: "Date",
            rent: "Rent",
            deposit: "Deposit",
            depositValue: `${DEPOSIT_AMOUNT} &euro; cash at handover`,
            time: "Time",
            timeValue: "whole-day Friday or Saturday",
          },
        }
      : {
          title: "Anfrage erhalten",
          preheader: `Wir haben deine Anfrage fuer ${nightLabel} erhalten.`,
          greeting: `Hallo ${booking.requester_name},`,
          body: `wir haben deine Anfrage fuer die RoKo Bar am <strong>${escapeHtml(nightLabel)}</strong> erhalten. Noch ist nichts gebucht oder bestaetigt. Ein Bar-Tutor prueft die Anfrage und meldet sich als Naechstes per E-Mail mit dem Vertragslink.`,
          closing: "Danke und bis bald<br>RoKo Bar",
          rows: {
            date: "Datum",
            rent: "Miete",
            deposit: "Kaution",
            depositValue: `${DEPOSIT_AMOUNT} &euro; bar bei Uebergabe`,
            time: "Zeitraum",
            timeValue: "ganzer Freitag oder Samstag",
          },
        };
  const rows = [
    detailRow(copy.rows.date, nightLabel),
    detailRow(copy.rows.rent, `${booking.price} &euro;`, { raw: true }),
    detailRow(copy.rows.deposit, copy.rows.depositValue, { raw: true }),
    detailRow(copy.rows.time, copy.rows.timeValue),
  ].join("");

  return renderEmailLayout({
    title: copy.title,
    preheader: copy.preheader,
    children: `
      <p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#26211f;">${escapeHtml(copy.greeting)}</p>
      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.55;color:#26211f;">${copy.body}</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;margin:0 0 18px 0;">
        ${rows}
      </table>
      <p style="margin:0;font-size:15px;line-height:1.55;color:#26211f;">${copy.closing}</p>
    `,
  });
}

async function sendBookingEmails(booking) {
  const nightLabel = formatNight(booking.night, "de");
  const guestLang = normalizeEmailLanguage(booking.lang);
  const messages = [
    {
      label: "tutor notification",
      to: TUTOR_NOTIFY_EMAIL,
      subject: `Neue Buchungsanfrage: ${nightLabel} \u2013 ${booking.requester_name}`,
      html: buildTutorNotificationHtml(booking),
    },
    {
      label: "guest acknowledgement",
      to: booking.email,
      subject:
        guestLang === "en"
          ? "RoKo Bar - Request received"
          : "RoKo Bar - Anfrage erhalten",
      html: buildGuestAcknowledgementHtml(booking),
    },
  ];

  const results = await Promise.allSettled(
    messages.map(({ label, ...message }) =>
      sendEmail(message).then((data) => ({ label, data }))
    )
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `booking ${messages[index].label} email error`,
        result.reason
      );
    }
  });
}

function validateBookingBody(body) {
  const nightResult = validateBookableNight(body.night);
  if (nightResult.error) return nightResult;

  const requesterNameResult = requiredText(
    body.requester_name,
    "requester_name"
  );
  if (requesterNameResult.error) return requesterNameResult;

  const emailResult = requiredText(body.email, "email");
  if (emailResult.error) return emailResult;

  const email = emailResult.value.toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { error: "email must be a valid email address." };
  }

  const phoneResult = requiredText(body.phone, "phone");
  if (phoneResult.error) return { code: "phone_required" };
  if (!isValidPhone(phoneResult.value)) return { code: "phone_invalid" };

  const addressResult = requiredText(body.address, "address");
  if (addressResult.error) return addressResult;

  const residency = normalizeResidency(body.residency);
  if (!isValidResidency(residency)) {
    return {
      error:
        "residency must be one of roko, christophorusweg, rosenbachweg, external.",
    };
  }

  const guestCountResult = normalizeGuestCount(body.guest_count);
  if (guestCountResult?.error) return guestCountResult;

  const paymentMethod = normalizePaymentMethod(body.payment_method);
  if (paymentMethod === "") {
    return { error: "payment_method must be cash or online." };
  }

  return {
    booking: {
      night: nightResult.night,
      requester_name: requesterNameResult.value,
      email,
      phone: phoneResult.value,
      address: addressResult.value,
      residency,
      price: priceForResidency(residency),
      guest_count: guestCountResult?.value ?? null,
      additional_info: optionalText(body.additional_info),
      lang: normalizeBookingLanguage(body.lang),
      payment_method: paymentMethod,
      status: "pending",
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(req, res, "POST");
  }

  let body;

  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: "Request body must be valid JSON." });
  }

  const validation = validateBookingBody(body);
  if (validation.code) {
    return sendError(req, res, 400, validation.code);
  }
  if (validation.error) {
    return sendJson(res, 400, { error: validation.error });
  }

  try {
    const supabase = getSupabase();

    if (await isNightTaken(supabase, validation.booking.night)) {
      return sendJson(res, 409, { error: "This night is already taken." });
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert(validation.booking)
      .select(
        "id, night, requester_name, email, phone, address, residency, price, guest_count, additional_info, lang, payment_method"
      )
      .single();

    if (error) throw error;

    try {
      await sendBookingEmails(data);
    } catch (emailError) {
      console.error("booking email error", emailError);
    }

    return sendJson(res, 201, {
      id: data.id,
      price: data.price,
      deposit: DEPOSIT_AMOUNT,
    });
  } catch (error) {
    console.error("booking create error", error);
    return sendJson(res, 500, { error: "Could not create booking." });
  }
}
