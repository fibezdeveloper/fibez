import 'server-only';
import * as crypto from 'crypto';
import { xui } from '@/lib/xui';
import { adminConfigured, adminIds, adminCall, notifyAdminsNow } from '@/lib/telegram-admin';
import { esc } from '@/lib/telegram';

/**
 * Daily backup of the 3x-ui panel database (x-ui.db), sent to the admin Telegram chat. If the VPS is lost,
 * this file restores every inbound, client, quota and expiry.
 *
 * The file is encrypted (AES-256-GCM, scrypt key) with PANEL_BACKUP_PASSPHRASE before it leaves the server,
 * because it holds every customer's UUID and the panel's own settings. Without the passphrase the backup is
 * refused rather than sent in the clear. Decrypt with: pnpm tsx scripts/decrypt-panel-backup.ts <file> <out>
 *
 * File layout: "FBZB1" | salt(16) | iv(12) | tag(16) | ciphertext
 */
const MAGIC = Buffer.from('FBZB1');

export function encryptBackup(plain: Buffer, passphrase: string): Buffer {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.scryptSync(passphrase, salt, 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([MAGIC, salt, iv, cipher.getAuthTag(), ct]);
}

export async function runPanelBackup(): Promise<{ ok: boolean; bytes?: number; sentTo?: number; error?: string }> {
  if (!adminConfigured() || adminIds().length === 0) {
    return { ok: false, error: 'Admin Telegram bot is not configured, so there is nowhere to send the backup.' };
  }
  const passphrase = process.env.PANEL_BACKUP_PASSPHRASE || '';
  if (passphrase.length < 12) {
    const error = 'PANEL_BACKUP_PASSPHRASE (12+ characters) is not set, so the backup was not sent.';
    await notifyAdminsNow(`⚠️ <b>Panel backup skipped</b>\n${esc(error)}`);
    return { ok: false, error };
  }

  try {
    const db = await xui.downloadDb();
    const blob = encryptBackup(db, passphrase);
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `fibez-panel-${stamp}.db.enc`;
    let sentTo = 0;
    for (const id of adminIds()) {
      const form = new FormData();
      form.set('chat_id', String(id));
      form.set('caption', `Panel backup ${stamp}\n${(db.length / 1024).toFixed(0)} KB, encrypted`);
      form.set('document', new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }), filename);
      const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_ADMIN_BOT_TOKEN}/sendDocument`, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(30000),
      })
        .then((r) => r.json() as Promise<{ ok: boolean }>)
        .catch(() => ({ ok: false }));
      if (res.ok) sentTo++;
    }
    if (sentTo === 0) throw new Error('Telegram did not accept the file');
    return { ok: true, bytes: db.length, sentTo };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Backup failed';
    await adminCall('sendMessage', { chat_id: adminIds()[0], text: `⚠️ Panel backup FAILED: ${error}`.slice(0, 500) }).catch(() => null);
    return { ok: false, error };
  }
}
