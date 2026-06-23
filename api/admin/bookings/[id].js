import {
  addBookingDerivedFields,
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../../_adminUtils.js";
import {
  isValidResidency,
  normalizeResidency,
  priceForResidency,
} from "../../_bookingRules.js";
import { requireAdmin } from "../../_auth.js";
import { methodNotAllowed, readJsonBody, sendJson } from "../../_responses.js";
import { getSupabase } from "../../_supabase.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EDITABLE_FIELDS = new Set([
  "requester_name",
  "email",
  "phone",
  "address",
  "residency",
  "guest_count",
  "additional_info",
  "internal_notes",
]);

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function requiredText(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    return { error: `${fieldName} must not be empty.` };
  }

  return { value: value.trim() };
}

function optionalText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function normalizeGuestCount(value) {
  if (value === undefined || value === null || value === "") {
    return { value: null };
  }

  const guestCount = Number(value);
  if (!Number.isInteger(guestCount) || guestCount <= 0) {
    return { error: "guest_count must be a positive integer." };
  }

  return { value: guestCount };
}

function buildBookingUpdate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be an object." };
  }

  if (hasOwn(body, "price")) {
    return { error: "price cannot be edited directly." };
  }

  const update = {};

  for (const key of Object.keys(body)) {
    if (!EDITABLE_FIELDS.has(key)) {
      continue;
    }

    if (key === "requester_name" || key === "address") {
      const result = requiredText(body[key], key);
      if (result.error) return result;
      update[key] = result.value;
      continue;
    }

    if (key === "email") {
      const result = requiredText(body.email, "email");
      if (result.error) return result;

      const email = result.value.toLowerCase();
      if (!EMAIL_RE.test(email)) {
        return { error: "email must be a valid email address." };
      }

      update.email = email;
      continue;
    }

    if (key === "phone" || key === "additional_info" || key === "internal_notes") {
      update[key] = optionalText(body[key]);
      continue;
    }

    if (key === "guest_count") {
      const result = normalizeGuestCount(body.guest_count);
      if (result.error) return result;
      update.guest_count = result.value;
      continue;
    }

    if (key === "residency") {
      const residency = normalizeResidency(body.residency);
      if (!isValidResidency(residency)) {
        return {
          error:
            "residency must be one of roko, christophorusweg, rosenbachweg, external.",
        };
      }

      update.residency = residency;
      update.price = priceForResidency(residency);
    }
  }

  if (Object.keys(update).length === 0) {
    return { error: "No editable fields were provided." };
  }

  return { update };
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "PATCH") {
    return methodNotAllowed(res, "PATCH");
  }

  let body;

  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: "Request body must be valid JSON." });
  }

  const validation = buildBookingUpdate(body);
  if (validation.error) {
    return sendJson(res, 400, { error: validation.error });
  }

  try {
    const { data, error } = await getSupabase()
      .from("bookings")
      .update(validation.update)
      .eq("id", getQueryValue(req, "id"))
      .select(BOOKING_COLUMNS)
      .single();

    if (error) {
      if (isNotFoundError(error)) {
        return sendJson(res, 404, { error: "Booking not found." });
      }

      throw error;
    }

    return sendJson(res, 200, { booking: addBookingDerivedFields(data) });
  } catch (error) {
    console.error("admin booking update error", error);
    return sendJson(res, 500, { error: "Could not update booking." });
  }
}
