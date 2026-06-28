import { getQueryValue } from "../api/_adminUtils.js";
import { requireAdmin } from "../api/_auth.js";
import { methodNotAllowed, sendError, sendJson } from "../api/_responses.js";
import { getSupabase } from "../api/_supabase.js";

const BLOCKED_COLUMNS = "id, night, reason, created_at";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "DELETE") {
    return methodNotAllowed(req, res, "DELETE");
  }

  try {
    const { data, error } = await getSupabase()
      .from("blocked_dates")
      .delete()
      .eq("id", getQueryValue(req, "id"))
      .select(BLOCKED_COLUMNS)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return sendError(req, res, 404, "blocked_date_not_found");
      }

      throw error;
    }

    return sendJson(res, 200, { blockedDate: data });
  } catch (error) {
    console.error("admin blocked delete error", error);
    return sendError(req, res, 500, "blocked_date_remove_failed");
  }
}
