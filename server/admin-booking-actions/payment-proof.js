import { signedPaymentProofBucketUrl } from "../api/_contracts.js";
import {
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../api/_adminUtils.js";
import { requireAdmin } from "../api/_auth.js";
import { methodNotAllowed, sendError, sendJson } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

function downloadNameForPath(storagePath) {
  const extension = String(storagePath || "").split(".").pop() || "pdf";
  return `roko-bar-rent-proof.${extension}`;
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    return methodNotAllowed(req, res, "GET");
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
        return sendError(req, res, 404, "booking_not_found");
      }

      throw error;
    }

    if (!booking.rent_proof_path) {
      return sendError(req, res, 404, "payment_proof_not_found");
    }

    const signedUrl = await signedPaymentProofBucketUrl(
      supabase,
      booking.rent_proof_path,
      getQueryValue(req, "preview") === "1"
        ? undefined
        : downloadNameForPath(booking.rent_proof_path)
    );

    return sendJson(res, 200, { signedUrl, expiresIn: 300 });
  } catch (error) {
    console.error("admin payment proof file error", error);
    return sendError(req, res, 500, "payment_proof_load_failed");
  }
}
