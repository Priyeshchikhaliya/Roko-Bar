import { requireAdmin } from "../../server/api/_auth.js";
import { methodNotAllowed, sendError, sendJson } from "../../server/api/_responses.js";
import { getTutors, TutorConfigError } from "../../server/api/_tutors.js";

export default function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    return methodNotAllowed(req, res, "GET");
  }

  try {
    return sendJson(res, 200, {
      tutors: getTutors().map((tutor) => tutor.name),
    });
  } catch (error) {
    if (error instanceof TutorConfigError) {
      return sendError(req, res, 503, error.code);
    }

    console.error("admin tutors config error", error);
    return sendError(req, res, 500, "tutors_load_failed");
  }
}
