import { normalizeEmailLanguage } from "./_email.js";
import { renderEmail } from "./_email-layout.js";

export function acknowledgementEmail(booking, fmt) {
  const lang = normalizeEmailLanguage(booking.lang) === "en" ? "en" : "de";
  const dateValue = fmt.nightLabel;
  const price = fmt.price;
  const copy =
    lang === "en"
      ? {
          subject: "RoKo Bar — we've received your request",
          preheader:
            "We've got your request. A tutor will review it and send your contract shortly.",
          heading: "Your request is in",
          paragraphs: [
            `Hi ${booking.requester_name}, thanks for choosing the RoKo Bar for your night. We've received your request — it's not confirmed just yet.`,
            "A tutor will review it shortly and email you the rental contract along with a private link to finish your booking.",
          ],
          closingParagraphs: [
            "Hold tight — your contract is on its way.",
          ],
          detailRows: [
            { label: "When", value: `${dateValue} — the whole day` },
            { label: "Rent", value: `€${price}` },
            {
              label: "Deposit",
              value: "€200 (cash, at key handover)",
            },
          ],
        }
      : {
          subject: "RoKo Bar — deine Anfrage ist eingegangen",
          preheader:
            "Wir haben deine Anfrage erhalten. Ein Tutor prüft sie und schickt dir den Vertrag.",
          heading: "Deine Anfrage ist da",
          paragraphs: [
            `Hallo ${booking.requester_name}, schön, dass du die RoKo Bar für deinen Abend ausgesucht hast. Wir haben deine Anfrage erhalten — bestätigt ist sie aber noch nicht.`,
            "Ein Tutor schaut sie sich in Kürze an und schickt dir den Mietvertrag samt einem privaten Link, mit dem du deine Buchung abschließt.",
          ],
          closingParagraphs: ["Wir melden uns bald. Bis gleich!"],
          detailRows: [
            { label: "Wann", value: `${dateValue} — der ganze Tag` },
            { label: "Miete", value: `${price} €` },
            {
              label: "Kaution",
              value: "200 € (bar bei der Schlüsselübergabe)",
            },
          ],
        };

  return {
    subject: copy.subject,
    html: renderEmail({
      lang,
      preheader: copy.preheader,
      heading: copy.heading,
      paragraphs: copy.paragraphs,
      detailRows: copy.detailRows,
      closingParagraphs: copy.closingParagraphs,
    }),
  };
}

export function approvalEmail(booking, fmt) {
  const lang = normalizeEmailLanguage(booking.lang) === "en" ? "en" : "de";
  const copy =
    lang === "en"
      ? {
          subject: "RoKo Bar — your booking is approved",
          preheader:
            "You're approved. Sign the attached contract and finish up at your private link.",
          heading: "You're approved",
          paragraphs: [
            `Hi ${booking.requester_name}, good news — a tutor has approved your booking for the RoKo Bar.`,
            "Your rental contract is attached, along with the house rules. To lock it in: sign the contract, then open your private link below to upload it and tell us how you'd like to pay the rent.",
          ],
          detailRows: [
            { label: "When", value: `${fmt.nightLabel} — the whole day` },
            { label: "Rent", value: `€${fmt.price}` },
            {
              label: "Deposit",
              value: "€200 (cash, at key handover)",
            },
            { label: "Respond by", value: fmt.deadlineLabel },
          ],
          closingParagraphs: [
            "Nothing's final until a tutor counter-signs — we'll confirm by email once it is.",
          ],
          cta: { label: "Open your booking", url: fmt.bookingUrl },
        }
      : {
          subject: "RoKo Bar — deine Buchung ist freigegeben",
          preheader:
            "Freigegeben! Unterschreibe den beigefügten Vertrag und schließe alles über deinen privaten Link ab.",
          heading: "Du bist freigegeben",
          paragraphs: [
            `Hallo ${booking.requester_name}, gute Nachrichten — ein Tutor hat deine Buchung für die RoKo Bar freigegeben.`,
            "Dein Mietvertrag hängt an dieser E-Mail, zusammen mit der Hausordnung. So machst du es fest: unterschreibe den Vertrag, öffne dann deinen privaten Link unten, lade ihn hoch und sag uns, wie du die Miete zahlen möchtest.",
          ],
          detailRows: [
            { label: "Wann", value: `${fmt.nightLabel} — der ganze Tag` },
            { label: "Miete", value: `${fmt.price} €` },
            {
              label: "Kaution",
              value: "200 € (bar bei der Schlüsselübergabe)",
            },
            { label: "Frist", value: fmt.deadlineLabel },
          ],
          closingParagraphs: [
            "Endgültig ist es erst, wenn ein Tutor gegenzeichnet — wir bestätigen es dir dann per E-Mail.",
          ],
          cta: { label: "Zur Buchung", url: fmt.bookingUrl },
        };

  return {
    subject: copy.subject,
    html: renderEmail({ lang, ...copy }),
  };
}

