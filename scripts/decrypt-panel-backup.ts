import * as crypto from 'crypto';
import * as fs from 'fs';

/**
 * Restore helper. Decrypts a panel backup that arrived in the admin Telegram chat.
 *
 *   PANEL_BACKUP_PASSPHRASE=<your passphrase> pnpm tsx scripts/decrypt-panel-backup.ts fibez-panel-2026-11-24.db.enc x-ui.db
 *
 * Then on a fresh 3x-ui server: stop x-ui, replace /etc/x-ui/x-ui.db with the output, start x-ui.
 */
const [input, output] = process.argv.slice(2);
const passphrase = process.env.PANEL_BACKUP_PASSPHRASE || '';
if (!input || !output || !passphrase) {
  console.error('Usage: PANEL_BACKUP_PASSPHRASE=... pnpm tsx scripts/decrypt-panel-backup.ts <backup.db.enc> <out.db>');
  process.exit(1);
}
const raw = fs.readFileSync(input);
if (raw.subarray(0, 5).toString() !== 'FBZB1') {
  console.error('Not a Fibez panel backup (bad header).');
  process.exit(1);
}
const salt = raw.subarray(5, 21);
const iv = raw.subarray(21, 33);
const tag = raw.subarray(33, 49);
const ct = raw.subarray(49);
try {
  const decipher = crypto.createDecipheriv('aes-256-gcm', crypto.scryptSync(passphrase, salt, 32), iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ct), decipher.final()]);
  if (plain.subarray(0, 15).toString('latin1') !== 'SQLite format 3') throw new Error('Decrypted data is not a SQLite file');
  fs.writeFileSync(output, plain);
  console.log(`Restored ${plain.length} bytes to ${output}`);
} catch (err) {
  console.error('Decrypt failed (wrong passphrase or damaged file):', (err as Error).message);
  process.exit(1);
}
