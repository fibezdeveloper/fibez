-- Daily usage history for V2Ray lines. 3x-ui only keeps CUMULATIVE traffic per client, so we store the
-- latest cumulative reading per client per day (Asia/Colombo) and derive daily usage as the difference.
CREATE TABLE IF NOT EXISTS public.usage_snapshots (
  email      TEXT        NOT NULL,
  day        DATE        NOT NULL,
  up_bytes   BIGINT      NOT NULL DEFAULT 0,
  down_bytes BIGINT      NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (email, day)
);
CREATE INDEX IF NOT EXISTS usage_snapshots_day_idx ON public.usage_snapshots (day);
ALTER TABLE public.usage_snapshots ENABLE ROW LEVEL SECURITY;