export function tutorIntroEmail(booking, fmt) {
  const lang = normalizeEmailLanguage(booking.lang) === "en" ? "en" : "de";
  const copy =
    lang === "en"
      ? {
          subject: `RoKo Bar — meet your tutor, ${fmt.tutorName}`,
          preheader: `${fmt.tutorName} is your contact for the evening. Say hi on WhatsApp.`,
          heading: "Meet your tutor",
          paragraphs: [
            `Hi ${booking.requester_name}, ${fmt.tutorName} will be looking after your booking from here — your go-to for keys, timings, and any questions on the night.`,
            `The easiest way to reach ${fmt.tutorName} is WhatsApp. Tap below to start the chat.`,
          ],
          detailRows: [{ label: "When", value: fmt.nightLabel }],
          closingParagraphs: ["Talk soon."],
          cta: {
            label: `Message ${fmt.tutorName} on WhatsApp`,
            url: fmt.whatsappUrl,
          },
        }
      : {
          subject: `RoKo Bar — dein Kontakt, ${fmt.tutorName}`,
          preheader: `${fmt.tutorName} ist für deinen Abend da. Meld dich per WhatsApp.`,
          heading: "Dein Kontakt steht fest",
          paragraphs: [
            `Hallo ${booking.requester_name}, ab hier kümmert sich ${fmt.tutorName} um deine Buchung — deine Anlaufstelle für Schlüssel, Zeiten und alle Fragen am Abend.`,
            `Am einfachsten erreichst du ${fmt.tutorName} über WhatsApp. Tippe unten, um den Chat zu starten.`,
          ],
          detailRows: [{ label: "Wann", value: fmt.nightLabel }],
          closingParagraphs: ["Bis bald!"],
          cta: {
            label: `${fmt.tutorName} über WhatsApp schreiben`,
            url: fmt.whatsappUrl,
          },
        };

  return {
    subject: copy.subject,
    html: renderEmail({ lang, ...copy }),
  };
}

