-- Telegram customer bot: link a Fibez account to a Telegram chat so the bot can send order, trial,
-- ticket and expiry notices. All tables have RLS enabled with NO policies: only the server can touch them.

-- One Telegram chat per account (and one account per chat).
CREATE TABLE IF NOT EXISTS public.telegram_links (
  user_id     TEXT        PRIMARY KEY,
  user_email  TEXT        NOT NULL,
  chat_id     BIGINT      NOT NULL UNIQUE,
  tg_username TEXT,
  notify      BOOLEAN     NOT NULL DEFAULT TRUE,
  linked_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS telegram_links_email_idx ON public.telegram_links (lower(user_email));

-- One-time deep-link codes (https://t.me/<bot>?start=<code>). Only a hash is stored, valid ~15 minutes.
CREATE TABLE IF NOT EXISTS public.telegram_link_tokens (
  token_hash TEXT        PRIMARY KEY,
  user_id    TEXT        NOT NULL,
  user_email TEXT        NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS telegram_link_tokens_user_idx ON public.telegram_link_tokens (user_id);

-- Reminder de-duplication: one row per reminder already sent (e.g. "exp3:<uuid>:<expiry ms>").
CREATE TABLE IF NOT EXISTS public.telegram_reminders (
  key     TEXT        PRIMARY KEY,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_links       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_link_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_reminders   ENABLE ROW LEVEL SECURITY;
