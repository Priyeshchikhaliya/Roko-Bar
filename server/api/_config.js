// Booking constants. Edit these values here when the rental rules change.
export const BOOKABLE_WEEKDAYS = [5, 6]; // JavaScript UTC weekdays: Friday, Saturday.
export const CONFIRM_WINDOW_DAYS = 7;
export const PRICE_RESIDENT = 75;
export const PRICE_EXTERNAL = 100;
export const DEPOSIT_AMOUNT = 200;

// Transactional email constants. Update these when the Resend domain is verified.
// Resend test-sender note: until a domain is verified, onboarding@resend.dev can
// only deliver to the Resend account's own email. During testing, use that same
// account email as the guest email if the acknowledgement should actually arrive.
export const EMAIL_FROM =
  process.env.EMAIL_FROM || "RoKo Bar <noreply@rokobar.de>";

// Every guest mail is sent From: noreply@rokobar.de, and rokobar.de has no MX
// record — so a guest who simply hits Reply was writing into a void, and
// silence from them was indistinguishable from an answer that never arrived.
//
// This points at the Outlook address rather than heimkneipe@roko-goettingen.de
// on purpose: that one only forwards here, so it cannot be replied *from*, and
// a broken forward would drop mail with no bounce to warn us. Guests would also
// get an answer from a different address than the one they wrote to.
//
// Longer term the right home is a real mailbox on rokobar.de, which would match
// the domain guests actually visit and remove the odd "sender cannot receive
// mail" setup. Until then this is the address the team genuinely controls.
export const EMAIL_REPLY_TO =
  envValue("EMAIL_REPLY_TO") || "rokobar.goettingen@outlook.com";

export const TUTOR_NOTIFY_EMAIL = "rokobar.goettingen@outlook.com";
function envValue(name) {
  return (process.env[name] || "").trim();
}

export const SITE_URL = envValue("SITE_URL") || "http://localhost:3000";

// Rent bank transfer details. Keep real values in environment variables only.
export const BANK_IBAN = envValue("BANK_IBAN");
export const BANK_HOLDER = envValue("BANK_HOLDER");
export const BANK_NAME = envValue("BANK_NAME");

export const RESIDENT_RESIDENCIES = [
  "roko",
  "christophorusweg",
  "rosenbachweg",
];

export const VALID_RESIDENCIES = [...RESIDENT_RESIDENCIES, "external"];
