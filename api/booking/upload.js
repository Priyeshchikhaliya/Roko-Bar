import {
  readMultipartPdf,
  sanitizeBookingForGuest,
  sendUploadValidationError,
  uploadPdfToContractBucket,
} from "../_contracts.js";
import { BOOKING_COLUMNS, getQueryValue, isNotFoundError } from "../_adminUtils.js";
import { methodNotAllowed, sendJson } from "../_responses.js";
import { getSupabase } from "../_supabase.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, "POST");
  }

  const token = getQueryValue(req, "token");

  if (typeof token !== "string" || token.trim() === "") {
    return sendJson(res, 400, { error: "Missing booking token." });
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

    const publicBooking = sanitizeBookingForGuest(booking);

    if (publicBooking.status === "expired") {
      return sendJson(res, 409, {
        error: "This approval deadline has passed.",
      });
    }

    if (booking.status !== "approved" && booking.status !== "signed") {
      return sendJson(res, 409, {
        error: "This booking is not ready for signed contract upload.",
      });
    }

    const validation = await readMultipartPdf(req);
    if (validation.error) {
      return sendUploadValidationError(res, validation);
    }

    const storagePath = `signed/${booking.id}.pdf`;
    await uploadPdfToContractBucket(supabase, storagePath, validation.file.buffer);

    const { data, error } = await supabase
      .from("bookings")
      .update({
        signed_contract_path: storagePath,
        status: "signed",
      })
      .eq("id", booking.id)
      .select(BOOKING_COLUMNS)
      .single();

    if (error) throw error;

    return sendJson(res, 200, { booking: sanitizeBookingForGuest(data) });
  } catch (error) {
    console.error("booking upload error", error);
    return sendJson(res, 500, { error: "Could not upload signed contract." });
  }
}
