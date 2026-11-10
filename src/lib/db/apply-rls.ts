import { Pool } from '@neondatabase/serverless';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function resolveEnvValue(key: string): string {
  if (process.env[key]) return process.env[key]!;
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const lines = fs.readFileSync(envLocalPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith(`${key}=`)) {
        return trimmed
          .slice(key.length + 1)
          .trim()
          .replace(/^["']|["']$/g, '');
      }
    }
  }
  return '';
}

function upsertEnvLocal(key: string, value: string): boolean {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envLocalPath)) return false;

  const content = fs.readFileSync(envLocalPath, 'utf-8');
  const lines = content.split('\n');
  const existingIdx = lines.findIndex((l) => l.trim().startsWith(`${key}=`));
  const serialized = `${key}="${value}"`;

  if (existingIdx >= 0) {
    lines[existingIdx] = serialized;
  } else {
    if (lines.length > 0 && lines[lines.length - 1] !== '') {
      lines.push('');
    }
    lines.push(serialized);
  }

  fs.writeFileSync(envLocalPath, lines.join('\n'), 'utf-8');
  return true;
}

export async function applyPostgresRls() {
  const databaseUrl = resolveEnvValue('DATABASE_URL_UNPOOLED') || resolveEnvValue('DATABASE_URL');
  if (!databaseUrl) {
    throw new Error('DATABASE_URL or DATABASE_URL_UNPOOLED is required');
  }

  const pooledDatabaseUrl = resolveEnvValue('DATABASE_URL') || databaseUrl;
  const existingAuthUrl = resolveEnvValue('DATABASE_AUTHENTICATED_URL');

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Ensure restricted non-bypass application role `fibez_app` exists
    const roleRes = await client.query(
      `SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname = 'fibez_app'`
    );

    if (roleRes.rows.length === 0) {
      const generatedPassword = crypto.randomBytes(24).toString('hex');
      await client.query(
        `CREATE ROLE fibez_app WITH LOGIN PASSWORD '${generatedPassword}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`
      );

      if (!existingAuthUrl) {
        const authConnUrl = new URL(pooledDatabaseUrl);
        authConnUrl.username = 'fibez_app';
        authConnUrl.password = generatedPassword;
        upsertEnvLocal('DATABASE_AUTHENTICATED_URL', authConnUrl.toString());
        console.log('✓ Created role fibez_app (NOBYPASSRLS) and saved DATABASE_AUTHENTICATED_URL in .env.local');
      } else {
        console.log('✓ Created role fibez_app (NOBYPASSRLS)');
      }
    } else {
      const existingRole = roleRes.rows[0];
      if (existingRole.rolbypassrls) {
        await client.query(`ALTER ROLE fibez_app WITH NOBYPASSRLS`);
      }
      console.log('✓ Verified role fibez_app exists (rolbypassrls = false)');
    }

    await client.query(`GRANT fibez_app TO neondb_owner WITH SET TRUE`);

    // 2. Auth session helper schema + STABLE functions
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS app_auth;
      REVOKE ALL ON SCHEMA app_auth FROM PUBLIC;
      GRANT USAGE ON SCHEMA app_auth TO fibez_app;

      CREATE OR REPLACE FUNCTION app_auth.current_user_id()
      RETURNS text
      LANGUAGE sql
      STABLE
      AS $$
        SELECT COALESCE(
          NULLIF(current_setting('app.user_id', true), ''),
          NULLIF((NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'), '')
        );
      $$;

      CREATE OR REPLACE FUNCTION app_auth.current_user_email()
      RETURNS text
      LANGUAGE sql
      STABLE
      AS $$
        SELECT LOWER(COALESCE(
          NULLIF(current_setting('app.user_email', true), ''),
          NULLIF((NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email'), '')
        ));
      $$;

      CREATE OR REPLACE FUNCTION app_auth.current_user_role()
      RETURNS text
      LANGUAGE sql
      STABLE
      AS $$
        SELECT COALESCE(
          NULLIF(current_setting('app.user_role', true), ''),
          'anonymous'
        );
      $$;

      CREATE OR REPLACE FUNCTION app_auth.is_staff()
      RETURNS boolean
      LANGUAGE sql
      STABLE
      AS $$
        SELECT app_auth.current_user_role() IN ('admin', 'owner');
      $$;

      CREATE OR REPLACE FUNCTION app_auth.is_owner()
      RETURNS boolean
      LANGUAGE sql
      STABLE
      AS $$
        SELECT app_auth.current_user_role() = 'owner';
      $$;

      REVOKE ALL ON ALL FUNCTIONS IN SCHEMA app_auth FROM PUBLIC;
      GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app_auth TO fibez_app;
    `);
    console.log('✓ Created app_auth helper functions');

    // 3. Performance indexes for RLS predicates
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_customer_email_lower ON public.orders (LOWER(customer_email));
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_items_product_status ON public.inventory_items (product_id, status);
      CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets (user_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_customer_email_lower ON public.tickets (LOWER(customer_email));
      CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages (ticket_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON public.reviews (product_id, status);
    `);

    // 4. Controlled SECURITY DEFINER functions for bounded operations
    await client.query(`
      CREATE OR REPLACE FUNCTION public.redeem_promo_code(p_code text, p_subtotal_lkr integer)
      RETURNS TABLE (
        id text,
        code text,
        discount_percent integer,
        discount_fixed_lkr integer,
        min_spend_lkr integer
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $$
      BEGIN
        RETURN QUERY
        UPDATE public.promo_codes pc
        SET times_used = COALESCE(pc.times_used, 0) + 1
        WHERE UPPER(pc.code) = UPPER(TRIM(p_code))
          AND pc.is_active = TRUE
          AND (pc.expires_at IS NULL OR pc.expires_at > NOW())
          AND COALESCE(pc.times_used, 0) < COALESCE(pc.max_uses, 1000)
          AND p_subtotal_lkr >= COALESCE(pc.min_spend_lkr, 0)
        RETURNING pc.id, pc.code, pc.discount_percent, pc.discount_fixed_lkr, pc.min_spend_lkr;
      END;
      $$;

      CREATE OR REPLACE FUNCTION public.allocate_order_item_stock(
        p_product_id text,
        p_order_id text,
        p_user_id text,
        p_user_email text,
        p_qty integer
      )
      RETURNS TABLE (
        allocated boolean,
        key_payload text,
        credential_user text,
        credential_pass text,
        stock_type text
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $$
      DECLARE
        v_inv public.inventory_items%ROWTYPE;
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM public.orders o WHERE o.id = p_order_id) THEN
          RAISE EXCEPTION 'Invalid order reference during inventory allocation';
        END IF;

        SELECT *
        INTO v_inv
        FROM public.inventory_items ii
        WHERE ii.product_id = p_product_id
          AND ii.status = 'AVAILABLE'
        ORDER BY ii.created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1;

        UPDATE public.products
        SET stock_count = GREATEST(0, stock_count - GREATEST(1, COALESCE(p_qty, 1))),
            updated_at = NOW()
        WHERE id = p_product_id;

        IF FOUND AND v_inv.id IS NOT NULL THEN
          UPDATE public.inventory_items
          SET status = 'DISPENSED',
              order_id = p_order_id,
              assigned_user_id = NULLIF(p_user_id, ''),
              assigned_user_email = NULLIF(p_user_email, ''),
              dispensed_at = NOW()
          WHERE id = v_inv.id;

          RETURN QUERY SELECT
            TRUE,
            v_inv.key_payload,
            v_inv.credential_user,
            v_inv.credential_pass,
            v_inv.stock_type;
          RETURN;
        END IF;

        RETURN QUERY SELECT
          FALSE,
          NULL::text,
          NULL::text,
          NULL::text,
          NULL::text;
      END;
      $$;

      CREATE OR REPLACE FUNCTION public.increment_review_helpful(p_review_id text)
      RETURNS boolean
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $$
      BEGIN
        UPDATE public.reviews
        SET helpful_count = COALESCE(helpful_count, 0) + 1
        WHERE id = p_review_id AND status = 'APPROVED';
        RETURN FOUND;
      END;
      $$;

      CREATE OR REPLACE FUNCTION public.check_verified_purchase(
        p_product_id text,
        p_email text,
        p_user_id text
      )
      RETURNS boolean
      LANGUAGE sql
      STABLE
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $$
        SELECT EXISTS (
          SELECT 1
          FROM public.orders o
          JOIN public.order_items oi ON oi.order_id = o.id
          WHERE oi.product_id = p_product_id
            AND o.payment_status = 'VERIFIED'
            AND (
              (NULLIF(p_user_id, '') IS NOT NULL AND o.user_id = p_user_id)
              OR (NULLIF(p_email, '') IS NOT NULL AND LOWER(o.customer_email) = LOWER(p_email))
            )
        );
      $$;

      REVOKE ALL ON FUNCTION public.redeem_promo_code(text, integer) FROM PUBLIC;
      GRANT EXECUTE ON FUNCTION public.redeem_promo_code(text, integer) TO fibez_app;

      REVOKE ALL ON FUNCTION public.allocate_order_item_stock(text, text, text, text, integer) FROM PUBLIC;
      GRANT EXECUTE ON FUNCTION public.allocate_order_item_stock(text, text, text, text, integer) TO fibez_app;

      REVOKE ALL ON FUNCTION public.increment_review_helpful(text) FROM PUBLIC;
      GRANT EXECUTE ON FUNCTION public.increment_review_helpful(text) TO fibez_app;

      REVOKE ALL ON FUNCTION public.check_verified_purchase(text, text, text) FROM PUBLIC;
      GRANT EXECUTE ON FUNCTION public.check_verified_purchase(text, text, text) TO fibez_app;
    `);
    console.log('✓ Created bounded SECURITY DEFINER helpers');

    // 5. Tighten table privileges
    await client.query(`
      REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
      REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
      GRANT USAGE ON SCHEMA public TO fibez_app;

      GRANT SELECT, INSERT, UPDATE, DELETE ON
        public.categories,
        public.products,
        public.product_variants,
        public.inventory_items,
        public.orders,
        public.order_items,
        public.promo_codes,
        public.store_settings,
        public.servers,
        public.tickets,
        public.ticket_messages,
        public.reviews
      TO fibez_app;

      GRANT SELECT, INSERT ON public.audit_logs TO fibez_app;

      REVOKE ALL ON
        public."user",
        public.users,
        public.session,
        public.account,
        public.verification
      FROM PUBLIC, fibez_app;
    `);

    // 6. Enable RLS & define policies across ALL 18 public tables
    const allPublicTables = [
      'categories',
      'products',
      'product_variants',
      'inventory_items',
      'orders',
      'order_items',
      'promo_codes',
      'store_settings',
      'servers',
      'tickets',
      'ticket_messages',
      'reviews',
      'audit_logs',
      'user',
      'users',
      'session',
      'account',
      'verification',
    ];

    for (const tbl of allPublicTables) {
      await client.query(`ALTER TABLE public."${tbl}" ENABLE ROW LEVEL SECURITY`);
      await client.query(`ALTER TABLE public."${tbl}" FORCE ROW LEVEL SECURITY`);
    }

    await client.query(`
      -- categories
      DROP POLICY IF EXISTS categories_public_read ON public.categories;
      CREATE POLICY categories_public_read ON public.categories
        FOR SELECT TO fibez_app USING (true);
      DROP POLICY IF EXISTS categories_owner_write ON public.categories;
      CREATE POLICY categories_owner_write ON public.categories
        FOR ALL TO fibez_app USING (app_auth.is_owner()) WITH CHECK (app_auth.is_owner());

      -- products
      DROP POLICY IF EXISTS products_read_active_or_staff ON public.products;
      CREATE POLICY products_read_active_or_staff ON public.products
        FOR SELECT TO fibez_app USING (is_active = TRUE OR app_auth.is_staff());
      DROP POLICY IF EXISTS products_owner_insert ON public.products;
      CREATE POLICY products_owner_insert ON public.products
        FOR INSERT TO fibez_app WITH CHECK (app_auth.is_owner());
      DROP POLICY IF EXISTS products_owner_update ON public.products;
      CREATE POLICY products_owner_update ON public.products
        FOR UPDATE TO fibez_app USING (app_auth.is_owner()) WITH CHECK (app_auth.is_owner());
      DROP POLICY IF EXISTS products_owner_delete ON public.products;
      CREATE POLICY products_owner_delete ON public.products
        FOR DELETE TO fibez_app USING (app_auth.is_owner());

      -- product_variants
      DROP POLICY IF EXISTS variants_read_active_or_staff ON public.product_variants;
      CREATE POLICY variants_read_active_or_staff ON public.product_variants
        FOR SELECT TO fibez_app USING (is_active = TRUE OR app_auth.is_staff());
      DROP POLICY IF EXISTS variants_owner_write ON public.product_variants;
      CREATE POLICY variants_owner_write ON public.product_variants
        FOR ALL TO fibez_app USING (app_auth.is_owner()) WITH CHECK (app_auth.is_owner());

      -- inventory_items (staff-only)
      DROP POLICY IF EXISTS inventory_staff_all ON public.inventory_items;
      CREATE POLICY inventory_staff_all ON public.inventory_items
        FOR ALL TO fibez_app USING (app_auth.is_staff()) WITH CHECK (app_auth.is_staff());

      -- orders
      DROP POLICY IF EXISTS orders_select_own_or_staff ON public.orders;
      CREATE POLICY orders_select_own_or_staff ON public.orders
        FOR SELECT TO fibez_app
        USING (
          app_auth.is_staff()
          OR (app_auth.current_user_id() IS NOT NULL AND user_id = app_auth.current_user_id())
          OR (app_auth.current_user_email() IS NOT NULL AND LOWER(customer_email) = app_auth.current_user_email())
          OR (
            NULLIF(current_setting('app.recent_order_number', true), '') IS NOT NULL
            AND order_number = current_setting('app.recent_order_number', true)
          )
          OR (
            NULLIF(current_setting('app.checkout_order_id', true), '') IS NOT NULL
            AND id = current_setting('app.checkout_order_id', true)
          )
        );
      DROP POLICY IF EXISTS orders_insert_checkout ON public.orders;
      CREATE POLICY orders_insert_checkout ON public.orders
        FOR INSERT TO fibez_app
        WITH CHECK (
          app_auth.is_staff()
          OR (
            app_auth.current_user_id() IS NOT NULL
            AND user_id = app_auth.current_user_id()
            AND LOWER(customer_email) = app_auth.current_user_email()
            AND (
              payment_status IN ('PENDING_PAYMENT', 'PENDING_REVIEW')
              OR (payment_method = 'free_trial' AND total_amount_lkr = 0 AND total_amount_usd = 0)
            )
          )
          OR (
            app_auth.current_user_id() IS NULL
            AND user_id IS NULL
            AND NULLIF(current_setting('app.checkout_order_id', true), '') = id
            AND payment_status IN ('PENDING_PAYMENT', 'PENDING_REVIEW')
          )
        );
      DROP POLICY IF EXISTS orders_update_staff ON public.orders;
      CREATE POLICY orders_update_staff ON public.orders
        FOR UPDATE TO fibez_app USING (app_auth.is_staff()) WITH CHECK (app_auth.is_staff());
      DROP POLICY IF EXISTS orders_delete_owner ON public.orders;
      CREATE POLICY orders_delete_owner ON public.orders
        FOR DELETE TO fibez_app USING (app_auth.is_owner());

      -- order_items
      DROP POLICY IF EXISTS order_items_select_own_or_staff ON public.order_items;
      CREATE POLICY order_items_select_own_or_staff ON public.order_items
        FOR SELECT TO fibez_app
        USING (
          EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_id
              AND (
                app_auth.is_staff()
                OR (app_auth.current_user_id() IS NOT NULL AND o.user_id = app_auth.current_user_id())
                OR (app_auth.current_user_email() IS NOT NULL AND LOWER(o.customer_email) = app_auth.current_user_email())
                OR (
                  NULLIF(current_setting('app.recent_order_number', true), '') IS NOT NULL
                  AND o.order_number = current_setting('app.recent_order_number', true)
                )
              )
          )
        );
      DROP POLICY IF EXISTS order_items_insert_own_or_staff ON public.order_items;
      CREATE POLICY order_items_insert_own_or_staff ON public.order_items
        FOR INSERT TO fibez_app
        WITH CHECK (
          app_auth.is_staff()
          OR EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_id
              AND (
                (app_auth.current_user_id() IS NOT NULL AND o.user_id = app_auth.current_user_id())
                OR (
                  app_auth.current_user_id() IS NULL
                  AND o.user_id IS NULL
                  AND NULLIF(current_setting('app.checkout_order_id', true), '') = o.id
                )
              )
          )
        );
      DROP POLICY IF EXISTS order_items_update_staff ON public.order_items;
      CREATE POLICY order_items_update_staff ON public.order_items
        FOR UPDATE TO fibez_app USING (app_auth.is_staff()) WITH CHECK (app_auth.is_staff());
      DROP POLICY IF EXISTS order_items_delete_owner ON public.order_items;
      CREATE POLICY order_items_delete_owner ON public.order_items
        FOR DELETE TO fibez_app USING (app_auth.is_owner());

      -- promo_codes
      DROP POLICY IF EXISTS promo_read_active_or_staff ON public.promo_codes;
      CREATE POLICY promo_read_active_or_staff ON public.promo_codes
        FOR SELECT TO fibez_app USING (is_active = TRUE OR app_auth.is_staff());
      DROP POLICY IF EXISTS promo_owner_insert ON public.promo_codes;
      CREATE POLICY promo_owner_insert ON public.promo_codes
        FOR INSERT TO fibez_app WITH CHECK (app_auth.is_owner());
      DROP POLICY IF EXISTS promo_owner_update ON public.promo_codes;
      CREATE POLICY promo_owner_update ON public.promo_codes
        FOR UPDATE TO fibez_app USING (app_auth.is_owner()) WITH CHECK (app_auth.is_owner());
      DROP POLICY IF EXISTS promo_owner_delete ON public.promo_codes;
      CREATE POLICY promo_owner_delete ON public.promo_codes
        FOR DELETE TO fibez_app USING (app_auth.is_owner());

      -- store_settings
      DROP POLICY IF EXISTS settings_staff_read ON public.store_settings;
      CREATE POLICY settings_staff_read ON public.store_settings
        FOR SELECT TO fibez_app USING (app_auth.is_staff());
      DROP POLICY IF EXISTS settings_owner_insert ON public.store_settings;
      CREATE POLICY settings_owner_insert ON public.store_settings
        FOR INSERT TO fibez_app WITH CHECK (app_auth.is_owner());
      DROP POLICY IF EXISTS settings_owner_update ON public.store_settings;
      CREATE POLICY settings_owner_update ON public.store_settings
        FOR UPDATE TO fibez_app USING (app_auth.is_owner()) WITH CHECK (app_auth.is_owner());
      DROP POLICY IF EXISTS settings_owner_delete ON public.store_settings;
      CREATE POLICY settings_owner_delete ON public.store_settings
        FOR DELETE TO fibez_app USING (app_auth.is_owner());

      -- servers
      DROP POLICY IF EXISTS servers_public_read ON public.servers;
      CREATE POLICY servers_public_read ON public.servers
        FOR SELECT TO fibez_app USING (true);
      DROP POLICY IF EXISTS servers_owner_insert ON public.servers;
      CREATE POLICY servers_owner_insert ON public.servers
        FOR INSERT TO fibez_app WITH CHECK (app_auth.is_owner());
      DROP POLICY IF EXISTS servers_owner_update ON public.servers;
      CREATE POLICY servers_owner_update ON public.servers
        FOR UPDATE TO fibez_app USING (app_auth.is_owner()) WITH CHECK (app_auth.is_owner());
      DROP POLICY IF EXISTS servers_owner_delete ON public.servers;
      CREATE POLICY servers_owner_delete ON public.servers
        FOR DELETE TO fibez_app USING (app_auth.is_owner());

      -- tickets
      DROP POLICY IF EXISTS tickets_select_own_or_staff ON public.tickets;
      CREATE POLICY tickets_select_own_or_staff ON public.tickets
        FOR SELECT TO fibez_app
        USING (
          app_auth.is_staff()
          OR (app_auth.current_user_id() IS NOT NULL AND user_id = app_auth.current_user_id())
          OR (app_auth.current_user_email() IS NOT NULL AND LOWER(customer_email) = app_auth.current_user_email())
        );
      DROP POLICY IF EXISTS tickets_insert_own ON public.tickets;
      CREATE POLICY tickets_insert_own ON public.tickets
        FOR INSERT TO fibez_app
        WITH CHECK (
          app_auth.is_staff()
          OR (
            app_auth.current_user_id() IS NOT NULL
            AND user_id = app_auth.current_user_id()
            AND LOWER(customer_email) = app_auth.current_user_email()
          )
        );
      DROP POLICY IF EXISTS tickets_update_own_or_staff ON public.tickets;
      CREATE POLICY tickets_update_own_or_staff ON public.tickets
        FOR UPDATE TO fibez_app
        USING (
          app_auth.is_staff()
          OR (
            app_auth.current_user_id() IS NOT NULL
            AND (user_id = app_auth.current_user_id() OR LOWER(customer_email) = app_auth.current_user_email())
          )
        )
        WITH CHECK (
          app_auth.is_staff()
          OR (
            app_auth.current_user_id() IS NOT NULL
            AND (user_id = app_auth.current_user_id() OR LOWER(customer_email) = app_auth.current_user_email())
          )
        );
      DROP POLICY IF EXISTS tickets_delete_owner ON public.tickets;
      CREATE POLICY tickets_delete_owner ON public.tickets
        FOR DELETE TO fibez_app USING (app_auth.is_owner());

      -- ticket_messages
      DROP POLICY IF EXISTS ticket_messages_select_own_or_staff ON public.ticket_messages;
      CREATE POLICY ticket_messages_select_own_or_staff ON public.ticket_messages
        FOR SELECT TO fibez_app
        USING (
          EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
              AND (
                app_auth.is_staff()
                OR (app_auth.current_user_id() IS NOT NULL AND t.user_id = app_auth.current_user_id())
                OR (app_auth.current_user_email() IS NOT NULL AND LOWER(t.customer_email) = app_auth.current_user_email())
              )
          )
        );
      DROP POLICY IF EXISTS ticket_messages_insert_own_or_staff ON public.ticket_messages;
      CREATE POLICY ticket_messages_insert_own_or_staff ON public.ticket_messages
        FOR INSERT TO fibez_app
        WITH CHECK (
          app_auth.is_staff()
          OR (
            app_auth.current_user_id() IS NOT NULL
            AND (sender_id IS NULL OR sender_id = app_auth.current_user_id())
            AND sender_role = 'user'
            AND EXISTS (
              SELECT 1 FROM public.tickets t
              WHERE t.id = ticket_id
                AND (t.user_id = app_auth.current_user_id() OR LOWER(t.customer_email) = app_auth.current_user_email())
            )
          )
        );
      DROP POLICY IF EXISTS ticket_messages_owner_update ON public.ticket_messages;
      CREATE POLICY ticket_messages_owner_update ON public.ticket_messages
        FOR UPDATE TO fibez_app USING (app_auth.is_owner()) WITH CHECK (app_auth.is_owner());
      DROP POLICY IF EXISTS ticket_messages_owner_delete ON public.ticket_messages;
      CREATE POLICY ticket_messages_owner_delete ON public.ticket_messages
        FOR DELETE TO fibez_app USING (app_auth.is_owner());

      -- reviews
      DROP POLICY IF EXISTS reviews_select_approved_or_own_or_staff ON public.reviews;
      CREATE POLICY reviews_select_approved_or_own_or_staff ON public.reviews
        FOR SELECT TO fibez_app
        USING (
          status = 'APPROVED'
          OR app_auth.is_staff()
          OR (app_auth.current_user_id() IS NOT NULL AND user_id = app_auth.current_user_id())
          OR (app_auth.current_user_email() IS NOT NULL AND LOWER(user_email) = app_auth.current_user_email())
        );
      DROP POLICY IF EXISTS reviews_insert_valid ON public.reviews;
      CREATE POLICY reviews_insert_valid ON public.reviews
        FOR INSERT TO fibez_app
        WITH CHECK (
          app_auth.is_staff()
          OR (
            status = 'APPROVED'
            AND admin_reply IS NULL
            AND (
              (app_auth.current_user_id() IS NOT NULL AND user_id = app_auth.current_user_id())
              OR (app_auth.current_user_id() IS NULL AND user_id IS NULL)
            )
          )
        );
      DROP POLICY IF EXISTS reviews_update_staff ON public.reviews;
      CREATE POLICY reviews_update_staff ON public.reviews
        FOR UPDATE TO fibez_app USING (app_auth.is_staff()) WITH CHECK (app_auth.is_staff());
      DROP POLICY IF EXISTS reviews_delete_staff ON public.reviews;
      CREATE POLICY reviews_delete_staff ON public.reviews
        FOR DELETE TO fibez_app USING (app_auth.is_staff());

      -- audit_logs
      DROP POLICY IF EXISTS audit_logs_staff_read ON public.audit_logs;
      CREATE POLICY audit_logs_staff_read ON public.audit_logs
        FOR SELECT TO fibez_app USING (app_auth.is_staff());
      DROP POLICY IF EXISTS audit_logs_insert_any ON public.audit_logs;
      CREATE POLICY audit_logs_insert_any ON public.audit_logs
        FOR INSERT TO fibez_app WITH CHECK (true);

      -- legacy auth tables locked completely
      DROP POLICY IF EXISTS deny_all_public_user ON public."user";
      CREATE POLICY deny_all_public_user ON public."user"
        FOR ALL TO fibez_app USING (false) WITH CHECK (false);
      DROP POLICY IF EXISTS deny_all_public_users ON public.users;
      CREATE POLICY deny_all_public_users ON public.users
        FOR ALL TO fibez_app USING (false) WITH CHECK (false);
      DROP POLICY IF EXISTS deny_all_public_session ON public.session;
      CREATE POLICY deny_all_public_session ON public.session
        FOR ALL TO fibez_app USING (false) WITH CHECK (false);
      DROP POLICY IF EXISTS deny_all_public_account ON public.account;
      CREATE POLICY deny_all_public_account ON public.account
        FOR ALL TO fibez_app USING (false) WITH CHECK (false);
      DROP POLICY IF EXISTS deny_all_public_verification ON public.verification;
      CREATE POLICY deny_all_public_verification ON public.verification
        FOR ALL TO fibez_app USING (false) WITH CHECK (false);
    `);

    await client.query('COMMIT');
    console.log('✓ Enabled RLS and created policies on all 18 public tables');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  applyPostgresRls()
    .then(() => {
      console.log('Postgres RLS setup complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to apply Postgres RLS:', err);
      process.exit(1);
    });
}
