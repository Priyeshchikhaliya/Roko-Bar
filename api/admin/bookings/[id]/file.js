import {
  signedContractBucketUrl,
} from "../../../_contracts.js";
import {
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../../../_adminUtils.js";
import { requireAdmin } from "../../../_auth.js";
import { methodNotAllowed, sendJson } from "../../../_responses.js";
import { getSupabase } from "../../../_supabase.js";

const DOWNLOAD_NAMES = {
  signed: "roko-bar-signed-contract.pdf",
  final: "roko-bar-final-contract.pdf",
};

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    return methodNotAllowed(res, "GET");
  }

  const which = getQueryValue(req, "which");

  if (which !== "signed" && which !== "final") {
    return sendJson(res, 400, { error: "Invalid file requested." });
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

    const storagePath =
      which === "signed"
        ? booking.signed_contract_path
        : booking.final_contract_path;

    if (!storagePath) {
      return sendJson(res, 404, { error: "File not found." });
    }

    const signedUrl = await signedContractBucketUrl(
      supabase,
      storagePath,
      DOWNLOAD_NAMES[which]
    );

    return sendJson(res, 200, { signedUrl, expiresIn: 300 });
  } catch (error) {
    console.error("admin booking file error", error);
    return sendJson(res, 500, { error: "Could not load file." });
  }
}
