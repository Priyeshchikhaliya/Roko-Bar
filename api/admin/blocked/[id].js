import { getQueryValue } from "../../_adminUtils.js";
import { requireAdmin } from "../../_auth.js";
import { methodNotAllowed, sendJson } from "../../_responses.js";
import { getSupabase } from "../../_supabase.js";

const BLOCKED_COLUMNS = "id, night, reason, created_at";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "DELETE") {
    return methodNotAllowed(res, "DELETE");
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
        return sendJson(res, 404, { error: "Blocked date not found." });
      }

      throw error;
    }

    return sendJson(res, 200, { blockedDate: data });
  } catch (error) {
    console.error("admin blocked delete error", error);
    return sendJson(res, 500, { error: "Could not remove blocked date." });
  }
}
