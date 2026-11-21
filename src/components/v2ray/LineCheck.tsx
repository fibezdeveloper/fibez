'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Globe,
  LifeBuoy,
  RefreshCw,
  Server,
  ShieldCheck,
  Wifi,
  XCircle,
  Zap,
} from 'lucide-react';
import { useSiteFlag } from '@/lib/use-site-flags';

interface HopResult {
  id: string;
  title: string;
  subtitle: string;
  status: 'pass' | 'warning' | 'fail';
  latencyMs: number;
  details: string[];
}

interface DiagnosticData {
  remark: string;
  protocol: string;
  targetHost: string;
  targetSni: string;
  targetPort: number;
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  totalLatencyMs: number;
  hops: HopResult[];
  advice: string;
}

interface PingResult {
  medianMs: number;
  bestMs: number;
  failed: number;
  total: number;
}

const PING_SAMPLES = 6;

async function pingOnce(): Promise<number | null> {
  const started = performance.now();
  try {
    const res = await fetch(`/api/site-pages?ping=${Date.now()}-${Math.random().toString(36).slice(2)}`, {
      cache: 'no-store',
    });
    await res.arrayBuffer();
    return performance.now() - started;
  } catch {
    return null;
  }
}

function pingVerdict(r: PingResult): { tone: 'good' | 'warn' | 'bad'; title: string; text: string } {
  if (r.failed >= Math.ceil(r.total / 2)) {
    return {
      tone: 'bad',
      title: 'Your internet is unstable',
      text: 'Most of the test requests failed. The problem is your connection, not your VLESS line. Check your signal or Wi-Fi, then try again.',
    };
  }
  if (r.failed > 0 || r.medianMs > 400) {
    return {
      tone: 'warn',
      title: 'Your internet is slow or patchy',
      text: 'Some requests were slow or dropped. A VPN cannot fix a weak signal. Move closer to the router or try mobile data, then test again.',
    };
  }
  return {
    tone: 'good',
    title: 'Your internet reaches us fine',
    text: 'Your connection to our Singapore servers is healthy. If the VPN still will not work, test your line below.',
  };
}

const TONE_STYLES = {
  good: { box: 'bg-[#3ad389]/10 border-[#3ad389]/30', icon: 'text-[#3ad389]' },
  warn: { box: 'bg-amber-500/10 border-amber-500/30', icon: 'text-amber-400' },
  bad: { box: 'bg-red-500/10 border-red-500/30', icon: 'text-red-400' },
} as const;

