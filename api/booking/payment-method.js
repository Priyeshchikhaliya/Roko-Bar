import { sanitizeBookingForGuest } from "../_contracts.js";
import { BOOKING_COLUMNS, getQueryValue, isNotFoundError } from "../_adminUtils.js";
import { normalizePaymentMethod } from "../_payments.js";
import { methodNotAllowed, readJsonBody, sendJson } from "../_responses.js";
import { getSupabase } from "../_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, "POST");
  }

  const token = getQueryValue(req, "token");

  if (typeof token !== "string" || token.trim() === "") {
    return sendJson(res, 400, { error: "Missing booking token." });
  }

  let body;

  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: "Request body must be valid JSON." });
  }

  const paymentMethod = normalizePaymentMethod(body?.payment_method, {
    nullable: false,
  });

  if (!paymentMethod) {
    return sendJson(res, 400, { error: "payment_method must be cash or online." });
  }

  try {
    const supabase = getSupabase();
    const { data: booking, error: loadError } = await supabase
      .from("bookings")
      .select(BOOKING_COLUMNS)
      .eq("access_token", token.trim())
      .single();

    if (loadError) {
      if (isNotFoundError(loadError)) {
        return sendJson(res, 404, { error: "Booking not found." });
      }

      throw loadError;
    }

    if (booking.status !== "signed") {
      return sendJson(res, 409, {
        error: "Payment method can only be changed after the signed contract is uploaded and before confirmation.",
      });
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({ payment_method: paymentMethod })
      .eq("id", booking.id)
      .select(BOOKING_COLUMNS)
      .single();

    if (error) throw error;

    return sendJson(res, 200, { booking: sanitizeBookingForGuest(data) });
  } catch (error) {
    console.error("booking payment method error", error);
    return sendJson(res, 500, { error: "Could not update payment method." });
  }
}
