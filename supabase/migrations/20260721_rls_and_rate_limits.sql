-- Run once in the Supabase SQL Editor on existing projects before deploying the
-- rate-limited API. Fresh projects already get all of this from schema.sql.
--
-- 1) Enable Row Level Security on the app tables. The server uses the
--    service_role key (which bypasses RLS), so the app keeps working; this only
--    hardens against a leaked anon/public key.
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- 2) Server-side rate limiting store + atomic increment function.
CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY,
  count integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION rate_limit_hit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
RETURNS TABLE(allowed boolean, remaining integer, retry_after integer)
LANGUAGE plpgsql
AS $$
DECLARE
  v_now timestamptz := now();
  v_count integer;
  v_window_start timestamptz;
BEGIN
  INSERT INTO rate_limits AS rl (key, count, window_start)
    VALUES (p_key, 1, v_now)
  ON CONFLICT (key) DO UPDATE
    SET
      count = CASE
        WHEN rl.window_start < v_now - make_interval(secs => p_window_seconds)
        THEN 1
        ELSE rl.count + 1
      END,
      window_start = CASE
        WHEN rl.window_start < v_now - make_interval(secs => p_window_seconds)
        THEN v_now
        ELSE rl.window_start
      END
  RETURNING rl.count, rl.window_start INTO v_count, v_window_start;

  allowed := v_count <= p_max;
  remaining := greatest(p_max - v_count, 0);
  retry_after := CASE
    WHEN v_count <= p_max THEN 0
    ELSE greatest(
      ceil(extract(epoch FROM (v_window_start + make_interval(secs => p_window_seconds) - v_now)))::integer,
      1
    )
  END;
  RETURN NEXT;
END;
$$;
