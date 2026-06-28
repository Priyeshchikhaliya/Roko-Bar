import {
  addBookingDerivedFields,
  BOOKING_COLUMNS,
  getQueryValue,
  isNotFoundError,
} from "../../../_adminUtils.js";
import { requireAdmin } from "../../../_auth.js";
import { sendTutorIntroEmailWithStatus } from "../../../_email.js";
import {
  methodNotAllowed,
  readJsonBody,
  sendError,
  sendJson,
} from "../../../_responses.js";
import { getSupabase } from "../../../_supabase.js";
import { getTutorByName, TutorConfigError } from "../../../_tutors.js";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    return methodNotAllowed(req, res, "POST");
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendError(req, res, 400, "request_json_invalid");
  }

  let tutor;
  try {
    tutor = getTutorByName(body?.tutor);
  } catch (error) {
    if (error instanceof TutorConfigError) {
      return sendError(req, res, 503, error.code);
    }
    throw error;
  }

  if (!tutor) {
    return sendError(req, res, 400, "tutor_invalid");
  }

  try {
    const { data, error } = await getSupabase()
      .from("bookings")
      .update({ assigned_tutor: tutor.name })
      .eq("id", getQueryValue(req, "id"))
      .select(BOOKING_COLUMNS)
      .single();

    if (error) {
      if (isNotFoundError(error)) {
        return sendError(req, res, 404, "booking_not_found");
      }
      throw error;
    }

    const email = await sendTutorIntroEmailWithStatus(data, tutor, (emailError) => {
      console.error("tutor introduction email error", emailError);
    });

    return sendJson(res, 200, {
      booking: addBookingDerivedFields(data),
      email,
    });
  } catch (error) {
    console.error("admin booking tutor assignment error", error);
    return sendError(req, res, 500, "tutor_assign_failed");
  }
}
