import {
  readMultipartPaymentProof,
  sanitizeBookingForGuest,
  sendSpecificUploadError,
  sendUploadValidationError,
  uploadPaymentProofToBucket,
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

    if (booking.status !== "signed") {
      return sendJson(res, 409, {
        error: "Payment proof can only be uploaded after the signed contract is uploaded and before confirmation.",
      });
    }

    if (booking.payment_method !== "online") {
      return sendJson(res, 409, {
        error: "Choose online payment before uploading proof.",
      });
    }

    const validation = await readMultipartPaymentProof(req);
    if (validation.error) {
      return sendUploadValidationError(res, validation);
    }

    const storagePath = `rent/${booking.id}.${validation.file.extension}`;
    await uploadPaymentProofToBucket(
      supabase,
      storagePath,
      validation.file.buffer,
      validation.file.contentType
    );

    const { data, error } = await supabase
      .from("bookings")
      .update({ rent_proof_path: storagePath })
      .eq("id", booking.id)
      .select(BOOKING_COLUMNS)
      .single();

    if (error) throw error;

    return sendJson(res, 200, { booking: sanitizeBookingForGuest(data) });
  } catch (error) {
    console.error("booking payment proof error", error);
    return sendSpecificUploadError(res, error, "payment proof upload failed");
  }
}
