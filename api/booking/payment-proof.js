import { methodNotAllowed, sendError } from "../_responses.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(req, res, "POST");
  }

  return sendError(req, res, 410, "use_booking_submit");
}