export default function LineCheck() {
  const ticketsOn = useSiteFlag('tickets');

  const [pinging, setPinging] = useState(false);
  const [ping, setPing] = useState<PingResult | null>(null);

  const [configInput, setConfigInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runPing = async () => {
    setPinging(true);
    setPing(null);
    await pingOnce(); // warm-up: the first request pays for the TLS handshake
    const times: number[] = [];
    let failed = 0;
    for (let i = 0; i < PING_SAMPLES; i++) {
      const t = await pingOnce();
      if (t === null) failed += 1;
      else times.push(t);
    }
    times.sort((a, b) => a - b);
    setPing({
      medianMs: times.length ? Math.round(times[Math.floor(times.length / 2)]) : 0,
      bestMs: times.length ? Math.round(times[0]) : 0,
      failed,
      total: PING_SAMPLES,
    });
    setPinging(false);
  };

  const runLineCheck = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = configInput.trim();
    if (!query) {
      setErrorMsg('Paste your vless:// link first.');
      return;
    }
    setErrorMsg(null);
    setResult(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/v2ray/line-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configString: query }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Line check failed. Try again.');
      setResult(data.diagnostics);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Line check failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verdict = ping ? pingVerdict(ping) : null;
  const lineTone = result ? (result.overallStatus === 'HEALTHY' ? 'good' : result.overallStatus === 'DEGRADED' ? 'warn' : 'bad') : null;

  return (
    <div className="space-y-6">
      {/* Step 1: device to Fibez */}
      <section className="rounded-2xl bg-[#0d0d10] border border-[#1f1f26] p-5 sm:p-7 space-y-5">
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-full bg-[#3ad389] text-black text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">Test your internet</h2>
            <p className="text-sm text-zinc-400 mt-0.5">
              Checks how fast and steady your connection reaches our Singapore servers. Run this first, with the VPN switched off.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={runPing}
          disabled={pinging}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer"
        >
          {pinging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
          <span>{pinging ? 'Testing...' : ping ? 'Test again' : 'Test my connection'}</span>
        </button>

        {ping && verdict && (
          <div className={`p-4 rounded-xl border ${TONE_STYLES[verdict.tone].box}`}>
            <div className="flex items-start gap-3">
              {verdict.tone === 'good' ? (
                <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${TONE_STYLES.good.icon}`} />
              ) : (
                <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${TONE_STYLES[verdict.tone].icon}`} />
              )}
              <div className="min-w-0">
                <div className="font-semibold text-white">{verdict.title}</div>
                <p className="text-sm text-zinc-300 mt-0.5">{verdict.text}</p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-zinc-300">
                    Typical delay <strong className="text-white">{ping.medianMs} ms</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-zinc-300">
                    Best <strong className="text-white">{ping.bestMs} ms</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-zinc-300">
                    Dropped <strong className="text-white">{ping.failed} of {ping.total}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Step 2: the VLESS line */}
      <section className="rounded-2xl bg-[#0d0d10] border border-[#1f1f26] p-5 sm:p-7 space-y-5">
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-full bg-[#3ad389] text-black text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">Test your VLESS line</h2>
            <p className="text-sm text-zinc-400 mt-0.5">
              Paste your <span className="font-mono text-zinc-300">vless://</span> link. We check that our server accepts your connection and completes the secure handshake.
            </p>
          </div>
        </div>

        <form onSubmit={runLineCheck} className="space-y-3">
          <textarea
            rows={3}
            value={configInput}
            onChange={(e) => setConfigInput(e.target.value)}
            placeholder="vless://..."
            spellCheck={false}
            className="w-full bg-[#131317] border border-[#272730] focus:border-white/40 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 font-mono resize-none transition-colors outline-none"
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-zinc-500">
              Find your link in the V2Ray Dashboard. It is only used for this test and is not saved.
            </p>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
              <span>{isLoading ? 'Checking...' : 'Check my line'}</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {result && lineTone && (
          <div className="space-y-4 pt-2">
            <div className={`p-4 rounded-xl border ${TONE_STYLES[lineTone].box} flex items-start gap-3`}>
              {lineTone === 'good' ? (
                <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${TONE_STYLES.good.icon}`} />
              ) : lineTone === 'warn' ? (
                <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${TONE_STYLES.warn.icon}`} />
              ) : (
                <XCircle className={`w-5 h-5 shrink-0 mt-0.5 ${TONE_STYLES.bad.icon}`} />
              )}
              <div className="min-w-0">
                <div className="font-semibold text-white">
                  {result.overallStatus === 'HEALTHY'
                    ? 'Our server accepts your line'
                    : result.overallStatus === 'DEGRADED'
                      ? 'Connected, but the handshake failed'
                      : 'Our server could not reach your line'}
                </div>
                <p className="text-sm text-zinc-300 mt-0.5">{result.advice}</p>
                <p className="text-xs font-mono text-zinc-500 mt-2 break-all">
                  {result.remark} · {result.protocol} · {result.targetHost}:{result.targetPort}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.hops.map((hop) => (
                <div key={hop.id} className="p-4 rounded-xl bg-[#121216] border border-[#23232c]">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {hop.id === 'edge' ? (
                        <Server className="w-4 h-4 text-zinc-400 shrink-0" />
                      ) : (
                        <Globe className="w-4 h-4 text-zinc-400 shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-white truncate">{hop.title}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                        hop.status === 'pass'
                          ? 'text-[#3ad389] border-[#3ad389]/40'
                          : hop.status === 'warning'
                            ? 'text-amber-400 border-amber-400/40'
                            : 'text-red-400 border-red-400/40'
                      }`}
                    >
                      {hop.status === 'pass' ? 'OK' : hop.status === 'warning' ? 'Check' : 'Failed'}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 truncate">{hop.subtitle}</div>
                  <div className="text-xs font-mono text-zinc-300 mt-2">{hop.latencyMs} ms</div>
                  <div className="mt-2 space-y-1">
                    {hop.details.map((d, i) => (
                      <div key={i} className="text-xs text-zinc-400">{d}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-zinc-500">
              This test runs from our server, so it shows whether the line itself is working. It cannot see your own internet, which is what step 1 is for.
            </p>
          </div>
        )}
      </section>

      {/* Step 3: still stuck */}
      <section className="rounded-2xl bg-[#0d0d10] border border-[#1f1f26] p-5 sm:p-7 space-y-4">
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-full bg-[#3ad389] text-black text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">Still not connecting?</h2>
            <p className="text-sm text-zinc-400 mt-0.5">Most problems are one of these.</p>
          </div>
        </div>

        <ul className="space-y-2.5 text-sm text-zinc-300">
          <li className="flex gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#3ad389] shrink-0 mt-0.5" />
            <span>Your package must match your SIM or broadband. A Dialog package will not work on Mobitel.</span>
          </li>
          <li className="flex gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#3ad389] shrink-0 mt-0.5" />
            <span>Import the full link. A link cut short will connect but pass no data.</span>
          </li>
          <li className="flex gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#3ad389] shrink-0 mt-0.5" />
            <span>Update NetMod or v2rayNG to the latest version, and check your phone date and time are correct.</span>
          </li>
          <li className="flex gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#3ad389] shrink-0 mt-0.5" />
            <span>Check your line has not expired or run out of data in your V2Ray Dashboard.</span>
          </li>
        </ul>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <Link
            href="/v2ray/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm transition-colors"
          >
            <Activity className="w-4 h-4 text-[#3ad389]" />
            <span>My V2Ray Dashboard</span>
          </Link>
          <Link
            href="/v2ray/guide"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm transition-colors"
          >
            <span>Setup guide</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </Link>
          {ticketsOn && (
            <Link
              href="/tickets"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 text-sm font-semibold transition-colors"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Open a support ticket</span>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
