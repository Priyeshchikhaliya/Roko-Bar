import { escapeHtml } from "./_email.js";

const BODY_FONT =
  "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const HEADING_FONT = "Georgia, 'Times New Roman', serif";

function renderParagraphs(paragraphs) {
  return paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px 0;font-family:${BODY_FONT};font-size:15px;line-height:1.6;color:#1F1D1B;">${escapeHtml(paragraph)}</p>`
    )
    .join("");
}

function renderDetailRows(detailRows) {
  if (detailRows.length === 0) return "";

  const rows = detailRows
    .map(
      ({ label, value }, index) => `<tr>
                        <td style="width:32%;padding:${index === 0 ? "14px" : "13px"} 12px 13px 0;border-bottom:1px solid #ECE8E4;font-family:${BODY_FONT};font-size:11px;line-height:1.4;font-weight:600;text-transform:uppercase;color:#6B645E;vertical-align:top;">${escapeHtml(label)}</td>
                        <td style="padding:${index === 0 ? "14px" : "13px"} 0 13px 12px;border-bottom:1px solid #ECE8E4;font-family:${BODY_FONT};font-size:14px;line-height:1.5;color:#1F1D1B;vertical-align:top;">${escapeHtml(value)}</td>
                      </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:4px 0 20px 0;border-collapse:collapse;border-top:1px solid #ECE8E4;">
                    ${rows}
                  </table>`;
}

function renderCta(cta) {
  if (!cta) return "";

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 20px 0;border-collapse:collapse;">
                    <tr>
                      <td bgcolor="#A8392E" style="background:#A8392E;">
                        <a href="${escapeHtml(cta.url)}" bgcolor="#A8392E" style="display:inline-block;padding:14px 24px;background:#A8392E;font-family:${BODY_FONT};font-size:15px;line-height:1;color:#FFFFFF;text-decoration:none;">${escapeHtml(cta.label)}</a>
                      </td>
                    </tr>
                  </table>`;
}

export function renderEmail({
  lang,
  preheader,
  heading,
  paragraphs = [],
  detailRows = [],
  closingParagraphs = [],
  cta = null,
  footerNote = null,
}) {
  const emailLang = lang === "en" ? "en" : "de";
  // This used to read "this address doesn't take replies", which was true while
  // mail went out From: noreply@rokobar.de with no Reply-To — and it actively
  // talked guests out of answering. sendEmail now sets a Reply-To pointing at a
  // mailbox the team owns, so replies do arrive. Keep this in step with
  // EMAIL_REPLY_TO in _config.js: if that ever points somewhere unread again,
  // this sentence becomes a lie.
  const replyNote =
    emailLang === "en"
      ? "You can reply straight to this email — it reaches the bar team. Once a tutor picks up your booking, they'll also be reachable on WhatsApp."
      : "Auf diese E-Mail kannst du direkt antworten – sie erreicht das Bar-Team. Sobald ein Tutor deine Buchung übernimmt, ist er zusätzlich über WhatsApp erreichbar.";

  return `<!doctype html>
<html lang="${emailLang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:#FCFBFA;color:#1F1D1B;">
    <span style="display:none;max-height:0;max-width:0;overflow:hidden;font-size:1px;line-height:1px;color:#FCFBFA;opacity:0;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#FCFBFA" style="width:100%;border-collapse:collapse;background:#FCFBFA;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" bgcolor="#FFFFFF" style="width:100%;max-width:560px;border-collapse:collapse;background:#FFFFFF;border:1px solid #ECE8E4;">
            <tr>
              <td style="padding:32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:0;font-family:${HEADING_FONT};font-size:18px;line-height:1.2;letter-spacing:2px;color:#1F1D1B;">ROKO BAR</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0 18px 0;font-family:${BODY_FONT};font-size:12px;line-height:1.5;color:#6B645E;">Heimkneipe · Robert-Koch-Str. 38, Göttingen</td>
                  </tr>
                  <tr>
                    <td style="height:1px;padding:0;background:#A8392E;font-size:1px;line-height:1px;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding:26px 0 0 0;">
                      <h1 style="margin:0 0 18px 0;font-family:${HEADING_FONT};font-size:22px;line-height:1.3;font-weight:400;color:#1F1D1B;">${escapeHtml(heading)}</h1>
                      ${renderParagraphs(paragraphs)}
                      ${renderDetailRows(detailRows)}
                      ${renderParagraphs(closingParagraphs)}
                      ${renderCta(cta)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 0 0 0;border-top:1px solid #ECE8E4;font-family:${BODY_FONT};font-size:12px;line-height:1.6;color:#6B645E;">
                      <p style="margin:0 0 8px 0;">RoKo Bar · Heimkneipe, Robert-Koch-Str. 38, 37075 Göttingen</p>
                      <p style="margin:0${footerNote ? " 0 8px 0" : ""};">${escapeHtml(replyNote)}</p>
                      ${footerNote ? `<p style="margin:0;">${escapeHtml(footerNote)}</p>` : ""}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
