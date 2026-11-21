-- Wallet, refunds, referrals, trial claims and panel-client tracking.
-- Money rules live IN THE DATABASE so no code path (or bug) can break them:
--   * wallet_ledger is append-only (UPDATE / DELETE / TRUNCATE are blocked by triggers)
--   * balances can never go negative (CHECK constraints + the wallet_apply() function)
--   * every ledger write carries a unique idempotency key, so a retry or double-click is a no-op
-- All tables have RLS enabled with NO policies: the restricted app role and the Neon Data API
-- roles can read/write nothing; only the server (owner connection) can.

-- ---------------------------------------------------------------- accounts + ledger
CREATE TABLE IF NOT EXISTS public.wallet_accounts (
  user_id     TEXT PRIMARY KEY,
  balance_lkr BIGINT NOT NULL DEFAULT 0 CHECK (balance_lkr >= 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet_ledger (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL,
  entry_type        TEXT NOT NULL CHECK (entry_type IN
                      ('TOPUP','PURCHASE','REFUND','REFERRAL_BONUS','ADJUSTMENT','REVERSAL')),
  amount_lkr        BIGINT NOT NULL CHECK (amount_lkr <> 0),
  balance_after_lkr BIGINT NOT NULL CHECK (balance_after_lkr >= 0),
  ref_type          TEXT,
  ref_id            TEXT,
  reason            TEXT,
  actor_id          TEXT,
  actor_email       TEXT,
  idempotency_key   TEXT NOT NULL UNIQUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT wallet_ledger_sign CHECK (
    (entry_type IN ('TOPUP','REFUND','REFERRAL_BONUS') AND amount_lkr > 0)
    OR (entry_type = 'PURCHASE' AND amount_lkr < 0)
    OR entry_type IN ('ADJUSTMENT','REVERSAL')
  )
);
CREATE INDEX IF NOT EXISTS wallet_ledger_user_created ON public.wallet_ledger (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS wallet_ledger_ref ON public.wallet_ledger (ref_type, ref_id);

CREATE OR REPLACE FUNCTION public.wallet_ledger_block_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'wallet_ledger is append-only';
END $$;

DROP TRIGGER IF EXISTS wallet_ledger_no_change ON public.wallet_ledger;
CREATE TRIGGER wallet_ledger_no_change BEFORE UPDATE OR DELETE ON public.wallet_ledger
  FOR EACH ROW EXECUTE FUNCTION public.wallet_ledger_block_change();
DROP TRIGGER IF EXISTS wallet_ledger_no_truncate ON public.wallet_ledger;
CREATE TRIGGER wallet_ledger_no_truncate BEFORE TRUNCATE ON public.wallet_ledger
  FOR EACH STATEMENT EXECUTE FUNCTION public.wallet_ledger_block_change();

-- The ONLY way money moves. Atomic: lock the account row, check, write the ledger, update the balance.
CREATE OR REPLACE FUNCTION public.wallet_apply(
  p_user_id TEXT, p_type TEXT, p_amount BIGINT,
  p_ref_type TEXT, p_ref_id TEXT, p_reason TEXT,
  p_actor_id TEXT, p_actor_email TEXT, p_idem TEXT
) RETURNS TABLE (ledger_id TEXT, balance_after BIGINT, replayed BOOLEAN)
LANGUAGE plpgsql AS $$
DECLARE
  v_balance BIGINT;
  v_new     BIGINT;
  v_id      TEXT;
  v_prev    RECORD;
BEGIN
  IF p_idem IS NULL OR length(p_idem) < 6 THEN
    RAISE EXCEPTION 'idempotency key required';
  END IF;

  -- Replay of a request we already applied: return the original result, change nothing.
  SELECT l.id, l.balance_after_lkr INTO v_prev FROM public.wallet_ledger l WHERE l.idempotency_key = p_idem;
  IF FOUND THEN
    RETURN QUERY SELECT v_prev.id, v_prev.balance_after_lkr, TRUE;
    RETURN;
  END IF;

  INSERT INTO public.wallet_accounts (user_id) VALUES (p_user_id) ON CONFLICT (user_id) DO NOTHING;
  SELECT a.balance_lkr INTO v_balance FROM public.wallet_accounts a WHERE a.user_id = p_user_id FOR UPDATE;

  -- Another request with the same key may have won the lock before us.
  SELECT l.id, l.balance_after_lkr INTO v_prev FROM public.wallet_ledger l WHERE l.idempotency_key = p_idem;
  IF FOUND THEN
    RETURN QUERY SELECT v_prev.id, v_prev.balance_after_lkr, TRUE;
    RETURN;
  END IF;

  v_new := v_balance + p_amount;
  IF v_new < 0 THEN
    RAISE EXCEPTION 'INSUFFICIENT_FUNDS' USING ERRCODE = 'P0001';
  END IF;

  v_id := 'wl_' || replace(gen_random_uuid()::text, '-', '');
  INSERT INTO public.wallet_ledger
    (id, user_id, entry_type, amount_lkr, balance_after_lkr, ref_type, ref_id, reason, actor_id, actor_email, idempotency_key)
  VALUES
    (v_id, p_user_id, p_type, p_amount, v_new, p_ref_type, p_ref_id, p_reason, p_actor_id, p_actor_email, p_idem);
  UPDATE public.wallet_accounts SET balance_lkr = v_new, updated_at = now() WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_id, v_new, FALSE;
END $$;

-- Reconciliation: every account's stored balance must equal the sum of its ledger rows.
CREATE OR REPLACE VIEW public.wallet_integrity AS
SELECT a.user_id,
       a.balance_lkr AS account_balance,
       COALESCE(SUM(l.amount_lkr), 0)::BIGINT AS ledger_sum,
       (a.balance_lkr = COALESCE(SUM(l.amount_lkr), 0)) AS ok
FROM public.wallet_accounts a
LEFT JOIN public.wallet_ledger l ON l.user_id = a.user_id
GROUP BY a.user_id, a.balance_lkr;

-- ---------------------------------------------------------------- top-ups (manual bank slips)
CREATE TABLE IF NOT EXISTS public.wallet_topups (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL,
  user_email     TEXT NOT NULL,
  amount_lkr     BIGINT NOT NULL CHECK (amount_lkr BETWEEN 250 AND 200000),
  bank_reference TEXT NOT NULL,
  slip_url       TEXT,
  slip_key       TEXT,
  slip_hash      TEXT,
  status         TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  reviewed_by    TEXT,
  review_note    TEXT,
  reviewed_at    TIMESTAMPTZ,
  ledger_id      TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- The same bank reference or the same slip image can only back ONE live top-up.
CREATE UNIQUE INDEX IF NOT EXISTS wallet_topups_ref_unique
  ON public.wallet_topups (lower(bank_reference)) WHERE status <> 'REJECTED';
CREATE UNIQUE INDEX IF NOT EXISTS wallet_topups_slip_unique
  ON public.wallet_topups (slip_hash) WHERE slip_hash IS NOT NULL AND status <> 'REJECTED';
CREATE INDEX IF NOT EXISTS wallet_topups_status ON public.wallet_topups (status, created_at DESC);
CREATE INDEX IF NOT EXISTS wallet_topups_user ON public.wallet_topups (user_id, created_at DESC);

-- ---------------------------------------------------------------- refund requests
CREATE TABLE IF NOT EXISTS public.refund_requests (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  user_email   TEXT NOT NULL,
  order_number TEXT NOT NULL,
  amount_lkr   BIGINT NOT NULL CHECK (amount_lkr > 0),
  reason_code  TEXT NOT NULL CHECK (reason_code IN
                 ('NOT_WORKING','WRONG_ITEM','DUPLICATE_CHARGE','SERVICE_OUTAGE','OTHER_VALID')),
  details      TEXT,
  evidence     JSONB NOT NULL DEFAULT '{}'::jsonb,
  status       TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  reviewed_by  TEXT,
  review_note  TEXT,
  reviewed_at  TIMESTAMPTZ,
  ledger_id    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- One live refund per order, ever.
CREATE UNIQUE INDEX IF NOT EXISTS refund_one_per_order
  ON public.refund_requests (order_number) WHERE status IN ('PENDING','APPROVED');
CREATE INDEX IF NOT EXISTS refund_status ON public.refund_requests (status, created_at DESC);

-- ---------------------------------------------------------------- referrals (rewards go to the wallet)
CREATE TABLE IF NOT EXISTS public.referral_codes (
  user_id    TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  code       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  order_number     TEXT PRIMARY KEY,           -- a referred order can reward only once
  referrer_user_id TEXT NOT NULL,
  buyer_email      TEXT NOT NULL,
  amount_lkr       BIGINT NOT NULL CHECK (amount_lkr > 0),
  ledger_id        TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------- free-trial claims (DB enforces uniqueness)
CREATE TABLE IF NOT EXISTS public.trial_claims (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL UNIQUE,
  email           TEXT NOT NULL,
  canonical_email TEXT NOT NULL UNIQUE,
  device_id       TEXT,
  fp_hash         TEXT,
  ip              TEXT,
  ua_hash         TEXT,
  order_number    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS trial_claims_device_unique ON public.trial_claims (device_id) WHERE device_id IS NOT NULL AND device_id <> '';
CREATE UNIQUE INDEX IF NOT EXISTS trial_claims_fp_unique ON public.trial_claims (fp_hash) WHERE fp_hash IS NOT NULL AND fp_hash <> '';
CREATE INDEX IF NOT EXISTS trial_claims_ip ON public.trial_claims (ip, created_at DESC);

-- ---------------------------------------------------------------- panel clients (so orders can be revoked / renewed)
CREATE TABLE IF NOT EXISTS public.panel_clients (
  id           TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  item_id      TEXT,
  user_email   TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,           -- 3x-ui client email (its unique key)
  uuid         TEXT NOT NULL,
  inbound_id   INTEGER,
  expires_at   TIMESTAMPTZ,
  status       TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','REVOKED')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS panel_clients_order ON public.panel_clients (order_number);
CREATE INDEX IF NOT EXISTS panel_clients_user ON public.panel_clients (lower(user_email));
CREATE INDEX IF NOT EXISTS panel_clients_uuid ON public.panel_clients (uuid);

-- ---------------------------------------------------------------- lock everything down
ALTER TABLE public.wallet_accounts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_ledger    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_topups    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_claims     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panel_clients    ENABLE ROW LEVEL SECURITY;
