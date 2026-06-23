import {
  createAdminSessionToken,
  verifyAdminPassword,
} from "../_auth.js";
import { methodNotAllowed, readJsonBody, sendJson } from "../_responses.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, "POST");
  }

  let body;

  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: "Request body must be valid JSON." });
  }

  try {
    const password =
      body && typeof body === "object" && !Array.isArray(body)
        ? body.password
        : undefined;

    if (!verifyAdminPassword(password)) {
      return sendJson(res, 401, { error: "Unauthorized." });
    }

    return sendJson(res, 200, createAdminSessionToken());
  } catch (error) {
    console.error("admin login error", error);
    return sendJson(res, 500, { error: "Admin login is not configured." });
  }
}
