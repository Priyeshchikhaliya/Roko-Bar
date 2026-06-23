import { signedPaymentProofBucketUrl } from "../../../_contracts.js";
import {
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../../../_adminUtils.js";
import { requireAdmin } from "../../../_auth.js";
import { methodNotAllowed, sendJson } from "../../../_responses.js";
import { getSupabase } from "../../../_supabase.js";

function downloadNameForPath(storagePath) {
  const extension = String(storagePath || "").split(".").pop() || "pdf";
  return `roko-bar-rent-proof.${extension}`;
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    return methodNotAllowed(res, "GET");
  }

  try {
    const supabase = getSupabase();
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(BOOKING_COLUMNS)
      .eq("id", getQueryValue(req, "id"))
      .single();

    if (error) {
      if (isNotFoundError(error)) {
        return sendJson(res, 404, { error: "Booking not found." });
      }

      throw error;
    }

    if (!booking.rent_proof_path) {
      return sendJson(res, 404, { error: "Payment proof not found." });
    }

    const signedUrl = await signedPaymentProofBucketUrl(
      supabase,
      booking.rent_proof_path,
      downloadNameForPath(booking.rent_proof_path)
    );

    return sendJson(res, 200, { signedUrl, expiresIn: 300 });
  } catch (error) {
    console.error("admin payment proof file error", error);
    return sendJson(res, 500, { error: "Could not load payment proof." });
  }
}
