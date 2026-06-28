import { requireAdmin } from "../api/_auth.js";
import { isNightTaken, validateBookableNight } from "../api/_bookingRules.js";
import { methodNotAllowed, readJsonBody, sendError, sendJson } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

const BLOCKED_COLUMNS = "id, night, reason, created_at";
const NIGHT_ERROR_CODES = {
  "night must be a valid YYYY-MM-DD date.": "night_date_invalid",
  "night must be in the future.": "night_future",
  "night must be within 365 days.": "night_within_365",
  "night must be a Friday or Saturday.": "night_friday_saturday",
};

function optionalText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

async function listBlockedDates(req, res) {
  try {
    const { data, error } = await getSupabase()
      .from("blocked_dates")
      .select(BLOCKED_COLUMNS)
      .order("night", { ascending: true });

    if (error) throw error;

    return sendJson(res, 200, { blocked: data });
  } catch (error) {
    console.error("admin blocked list error", error);
    return sendError(req, res, 500, "block_list_failed");
  }
}

async function createBlockedDate(req, res) {
  let body;

  try {
    body = await readJsonBody(req);
  } catch {
    return sendError(req, res, 400, "request_json_invalid");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return sendError(req, res, 400, "request_body_object");
  }

  const nightResult = validateBookableNight(body.night);
  if (nightResult.error) {
    return sendError(
      req,
      res,
      400,
      NIGHT_ERROR_CODES[nightResult.error] || "night_date_invalid"
    );
  }

  try {
    const supabase = getSupabase();

    if (await isNightTaken(supabase, nightResult.night)) {
      return sendError(req, res, 409, "conflict_taken");
    }

    const { data, error } = await supabase
      .from("blocked_dates")
      .insert({
        night: nightResult.night,
        reason: optionalText(body.reason),
      })
      .select(BLOCKED_COLUMNS)
      .single();

    if (error) {
      if (error.code === "23505") {
        return sendError(req, res, 409, "night_blocked");
      }

      throw error;
    }

    return sendJson(res, 201, { blockedDate: data });
  } catch (error) {
    console.error("admin blocked create error", error);
    return sendError(req, res, 500, "block_create_failed");
  }
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    return listBlockedDates(req, res);
  }

  if (req.method === "POST") {
    return createBlockedDate(req, res);
  }

  return methodNotAllowed(req, res, ["GET", "POST"]);
}
