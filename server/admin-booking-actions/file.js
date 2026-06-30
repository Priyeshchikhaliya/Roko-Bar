import {
  signedContractBucketUrl,
} from "../api/_contracts.js";
import {
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../api/_adminUtils.js";
import { requireAdmin } from "../api/_auth.js";
import { methodNotAllowed, sendError, sendJson } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

const DOWNLOAD_NAMES = {
  signed: "roko-bar-signed-contract.pdf",
  final: "roko-bar-final-contract.pdf",
};

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    return methodNotAllowed(req, res, "GET");
  }

  const which = getQueryValue(req, "which");
  const preview = getQueryValue(req, "preview") === "1";

  if (which !== "signed" && which !== "final") {
    return sendError(req, res, 400, "invalid_file_requested");
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

    const storagePath =
      which === "signed"
        ? booking.signed_contract_path
        : booking.final_contract_path;

    if (!storagePath) {
      return sendError(req, res, 404, "file_not_found");
    }

    const signedUrl = await signedContractBucketUrl(
      supabase,
      storagePath,
      preview ? undefined : DOWNLOAD_NAMES[which]
    );

    return sendJson(res, 200, { signedUrl, expiresIn: 300 });
  } catch (error) {
    console.error("admin booking file error", error);
    return sendError(req, res, 500, "file_load_failed");
  }
}
