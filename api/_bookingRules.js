import {
  BOOKABLE_WEEKDAYS,
  PRICE_EXTERNAL,
  PRICE_RESIDENT,
  RESIDENT_RESIDENCIES,
  VALID_RESIDENCIES,
} from "./_config.js";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DAYS_AHEAD = 365;

export function normalizeResidency(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidResidency(residency) {
  return VALID_RESIDENCIES.includes(residency);
}

export function priceForResidency(residency) {
  return RESIDENT_RESIDENCIES.includes(residency)
    ? PRICE_RESIDENT
    : PRICE_EXTERNAL;
}

export function normalizeNight(value) {
  if (typeof value !== "string") return null;

  const night = value.trim();
  if (!ISO_DATE_RE.test(night)) return null;

  const [year, month, day] = night.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { night, date };
}

export function validateBookableNight(value, now = new Date()) {
  const parsed = normalizeNight(value);
  if (!parsed) return { error: "night must be a valid YYYY-MM-DD date." };

  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const maxDate = new Date(today);
  maxDate.setUTCDate(maxDate.getUTCDate() + MAX_DAYS_AHEAD);

  if (parsed.date <= today) {
    return { error: "night must be in the future." };
  }

  if (parsed.date > maxDate) {
    return { error: "night must be within 365 days." };
  }

  if (!BOOKABLE_WEEKDAYS.includes(parsed.date.getUTCDay())) {
    return { error: "night must be a Friday or Saturday." };
  }

  return { night: parsed.night };
}

export function isTakingBooking(booking, now = new Date()) {
  if (booking.status === "confirmed" || booking.status === "signed") {
    return true;
  }

  if (booking.status !== "approved" || !booking.confirm_deadline) {
    return false;
  }

  return new Date(booking.confirm_deadline) > now;
}

export async function isNightTaken(supabase, night, now = new Date()) {
  const [bookingResult, blockedResult] = await Promise.all([
    supabase
      .from("bookings")
      .select("status, confirm_deadline")
      .eq("night", night)
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

export async function getAvailabilityNights(supabase, now = new Date()) {
  const [bookingResult, blockedResult] = await Promise.all([
    supabase
      .from("bookings")
      .select("night, status, confirm_deadline")
      .in("status", ["pending", "approved", "signed", "confirmed"]),
    supabase.from("blocked_dates").select("night"),
  ]);

  if (bookingResult.error) throw bookingResult.error;
  if (blockedResult.error) throw blockedResult.error;

  const taken = new Set();
  const pending = new Set();

  for (const blockedDate of blockedResult.data) {
    taken.add(blockedDate.night);
  }

  for (const booking of bookingResult.data) {
    if (booking.status === "pending") {
      pending.add(booking.night);
      continue;
    }

    if (isTakingBooking(booking, now)) {
      taken.add(booking.night);
    }
  }

  for (const night of taken) {
    pending.delete(night);
  }

  return {
    taken: [...taken].sort(),
    pending: [...pending].sort(),
  };
}
