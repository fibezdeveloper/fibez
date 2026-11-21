-- Screenshots and short video clips attached to support-ticket messages.
-- Each element is {key, name, type, size}; the files themselves live in object storage under tickets/<user id>/.
ALTER TABLE public.ticket_messages
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;