export function confirmationEmail(booking, fmt) {
  const lang = normalizeEmailLanguage(booking.lang) === "en" ? "en" : "de";
  const copy =
    lang === "en"
      ? {
          subject: "RoKo Bar — your booking is confirmed",
          preheader:
            "It's official. Your signed contract is attached. See you on the night.",
          heading: "You're all set",
          paragraphs: [
            `Hi ${booking.requester_name}, it's official — your booking for the RoKo Bar is confirmed.`,
            "Your fully signed contract is attached for your records, and it's always available at your private link.",
          ],
          detailRows: [
            { label: "When", value: `${fmt.nightLabel} — the whole day` },
            { label: "Rent", value: `€${fmt.price}` },
            {
              label: "Deposit",
              value: "€200 (cash, at key handover)",
            },
          ],
          closingParagraphs: [
            "One reminder: please bring the €200 deposit in cash to the key handover. Your tutor will sort out the exact timing with you on WhatsApp.",
          ],
          cta: { label: "View your booking", url: fmt.bookingUrl },
        }
      : {
          subject: "RoKo Bar — deine Buchung ist bestätigt",
          preheader:
            "Es ist offiziell. Dein unterschriebener Vertrag hängt an. Bis bald!",
          heading: "Alles startklar",
          paragraphs: [
            `Hallo ${booking.requester_name}, es ist offiziell — deine Buchung für die RoKo Bar ist bestätigt.`,
            "Dein vollständig unterschriebener Vertrag hängt für deine Unterlagen an dieser E-Mail und ist außerdem jederzeit über deinen privaten Link abrufbar.",
          ],
          detailRows: [
            { label: "Wann", value: `${fmt.nightLabel} — der ganze Tag` },
            { label: "Miete", value: `${fmt.price} €` },
            {
              label: "Kaution",
              value: "200 € (bar bei der Schlüsselübergabe)",
            },
          ],
          closingParagraphs: [
            "Eine Erinnerung: bring die 200 € Kaution bitte in bar zur Schlüsselübergabe mit. Die genaue Uhrzeit klärt dein Tutor mit dir über WhatsApp.",
          ],
          cta: { label: "Zur Buchung", url: fmt.bookingUrl },
        };

  return {
    subject: copy.subject,
    html: renderEmail({ lang, ...copy }),
  };
}

export function redoEmail(booking, fmt) {
  const lang = normalizeEmailLanguage(booking.lang) === "en" ? "en" : "de";
  const copy =
    lang === "en"
      ? {
          subject: "RoKo Bar — a quick resubmit needed",
          preheader:
            "A tutor has reopened your booking so you can resubmit your documents.",
          heading: "One more step",
          paragraphs: [
            `Hi ${booking.requester_name}, a tutor has reopened your booking so you can resubmit your documents — the signed contract and your payment details.`,
            "Open your private link below to send them through again. Your tutor can fill you in on what needs adjusting over WhatsApp.",
          ],
          detailRows: [
            { label: "When", value: `${fmt.nightLabel} — the whole day` },
            { label: "Respond by", value: fmt.deadlineLabel },
          ],
          cta: {
            label: "Resubmit your documents",
            url: fmt.bookingUrl,
          },
        }
      : {
          subject: "RoKo Bar — bitte kurz erneut einreichen",
          preheader:
            "Ein Tutor hat deine Buchung wieder geöffnet, damit du deine Unterlagen erneut einreichen kannst.",
          heading: "Noch ein Schritt",
          paragraphs: [
            `Hallo ${booking.requester_name}, ein Tutor hat deine Buchung wieder geöffnet, damit du deine Unterlagen erneut einreichen kannst — den unterschriebenen Vertrag und deine Zahlungsangaben.`,
            "Öffne deinen privaten Link unten und schick sie einfach noch einmal. Was angepasst werden muss, sagt dir dein Tutor über WhatsApp.",
          ],
          detailRows: [
            { label: "Wann", value: `${fmt.nightLabel} — der ganze Tag` },
            { label: "Frist", value: fmt.deadlineLabel },
          ],
          cta: {
            label: "Unterlagen erneut einreichen",
            url: fmt.bookingUrl,
          },
        };

  return {
    subject: copy.subject,
    html: renderEmail({ lang, ...copy }),
  };
}

