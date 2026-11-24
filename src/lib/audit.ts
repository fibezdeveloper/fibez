import 'server-only';
import * as crypto from 'crypto';
import { sql } from '@/lib/db';

/**
 * Admin audit trail: who did what, when, from which IP. Rows go into public.audit_logs (the table the
 * order, product, user and settings routes already write to) and are shown in Admin -> Audit.
 *
 * Never throws and never blocks the action it records. Do not put secrets (keys, tokens, passwords) in
 * `details`: it is shown to every admin.
 */
export interface AuditActor {
  id: string;
  email: string;
}

function clientIp(req?: Request): string | null {
  if (!req) return null;
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0].trim() : req.headers.get('x-real-ip'))?.slice(0, 64) || null;
}

export async function auditLog(
  actor: AuditActor | null,
  action: string,
  entityType: string,
  entityId?: string | null,
  details?: Record<string, unknown>,
  req?: Request
): Promise<void> {
  if (!sql) return;
  try {
    await sql`
      INSERT INTO public.audit_logs (id, user_id, user_email, action, entity_type, entity_id, details, ip_address)
      VALUES (
        ${`audit_${crypto.randomUUID()}`},
        ${actor?.id ?? null},
        ${actor?.email ?? null},
        ${action.slice(0, 80)},
        ${entityType.slice(0, 40)},
        ${entityId ? String(entityId).slice(0, 160) : null},
        ${JSON.stringify(details ?? {})}::jsonb,
        ${clientIp(req)}
      )
    `;
  } catch (err) {
    console.warn('audit log write failed:', err instanceof Error ? err.message : err);
  }
}
