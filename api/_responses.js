export function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export function responseLanguage(req) {
  const queryLang = Array.isArray(req?.query?.lang) ? req.query.lang[0] : req?.query?.lang;
  if (queryLang === "en" || queryLang === "de") return queryLang;

  const explicitHeader =
    req?.headers?.["x-roko-lang"] ||
    req?.headers?.["X-Roko-Lang"] ||
    req?.headers?.["accept-language"] ||
    req?.headers?.["Accept-Language"];
  const headerValue = Array.isArray(explicitHeader) ? explicitHeader[0] : explicitHeader;

  return String(headerValue || "").toLowerCase().startsWith("en") ? "en" : "de";
}

const ERROR_MESSAGES = {
  de: {
    admin_auth_config: "Die Admin-Anmeldung ist nicht konfiguriert.",
    admin_login_config: "Die Admin-Anmeldung ist nicht konfiguriert.",
    approval_deadline_passed: "Die Upload-Frist ist abgelaufen.",
    approve_failed: "Die Freigabe konnte nicht gespeichert werden.",
    booking_load_failed: "Die Buchung konnte nicht geladen werden.",
    booking_not_found: "Buchung nicht gefunden.",
    booking_submit_not_ready: "Diese Buchung ist nicht für die Abgabe bereit.",
    blocked_date_not_found: "Gesperrter Termin nicht gefunden.",
    blocked_date_remove_failed: "Die Sperre konnte nicht entfernt werden.",
    block_create_failed: "Der Termin konnte nicht gesperrt werden.",
    block_list_failed: "Gesperrte Termine konnten nicht geladen werden.",
    cannot_approve_expired: "Abgelaufene Buchungen können nicht freigegeben werden.",
    cannot_cancel_terminal: "Abgeschlossene Buchungen können nicht storniert werden.",
    cannot_counter_sign: "Nur Buchungen mit hochgeladenem unterschriebenem Vertrag können gegengezeichnet werden.",
    cannot_reject_status: "Nur ausstehende Anfragen können abgelehnt werden.",
    cannot_request_redo: "Für diese Buchung kann keine erneute Abgabe angefordert werden.",
    cancel_failed: "Die Stornierung konnte nicht gespeichert werden.",
    conflict_confirmed: "Für diesen Termin gibt es bereits eine bestätigte Buchung.",
    conflict_taken: "Dieser Termin ist bereits belegt.",
    conflict_taken_or_blocked: "Dieser Termin ist bereits durch eine andere Buchung oder Sperre belegt.",
    countersign_failed: "Die Buchung konnte nicht gegengezeichnet werden.",
    edit_email_invalid: "Die E-Mail-Adresse ist ungültig.",
    edit_failed: "Die Buchung konnte nicht aktualisiert werden.",
    edit_field_empty: "{field} darf nicht leer sein.",
    edit_guest_count_invalid: "Die Gästezahl muss eine positive ganze Zahl sein.",
    edit_no_fields: "Es wurden keine bearbeitbaren Felder gesendet.",
    edit_price_direct: "Der Preis kann nicht direkt bearbeitet werden.",
    edit_residency_invalid: "Der Wohnstatus muss RoKo, Christophorusweg, Rosenbachweg oder Extern sein.",
    file_load_failed: "Die Datei konnte nicht geladen werden.",
    file_not_available: "Diese Datei ist für den aktuellen Buchungsstatus nicht verfügbar.",
    file_not_found: "Datei nicht gefunden.",
    final_contract_not_found: "Finaler Vertrag nicht gefunden.",
    invalid_file_requested: "Ungültige Datei angefordert.",
    invalid_status_filter: "Ungültiger Statusfilter.",
    login_json_invalid: "Der Anfrageinhalt muss gültiges JSON sein.",
    method_not_allowed: "Methode nicht erlaubt. Erlaubt: {allowed}.",
    missing_booking_token: "Der Buchungslink fehlt.",
    no_payment_fields: "Es wurden keine Zahlungsfelder gesendet.",
    night_blocked: "Dieser Termin ist bereits gesperrt.",
    night_date_invalid: "Der Termin muss ein gültiges Datum im Format JJJJ-MM-TT sein.",
    night_friday_saturday: "Der Termin muss ein Freitag oder Samstag sein.",
    night_future: "Der Termin muss in der Zukunft liegen.",
    night_within_365: "Der Termin darf höchstens 365 Tage in der Zukunft liegen.",
    not_approved_resend: "Die Freigabe-E-Mail kann nur für freigegebene Buchungen erneut gesendet werden.",
    not_pending_approve: "Nur ausstehende Anfragen können freigegeben werden.",
    payment_deposit_boolean: "deposit_paid muss ein Wahrheitswert sein.",
    payment_failed: "Die Zahlung konnte nicht aktualisiert werden.",
    payment_method_invalid: "Die Zahlungsart muss Barzahlung oder Online-Überweisung sein.",
    payment_method_required: "Bitte wähle Barzahlung oder Online-Überweisung.",
    payment_proof_load_failed: "Der Zahlungsnachweis konnte nicht geladen werden.",
    payment_proof_not_found: "Zahlungsnachweis nicht gefunden.",
    payment_proof_required: "Für Online-Überweisung ist ein Zahlungsnachweis erforderlich.",
    payment_rent_boolean: "rent_paid muss ein Wahrheitswert sein.",
    proof_invalid: "Der Zahlungsnachweis ist keine gültige PDF-, JPG- oder PNG-Datei.",
    proof_missing: "Bitte lade einen Zahlungsnachweis hoch.",
    proof_multipart_required: "Der Upload muss multipart/form-data mit einem Zahlungsnachweis verwenden.",
    proof_size: "Der Zahlungsnachweis darf maximal 4 MB groß sein.",
    proof_type: "Es sind nur PDF-, JPG- und PNG-Dateien als Zahlungsnachweis erlaubt.",
    redo_failed: "Die erneute Abgabe konnte nicht angefordert werden.",
    reject_failed: "Die Ablehnung konnte nicht gespeichert werden.",
    resend_approval_failed: "Die Freigabe-E-Mail konnte nicht erneut gesendet werden.",
    rent_not_paid: "Markiere die Miete als bezahlt, bevor du gegenzeichnest.",
    request_body_object: "Der Anfrageinhalt muss ein Objekt sein.",
    request_json_invalid: "Der Anfrageinhalt muss gültiges JSON sein.",
    signed_contract_missing: "Bitte lade den unterschriebenen Vertrag als PDF hoch.",
    signed_contract_not_found: "Unterschriebener Vertrag nicht gefunden.",
    signed_contract_pdf_invalid: "Die hochgeladene Datei ist keine gültige PDF.",
    signed_contract_pdf_size: "Die PDF-Datei darf maximal 4 MB groß sein.",
    signed_contract_pdf_type: "Es sind nur PDF-Dateien erlaubt.",
    signed_contract_upload_required: "Der Upload muss multipart/form-data mit einer PDF-Datei verwenden.",
    submit_failed: "Die Abgabe konnte nicht gespeichert werden.",
    submit_size: "Die Upload-Dateien dürfen jeweils maximal 4 MB groß sein.",
    tutor_assign_failed: "Der Tutor konnte nicht zugewiesen werden.",
    tutor_invalid: "Bitte wähle einen konfigurierten Tutor aus.",
    tutors_invalid: "TUTORS enthält ungültige oder doppelte Tutor-Daten.",
    tutors_invalid_json: "TUTORS enthält kein gültiges JSON.",
    tutors_load_failed: "Die Tutoren konnten nicht geladen werden.",
    tutors_missing: "Die Tutor-Zuweisung ist nicht konfiguriert: TUTORS fehlt.",
    phone_invalid: "Bitte gib eine gültige Telefonnummer mit mindestens 7 Ziffern ein.",
    phone_required: "Bitte gib eine Telefonnummer ein.",
    unauthorized: "Nicht autorisiert.",
    use_booking_submit: "Bitte verwende die gemeinsame Abgabe für Vertrag und Zahlung.",
  },
  en: {
    admin_auth_config: "Admin authentication is not configured.",
    admin_login_config: "Admin login is not configured.",
    approval_deadline_passed: "The upload deadline has passed.",
    approve_failed: "Could not approve booking.",
    booking_load_failed: "Could not load the booking.",
    booking_not_found: "Booking not found.",
    booking_submit_not_ready: "This booking is not ready for submission.",
    blocked_date_not_found: "Blocked date not found.",
    blocked_date_remove_failed: "Could not remove blocked date.",
    block_create_failed: "Could not block date.",
    block_list_failed: "Could not load blocked dates.",
    cannot_approve_expired: "Expired bookings cannot be approved.",
    cannot_cancel_terminal: "Terminal bookings cannot be cancelled.",
    cannot_counter_sign: "Only bookings with an uploaded signed contract can be counter-signed.",
    cannot_reject_status: "Only pending requests can be rejected.",
    cannot_request_redo: "A redo cannot be requested for this booking.",
    cancel_failed: "Could not cancel booking.",
    conflict_confirmed: "This night already has a confirmed booking.",
    conflict_taken: "This night is already taken.",
    conflict_taken_or_blocked: "This night is already taken by another booking or block.",
    countersign_failed: "Could not counter-sign booking.",
    edit_email_invalid: "Email must be a valid email address.",
    edit_failed: "Could not update booking.",
    edit_field_empty: "{field} must not be empty.",
    edit_guest_count_invalid: "guest_count must be a positive integer.",
    edit_no_fields: "No editable fields were provided.",
    edit_price_direct: "price cannot be edited directly.",
    edit_residency_invalid: "residency must be one of roko, christophorusweg, rosenbachweg, external.",
    file_load_failed: "Could not load file.",
    file_not_available: "This file is not available for the current booking status.",
    file_not_found: "File not found.",
    final_contract_not_found: "Final contract not found.",
    invalid_file_requested: "Invalid file requested.",
    invalid_status_filter: "Invalid status filter.",
    login_json_invalid: "Request body must be valid JSON.",
    method_not_allowed: "Method not allowed. Use {allowed}.",
    missing_booking_token: "Missing booking token.",
    no_payment_fields: "No payment fields were provided.",
    night_blocked: "This night is already blocked.",
    night_date_invalid: "night must be a valid YYYY-MM-DD date.",
    night_friday_saturday: "night must be a Friday or Saturday.",
    night_future: "night must be in the future.",
    night_within_365: "night must be within 365 days.",
    not_approved_resend: "The approval email can only be resent for approved bookings.",
    not_pending_approve: "Only pending bookings can be approved.",
    payment_deposit_boolean: "deposit_paid must be a boolean.",
    payment_failed: "Could not update payment.",
    payment_method_invalid: "payment_method must be cash or online.",
    payment_method_required: "Please choose cash or online bank transfer.",
    payment_proof_load_failed: "Could not load payment proof.",
    payment_proof_not_found: "Payment proof not found.",
    payment_proof_required: "Payment proof is required for online bank transfer.",
    payment_rent_boolean: "rent_paid must be a boolean.",
    proof_invalid: "Uploaded proof file is not a valid PDF, JPG, or PNG.",
    proof_missing: "Please upload a payment proof file.",
    proof_multipart_required: "Upload must use multipart/form-data with a proof file.",
    proof_size: "Proof must be 4 MB or smaller.",
    proof_type: "Only PDF, JPG, and PNG proof files are accepted.",
    redo_failed: "Could not request redo.",
    reject_failed: "Could not reject booking.",
    resend_approval_failed: "Could not resend approval email.",
    rent_not_paid: "Mark rent as paid before counter-signing.",
    request_body_object: "Request body must be an object.",
    request_json_invalid: "Request body must be valid JSON.",
    signed_contract_missing: "Please upload the signed contract as a PDF.",
    signed_contract_not_found: "Signed contract not found.",
    signed_contract_pdf_invalid: "Uploaded file is not a valid PDF.",
    signed_contract_pdf_size: "PDF must be 4 MB or smaller.",
    signed_contract_pdf_type: "Only PDF files are accepted.",
    signed_contract_upload_required: "Upload must use multipart/form-data with a PDF file.",
    submit_failed: "Could not save submission.",
    submit_size: "Uploaded files must be 4 MB or smaller each.",
    tutor_assign_failed: "Could not assign the tutor.",
    tutor_invalid: "Please choose a configured tutor.",
    tutors_invalid: "TUTORS contains invalid or duplicate tutor data.",
    tutors_invalid_json: "TUTORS is not valid JSON.",
    tutors_load_failed: "Could not load tutors.",
    tutors_missing: "Tutor assignment is not configured: TUTORS is missing.",
    phone_invalid: "Please enter a valid phone number with at least 7 digits.",
    phone_required: "Please enter a phone number.",
    unauthorized: "Unauthorized.",
    use_booking_submit: "Use the combined contract and payment submission.",
  },
};

function interpolate(message, params = {}) {
  return String(message || "").replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) =>
    params[key] === undefined ? match : String(params[key])
  );
}

export function localizedErrorMessage(req, code, params) {
  const lang = responseLanguage(req);
  const messages = ERROR_MESSAGES[lang] || ERROR_MESSAGES.de;
  const fallback = ERROR_MESSAGES.en[code] || code;
  return interpolate(messages[code] || fallback, params);
}

export function sendError(req, res, statusCode, code, params) {
  return sendJson(res, statusCode, {
    code,
    error: localizedErrorMessage(req, code, params),
  });
}

export function methodNotAllowed(req, res, allowedMethod) {
  const allowed = Array.isArray(allowedMethod)
    ? allowedMethod.join(", ")
    : allowedMethod;

  res.setHeader("Allow", allowed);
  return sendError(req, res, 405, "method_not_allowed", { allowed });
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;

  if (typeof req.body === "string") {
    return req.body.trim() ? JSON.parse(req.body) : {};
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();
  return rawBody ? JSON.parse(rawBody) : {};
}
