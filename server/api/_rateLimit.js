import { sendError } from "./_responses.js";
import { getSupabase } from "./_supabase.js";

let warnedUnavailable = false;

// Vercel puts the real client IP first in x-forwarded-for. Fall back through the
// other proxy headers, then the socket, then a shared bucket so a missing IP
// never silently disables limiting for everyone at once.
export function getClientIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"];
  const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (typeof forwardedValue === "string" && forwardedValue.trim()) {
    return forwardedValue.split(",")[0].trim();
  }

  const realIp = req.headers?.["x-real-ip"];
  const realIpValue = Array.isArray(realIp) ? realIp[0] : realIp;
  if (typeof realIpValue === "string" && realIpValue.trim()) {
    return realIpValue.trim();
  }

  return req.socket?.remoteAddress || "unknown";
}

// Atomic fixed-window check backed by the rate_limits table. Fails open (allows
// the request) if the limiter store is unavailable, so a limiter outage never
// blocks real bookings; the failure is logged once per process.
export async function checkRateLimit({ key, max, windowSeconds }) {
  try {
    const { data, error } = await getSupabase().rpc("rate_limit_hit", {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    });

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return { allowed: true, retryAfter: 0 };

    return {
      allowed: Boolean(row.allowed),
      retryAfter: Number(row.retry_after) || 0,
    };
  } catch (error) {
    if (!warnedUnavailable) {
      console.warn(
        "rate limiter unavailable, failing open (run the rate_limits migration?)",
        error?.message || error
      );
      warnedUnavailable = true;
    }

    return { allowed: true, retryAfter: 0 };
  }
}

// Enforces a per-IP limit for the given scope. Returns true when the request may
// proceed. When the limit is exceeded it sends a localized 429 (with Retry-After)
// and returns false, so callers do `if (!(await enforceRateLimit(...))) return;`.
export async function enforceRateLimit(req, res, { scope, max, windowSeconds }) {
  const key = `${scope}:${getClientIp(req)}`;
  const { allowed, retryAfter } = await checkRateLimit({ key, max, windowSeconds });

  if (allowed) return true;

  res.setHeader("Retry-After", String(Math.max(retryAfter, 1)));
  sendError(req, res, 429, "rate_limited");
  return false;
}
