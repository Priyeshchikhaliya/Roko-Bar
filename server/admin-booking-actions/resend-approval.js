import {
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../api/_adminUtils.js";
import { requireAdmin } from "../api/_auth.js";
import { sendApprovalEmailWithStatus } from "../api/_email.js";
import { methodNotAllowed, sendError, sendJson } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    return methodNotAllowed(req, res, "POST");
  }

  try {
    const id = getQueryValue(req, "id");
    const { data: booking, error: loadError } = await getSupabase()
      .from("bookings")
      .select(BOOKING_COLUMNS)
      .eq("id", id)
      .single();

    if (loadError) {
      if (isNotFoundError(loadError)) {
        return sendError(req, res, 404, "booking_not_found");
      }

      throw loadError;
    }

    if (booking.status !== "approved") {
      return sendError(req, res, 409, "not_approved_resend");
    }

    const email = await sendApprovalEmailWithStatus(booking, (emailError) => {
      console.error("booking approval resend email error", emailError);
    });

    return sendJson(res, 200, { email });
  } catch (error) {
    console.error("admin booking approval resend error", error);
    return sendError(req, res, 500, "resend_approval_failed");
  }
}