export function deadlineReminderEmail(booking, fmt) {
  const lang = normalizeEmailLanguage(booking.lang) === "en" ? "en" : "de";
  const copy =
    lang === "en"
      ? {
          subject: `RoKo Bar — ${fmt.daysLeftLabel} to send your contract`,
          preheader:
            "Your signed contract is still missing and the deadline is close.",
          heading: "A quick reminder",
          paragraphs: [
            `Hi ${booking.requester_name}, we're still missing your signed rental contract for ${fmt.nightLabel}. Your deadline is ${fmt.deadlineLabel}.`,
            "If it passes, the night is released and someone else can book it — so please open your private link below and upload the contract.",
          ],
          detailRows: [
            { label: "When", value: `${fmt.nightLabel} — the whole day` },
            { label: "Deadline", value: fmt.deadlineLabel },
          ],
          cta: {
            label: "Upload your contract",
            url: fmt.bookingUrl,
          },
          closingParagraphs: [
            "Can't manage it in time, or something is unclear? Just reply to this email and we'll sort it out — losing the date over a missed deadline would be a shame.",
          ],
        }
      : {
          subject: `RoKo Bar — ${fmt.daysLeftLabel} für deinen Vertrag`,
          preheader:
            "Dein unterschriebener Vertrag fehlt noch und die Frist läuft bald ab.",
          heading: "Kurze Erinnerung",
          paragraphs: [
            `Hallo ${booking.requester_name}, uns fehlt noch dein unterschriebener Mietvertrag für ${fmt.nightLabel}. Deine Frist endet am ${fmt.deadlineLabel}.`,
            "Läuft sie ab, wird die Nacht wieder freigegeben und kann von anderen gebucht werden — öffne also einfach deinen privaten Link unten und lade den Vertrag hoch.",
          ],
          detailRows: [
            { label: "Wann", value: `${fmt.nightLabel} — der ganze Tag` },
            { label: "Frist", value: fmt.deadlineLabel },
          ],
          cta: {
            label: "Vertrag hochladen",
            url: fmt.bookingUrl,
          },
          closingParagraphs: [
            "Schaffst du es nicht rechtzeitig oder ist etwas unklar? Antworte einfach auf diese E-Mail, dann finden wir eine Lösung — wegen einer verpassten Frist den Termin zu verlieren wäre schade.",
          ],
        };

  return {
    subject: copy.subject,
    html: renderEmail({ lang, ...copy }),
  };
}

export function rejectionEmail(booking, fmt) {
  const lang = normalizeEmailLanguage(booking.lang) === "en" ? "en" : "de";
  const copy =
    lang === "en"
      ? {
          subject: "RoKo Bar — about your booking request",
          preheader:
            "We weren't able to confirm this booking — here's where things stand.",
          heading: "About your request",
          paragraphs: [
            `Hi ${booking.requester_name}, thanks for your interest in the RoKo Bar. Unfortunately we weren't able to confirm your booking for this date.`,
            "Sometimes the night's already spoken for, or it just doesn't work out this time around. You're very welcome to check the calendar and request another date.",
          ],
          detailRows: [{ label: "Requested", value: fmt.nightLabel }],
          closingParagraphs: ["Hope to host you another time."],
          cta: fmt.bookingUrl
            ? { label: "See available dates", url: fmt.bookingUrl }
            : null,
        }
      : {
          subject: "RoKo Bar — zu deiner Anfrage",
          preheader:
            "Diese Buchung konnten wir leider nicht bestätigen — hier der Stand.",
          heading: "Zu deiner Anfrage",
          paragraphs: [
            `Hallo ${booking.requester_name}, danke für dein Interesse an der RoKo Bar. Leider konnten wir deine Buchung für diesen Termin nicht bestätigen.`,
            "Manchmal ist der Abend schon vergeben, oder es passt diesmal einfach nicht. Schau gern in den Kalender und frag einen anderen Termin an.",
          ],
          detailRows: [{ label: "Angefragt", value: fmt.nightLabel }],
          closingParagraphs: [
            "Vielleicht klappt's ein andermal — wir würden uns freuen.",
          ],
          cta: fmt.bookingUrl
            ? { label: "Freie Termine ansehen", url: fmt.bookingUrl }
            : null,
        };

  return {
    subject: copy.subject,
    html: renderEmail({ lang, ...copy }),
  };
}
