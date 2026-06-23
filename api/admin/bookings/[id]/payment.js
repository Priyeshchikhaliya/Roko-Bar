import {
  addBookingDerivedFields,
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../../../_adminUtils.js";
import { requireAdmin } from "../../../_auth.js";
import { methodNotAllowed, readJsonBody, sendJson } from "../../../_responses.js";
import { getSupabase } from "../../../_supabase.js";

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
    return { error: "Request body must be an object." };
  }

  const now = new Date().toISOString();
  const update = {};

  if (hasOwn(body, "rent_paid")) {
    if (typeof body.rent_paid !== "boolean") {
      return { error: "rent_paid must be a boolean." };
    }

    update.rent_paid = body.rent_paid;
    update.rent_paid_at = body.rent_paid ? now : null;
  }

  if (hasOwn(body, "deposit_paid")) {
    if (typeof body.deposit_paid !== "boolean") {
      return { error: "deposit_paid must be a boolean." };
    }

    update.deposit_paid = body.deposit_paid;
    update.deposit_paid_at = body.deposit_paid ? now : null;
  }

  if (hasOwn(body, "payment_note")) {
    update.payment_note = optionalText(body.payment_note);
  }

  if (Object.keys(update).length === 0) {
    return { error: "No payment fields were provided." };
  }

  return { update };
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    return methodNotAllowed(res, "POST");
  }

  let body;

  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: "Request body must be valid JSON." });
  }

  const validation = buildPaymentUpdate(body);
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
    console.error("admin booking payment error", error);
    return sendJson(res, 500, { error: "Could not update payment." });
  }
}
