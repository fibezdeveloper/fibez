'use client';

import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

type Phase = 'loading' | 'code' | 'setup' | 'backup';

/**
 * Shown in place of the admin console when a staff account has signed in with its password but has not
 * passed the Google Authenticator check yet. The server enforces this regardless of what this page shows.
 */
export default function TwoFactorGate() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setup, setSetup] = useState<{ secret: string; qr: string } | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/admin/2fa', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) setError('Could not check two-factor status. Reload the page.');
        else if (d.verified) window.location.reload();
        else setPhase(d.enrolled ? 'code' : 'setup');
      })
      .catch(() => setError('Could not check two-factor status. Reload the page.'));
  }, []);

  async function post(body: Record<string, unknown>) {
    const res = await fetch('/api/admin/2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  }

  async function startSetup() {
    setBusy(true);
    setError(null);
    const { ok, data } = await post({ action: 'setup' });
    setBusy(false);
    if (!ok) return setError(data.error || 'Could not start setup.');
    setSetup({ secret: data.secret, qr: data.qr });
  }

  async function submit(action: 'enable' | 'verify') {
    setBusy(true);
    setError(null);
    const { ok, data } = await post({ action, code });
    setBusy(false);
    if (!ok) return setError(data.error || 'That code did not work.');
    if (action === 'enable') {
      setBackupCodes(data.backupCodes || []);
      setPhase('backup');
    } else {
      window.location.reload();
    }
  }

  const input =
    'w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-center font-mono text-lg tracking-[0.3em] text-white outline-none focus:border-violet-400/60';
  const btn =
    'w-full rounded-lg bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400 disabled:opacity-50';

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950/80 p-6 text-zinc-200 shadow-2xl">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-violet-300" />
          <h1 className="text-base font-semibold text-white">Admin two-factor check</h1>
        </div>

        {phase === 'loading' && !error && (
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking...
          </div>
        )}

        {phase === 'code' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit('verify');
            }}
            className="space-y-3"
          >
            <p className="text-sm text-zinc-400">Open Google Authenticator and enter the 6-digit code for Fibez Admin. A backup code also works.</p>
            <input
              autoFocus
              inputMode="text"
              autoComplete="one-time-code"
              maxLength={11}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className={input}
            />
            <button type="submit" disabled={busy || code.trim().length < 6} className={btn}>
              {busy ? 'Checking...' : 'Unlock admin'}
            </button>
          </form>
        )}

        {phase === 'setup' && !setup && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">
              Admin accounts need Google Authenticator (or any TOTP app). Set it up once; after that every admin sign-in asks for a code.
            </p>
            <button onClick={startSetup} disabled={busy} className={btn}>
              {busy ? 'Preparing...' : 'Set up two-factor'}
            </button>
          </div>
        )}

        {phase === 'setup' && setup && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit('enable');
            }}
            className="space-y-3"
          >
            <p className="text-sm text-zinc-400">1. Scan this QR code with Google Authenticator (tap + then Scan a QR code).</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={setup.qr} alt="Authenticator QR code" width={220} height={220} className="mx-auto rounded-lg bg-white p-1" />
            <p className="break-all text-center font-mono text-[11px] text-zinc-500">Or type this key: {setup.secret}</p>
            <p className="text-sm text-zinc-400">2. Enter the 6-digit code it shows.</p>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={7}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className={input}
            />
            <button type="submit" disabled={busy || code.replace(/\s/g, '').length !== 6} className={btn}>
              {busy ? 'Checking...' : 'Turn on two-factor'}
            </button>
          </form>
        )}

        {phase === 'backup' && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">
              Two-factor is on. Save these backup codes somewhere safe, away from this device. Each works once if you lose your phone. They are not shown again.
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/40 p-3 text-center font-mono text-sm text-white">
              {backupCodes.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <button onClick={() => window.location.reload()} className={btn}>
              I saved them, open admin
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
