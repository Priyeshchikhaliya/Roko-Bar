import {
  CONTRACT_FILES,
  contractFilenameForBooking,
  redirectToSignedUrl,
  sanitizeBookingForGuest,
  sendLocalContractPdf,
  signedContractBucketUrl,
} from "../api/_contracts.js";
import { BOOKING_COLUMNS, getQueryValue, isNotFoundError } from "../api/_adminUtils.js";
import { methodNotAllowed, sendError } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

const STORAGE_FILE_NAMES = {
  signed: "roko-bar-signed-contract.pdf",
  final: "roko-bar-final-contract.pdf",
};

function canDownloadBlankFiles(status) {
  return status === "approved" || status === "signed" || status === "confirmed";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return methodNotAllowed(req, res, "GET");
  }

  const token = getQueryValue(req, "token");
  const which = getQueryValue(req, "which");

  if (typeof token !== "string" || token.trim() === "") {
    return sendError(req, res, 400, "missing_booking_token");
  }

  if (!["contract", "rules", "signed", "final"].includes(which)) {
    return sendError(req, res, 400, "invalid_file_requested");
  }

  try {
    const supabase = getSupabase();
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(BOOKING_COLUMNS)
      .eq("access_token", token.trim())
      .single();

    if (error) {
      if (isNotFoundError(error)) {
        return sendError(req, res, 404, "booking_not_found");
      }

      throw error;
    }

    const publicBooking = sanitizeBookingForGuest(booking);

    if (which === "contract" || which === "rules") {
      if (!canDownloadBlankFiles(publicBooking.status)) {
        return sendError(
          req,
          res,
          publicBooking.status === "expired" ? 410 : 409,
          "file_not_available"
        );
      }

      const filename =
        which === "contract"
          ? contractFilenameForBooking(booking)
          : CONTRACT_FILES.rules;

      return sendLocalContractPdf(res, filename);
    }

    if (which === "signed") {
      if (!booking.signed_contract_path) {
        return sendError(req, res, 404, "signed_contract_not_found");
      }

      const signedUrl = await signedContractBucketUrl(
        supabase,
        booking.signed_contract_path,
        STORAGE_FILE_NAMES.signed
      );

      return redirectToSignedUrl(res, signedUrl);
    }

    if (publicBooking.status !== "confirmed" || !booking.final_contract_path) {
      return sendError(req, res, 404, "final_contract_not_found");
    }

    const signedUrl = await signedContractBucketUrl(
      supabase,
      booking.final_contract_path,
      STORAGE_FILE_NAMES.final
    );

    return redirectToSignedUrl(res, signedUrl);
  } catch (error) {
    console.error("booking file error", error);
    return sendError(req, res, 500, "file_load_failed");
  }
}
