'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Check, Loader2 } from 'lucide-react';
import { LiquidButton } from '@/components/ui/liquid-button';

interface TgStatus {
  configured: boolean;
  bot?: string;
  linked: boolean;
  username?: string | null;
  notify?: boolean;
}

/** Connect / disconnect the customer's Telegram chat. Hidden entirely when the bot is not set up. */
export default function TelegramConnect() {
  const [status, setStatus] = useState<TgStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/telegram/link', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = (await res.json()) as TgStatus;
      setStatus(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    load();
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [load]);

  const connect = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/telegram/link', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || 'Could not start the connection. Please try again.');
        return;
      }
      window.open(data.url, '_blank', 'noopener,noreferrer');
      // Wait for the bot to confirm the link (up to about 3 minutes).
      setWaiting(true);
      let tries = 0;
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = window.setInterval(async () => {
        tries++;
        const s = await load();
        if (s?.linked || tries > 60) {
          if (pollRef.current) window.clearInterval(pollRef.current);
          setWaiting(false);
        }
      }, 3000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    setError(null);
    await fetch('/api/telegram/link', { method: 'DELETE' }).catch(() => {});
    await load();
    setBusy(false);
  };

  const toggleNotify = async () => {
    if (!status) return;
    setBusy(true);
    await fetch('/api/telegram/link', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ notify: !status.notify }),
    }).catch(() => {});
    await load();
    setBusy(false);
  };

  if (!status?.configured) return null;

  return (
    <div className="rounded-2xl bg-[#111114] border border-white/10 p-5 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-center shrink-0">
          <Send className="w-5 h-5 text-[#229ED9]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white">Telegram</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Get your order configs, free-trial link, ticket replies and expiry reminders in Telegram.
          </p>
        </div>
      </div>

      {error && <p className="text-xs font-mono text-rose-300">{error}</p>}

      {status.linked ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
            <Check className="w-4 h-4" />
            <span>Connected{status.username ? ` as @${status.username}` : ''}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LiquidButton size="sm" variant="dark" onClick={toggleNotify} disabled={busy}>
              {status.notify ? 'Pause notifications' : 'Resume notifications'}
            </LiquidButton>
            <LiquidButton size="sm" variant="destructive" onClick={disconnect} disabled={busy}>
              Disconnect
            </LiquidButton>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <LiquidButton variant="accent" onClick={connect} disabled={busy || waiting}>
            {busy || waiting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{waiting ? 'Waiting for Telegram…' : 'Connect Telegram'}</span>
          </LiquidButton>
          {waiting && (
            <p className="text-[11px] font-mono text-zinc-500">
              Tap <b>Start</b> in the chat with @{status.bot}. This page updates by itself.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
