import {
  addBookingDerivedFields,
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../api/_adminUtils.js";
import { requireAdmin } from "../api/_auth.js";
import { methodNotAllowed, readJsonBody, sendError, sendJson } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function optionalText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function buildPaymentUpdate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { code: "request_body_object" };
  }

  const now = new Date().toISOString();
  const update = {};

  if (hasOwn(body, "rent_paid")) {
    if (typeof body.rent_paid !== "boolean") {
      return { code: "payment_rent_boolean" };
    }

    update.rent_paid = body.rent_paid;
    update.rent_paid_at = body.rent_paid ? now : null;
  }

  if (hasOwn(body, "deposit_paid")) {
    if (typeof body.deposit_paid !== "boolean") {
      return { code: "payment_deposit_boolean" };
    }

    update.deposit_paid = body.deposit_paid;
    update.deposit_paid_at = body.deposit_paid ? now : null;
  }

  if (hasOwn(body, "payment_note")) {
    update.payment_note = optionalText(body.payment_note);
  }

  if (hasOwn(body, "rent_note")) {
    update.rent_note = optionalText(body.rent_note);
  }

  if (hasOwn(body, "deposit_note")) {
    update.deposit_note = optionalText(body.deposit_note);
  }

  if (Object.keys(update).length === 0) {
    return { code: "no_payment_fields" };
  }

  return { update };
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    return methodNotAllowed(req, res, "POST");
  }

  let body;

  try {
    body = await readJsonBody(req);
  } catch {
    return sendError(req, res, 400, "request_json_invalid");
  }

  const validation = buildPaymentUpdate(body);
  if (validation.code) {
    return sendError(req, res, 400, validation.code);
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
    console.error("admin booking payment error", error);
    return sendError(req, res, 500, "payment_failed");
  }
}
