-- Move orders / stock / coupons onto the real tables (they replace the JSON admin_state document).

-- Product ids are code-defined (catalog + generated V2Ray plan ids like
-- "dialog-zoom-router-basic-standard-3m"), so they cannot be foreign keys to products.
ALTER TABLE public.order_items     DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE public.inventory_items DROP CONSTRAINT IF EXISTS inventory_items_product_id_fkey;

-- Fields the app tracks that the original tables did not have.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS extra                 JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at          TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS received_confirmed_at TIMESTAMPTZ;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS product_title TEXT;

CREATE INDEX IF NOT EXISTS orders_user_id_idx        ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_email_idx          ON public.orders (lower(customer_email));
CREATE INDEX IF NOT EXISTS orders_created_idx        ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_idx     ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS inventory_available_idx   ON public.inventory_items (status, created_at);
