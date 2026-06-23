import {
  CONTRACT_FILES,
  contractFilenameForBooking,
  redirectToSignedUrl,
  sanitizeBookingForGuest,
  sendLocalContractPdf,
  signedContractBucketUrl,
} from "../_contracts.js";
import { BOOKING_COLUMNS, getQueryValue, isNotFoundError } from "../_adminUtils.js";
import { methodNotAllowed, sendJson } from "../_responses.js";
import { getSupabase } from "../_supabase.js";

const STORAGE_FILE_NAMES = {
  signed: "roko-bar-signed-contract.pdf",
  final: "roko-bar-final-contract.pdf",
};

function canDownloadBlankFiles(status) {
  return status === "approved" || status === "signed" || status === "confirmed";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, "GET");
  }

  const token = getQueryValue(req, "token");
  const which = getQueryValue(req, "which");

  if (typeof token !== "string" || token.trim() === "") {
    return sendJson(res, 400, { error: "Missing booking token." });
  }

  if (!["contract", "rules", "signed", "final"].includes(which)) {
    return sendJson(res, 400, { error: "Invalid file requested." });
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
        return sendJson(res, 404, { error: "Booking not found." });
      }

      throw error;
    }

    const publicBooking = sanitizeBookingForGuest(booking);

    if (which === "contract" || which === "rules") {
      if (!canDownloadBlankFiles(publicBooking.status)) {
        return sendJson(res, publicBooking.status === "expired" ? 410 : 409, {
          error: "This file is not available for the current booking status.",
        });
      }

      const filename =
        which === "contract"
          ? contractFilenameForBooking(booking)
          : CONTRACT_FILES.rules;

      return sendLocalContractPdf(res, filename);
    }

    if (which === "signed") {
      if (!booking.signed_contract_path) {
        return sendJson(res, 404, { error: "Signed contract not found." });
      }

      const signedUrl = await signedContractBucketUrl(
        supabase,
        booking.signed_contract_path,
        STORAGE_FILE_NAMES.signed
      );

      return redirectToSignedUrl(res, signedUrl);
    }

    if (publicBooking.status !== "confirmed" || !booking.final_contract_path) {
      return sendJson(res, 404, { error: "Final contract not found." });
    }

    const signedUrl = await signedContractBucketUrl(
      supabase,
      booking.final_contract_path,
      STORAGE_FILE_NAMES.final
    );

    return redirectToSignedUrl(res, signedUrl);
  } catch (error) {
    console.error("booking file error", error);
    return sendJson(res, 500, { error: "Could not load file." });
  }
}
