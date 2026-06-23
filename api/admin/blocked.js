import { requireAdmin } from "../_auth.js";
import { isNightTaken, validateBookableNight } from "../_bookingRules.js";
import { methodNotAllowed, readJsonBody, sendJson } from "../_responses.js";
import { getSupabase } from "../_supabase.js";

const BLOCKED_COLUMNS = "id, night, reason, created_at";

function optionalText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

async function listBlockedDates(res) {
  try {
    const { data, error } = await getSupabase()
      .from("blocked_dates")
      .select(BLOCKED_COLUMNS)
      .order("night", { ascending: true });

    if (error) throw error;

    return sendJson(res, 200, { blocked: data });
  } catch (error) {
    console.error("admin blocked list error", error);
    return sendJson(res, 500, { error: "Could not load blocked dates." });
  }
}

async function createBlockedDate(req, res) {
  let body;

  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: "Request body must be valid JSON." });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return sendJson(res, 400, { error: "Request body must be an object." });
  }

  const nightResult = validateBookableNight(body.night);
  if (nightResult.error) {
    return sendJson(res, 400, { error: nightResult.error });
  }

  try {
    const supabase = getSupabase();

    if (await isNightTaken(supabase, nightResult.night)) {
      return sendJson(res, 409, { error: "This night is already taken." });
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
        return sendJson(res, 409, { error: "This night is already blocked." });
      }

      throw error;
    }

    return sendJson(res, 201, { blockedDate: data });
  } catch (error) {
    console.error("admin blocked create error", error);
    return sendJson(res, 500, { error: "Could not block date." });
  }
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    return listBlockedDates(res);
  }

  if (req.method === "POST") {
    return createBlockedDate(req, res);
  }

  return methodNotAllowed(res, ["GET", "POST"]);
}
