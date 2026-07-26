import {
  createAdminSessionToken,
  verifyAdminPassword,
} from "../../server/api/_auth.js";
import { enforceRateLimit } from "../../server/api/_rateLimit.js";
import { methodNotAllowed, readJsonBody, sendError, sendJson } from "../../server/api/_responses.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(req, res, "POST");
  }

  // Throttle password guessing: this shared password is the only gate to all
  // guest PII, contracts, and payment proofs.
  if (!(await enforceRateLimit(req, res, { scope: "admin-login", max: 10, windowSeconds: 300 }))) {
    return;
  }

  let body;

  try {
    body = await readJsonBody(req);
  } catch {
    return sendError(req, res, 400, "request_json_invalid");
  }

  try {
    const password =
      body && typeof body === "object" && !Array.isArray(body)
        ? body.password
        : undefined;

    if (!verifyAdminPassword(password)) {
      return sendError(req, res, 401, "unauthorized");
    }

    return sendJson(res, 200, createAdminSessionToken());
  } catch (error) {
    console.error("admin login error", error);
    return sendError(req, res, 500, "admin_login_config");
  }
}
