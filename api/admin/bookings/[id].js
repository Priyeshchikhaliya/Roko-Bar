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
import { methodNotAllowed, readJsonBody, sendError, sendJson } from "../../_responses.js";
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
    return { code: "edit_field_empty", params: { field: fieldName } };
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
    return { code: "edit_guest_count_invalid" };
  }

  return { value: guestCount };
}

function buildBookingUpdate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { code: "request_body_object" };
  }

  if (hasOwn(body, "price")) {
    return { code: "edit_price_direct" };
  }

  const update = {};

  for (const key of Object.keys(body)) {
    if (!EDITABLE_FIELDS.has(key)) {
      continue;
    }

    if (key === "requester_name" || key === "address") {
      const result = requiredText(body[key], key);
      if (result.code) return result;
      update[key] = result.value;
      continue;
    }

    if (key === "email") {
      const result = requiredText(body.email, "email");
      if (result.code) return result;

      const email = result.value.toLowerCase();
      if (!EMAIL_RE.test(email)) {
        return { code: "edit_email_invalid" };
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
      if (result.code) return result;
      update.guest_count = result.value;
      continue;
    }

    if (key === "residency") {
      const residency = normalizeResidency(body.residency);
      if (!isValidResidency(residency)) {
        return {
          code: "edit_residency_invalid",
        };
      }

      update.residency = residency;
      update.price = priceForResidency(residency);
    }
  }

  if (Object.keys(update).length === 0) {
    return { code: "edit_no_fields" };
  }

  return { update };
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "PATCH") {
    return methodNotAllowed(req, res, "PATCH");
  }

  let body;

  try {
    body = await readJsonBody(req);
  } catch {
    return sendError(req, res, 400, "request_json_invalid");
  }

  const validation = buildBookingUpdate(body);
  if (validation.code) {
    return sendError(req, res, 400, validation.code, validation.params);
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
        return sendError(req, res, 404, "booking_not_found");
      }

      throw error;
    }

    return sendJson(res, 200, { booking: addBookingDerivedFields(data) });
  } catch (error) {
    console.error("admin booking update error", error);
    return sendError(req, res, 500, "edit_failed");
  }
}
