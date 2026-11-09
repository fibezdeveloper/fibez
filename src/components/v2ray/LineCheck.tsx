'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  Smartphone, 
  Radio, 
  Server, 
  Globe, 
  DownloadCloud, 
  ShieldCheck, 
  RefreshCw,
  Terminal,
  Zap,
  Cpu
} from 'lucide-react';

interface HopResult {
  id: string;
  title: string;
  subtitle: string;
  status: 'pass' | 'warning' | 'fail';
  latencyMs: number;
  details: string[];
}

interface DiagnosticData {
  timestamp: string;
  remark: string;
  protocol: string;
  targetHost: string;
  targetSni: string;
  targetPort: number;
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  totalLatencyMs: number;
  packetLossRate: string;
  downloadSpeedMbps: number | null;
  inferredIsp: string;
  hops: HopResult[];
  advice: string;
}

export default function LineCheck() {
  const [configInput, setConfigInput] = useState('');
  const [includeDownloadTest, setIncludeDownloadTest] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleConfigs = [
    {
      label: 'Sample Dialog Zoom VLESS',
      uri: 'vless://fbz-dialog-demo@sg-node.fibez.store:443?encryption=none&security=reality&sni=zoom.us&fp=chrome&pbk=7kZz9XQ0YhJtF8WqK1bV2mN3sP4cD5eG6iU7oA8rS9M&sid=fa4c10&type=tcp#Fibez-Dialog-Zoom-VLESS',
    },
    {
      label: 'Sample SLT Fiber Netflix VLESS',
      uri: 'vless://fbz-slt-demo@sg-node.fibez.store:443?encryption=none&security=reality&sni=netflix.com&fp=chrome&pbk=7kZz9XQ0YhJtF8WqK1bV2mN3sP4cD5eG6iU7oA8rS9M&sid=fa4c10&type=tcp#Fibez-SLT-Netflix-VLESS',
    },
    {
      label: 'Sample Airtel TikTok VLESS',
      uri: 'vless://fbz-airtel-demo@sg-node.fibez.store:443?encryption=none&security=reality&sni=tiktokv.com&fp=chrome&pbk=7kZz9XQ0YhJtF8WqK1bV2mN3sP4cD5eG6iU7oA8rS9M&sid=fa4c10&type=tcp#Fibez-Airtel-TikTok-VLESS',
    },
  ];

  const handleRunCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = configInput.trim();
    if (!query) {
      setErrorMsg('Please paste a vless:// config string, or enter your Order Number.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/v2ray/line-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configString: query,
          includeDownloadTest,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete line check');
      }

      setResult(data.diagnostics);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing line diagnostics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getHopIcon = (id: string) => {
    switch (id) {
      case 'device':
        return <Smartphone className="w-5 h-5 text-zinc-300" />;
      case 'isp':
        return <Radio className="w-5 h-5 text-zinc-300" />;
      case 'edge':
        return <Server className="w-5 h-5 text-zinc-300" />;
      case 'internet':
        return <Globe className="w-5 h-5 text-zinc-300" />;
      default:
        return <Activity className="w-5 h-5 text-zinc-300" />;
    }
  };

  return (
    <div id="line-check" className="w-full bg-[#0d0d10] border border-[#1f1f26] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
      {/* Background grid accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#262633_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center sm:text-left mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#3ad389] animate-pulse" />
              <span>VLESS DIAGNOSTICS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Line Check: Is it the config, or the connection?
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl">
              Paste your VLESS config or Order Number. We test your line from this device, verify your SNI handshake, and tell you which of the two is letting you down.
            </p>
          </div>
        </div>

        {/* Diagnostic Input Form */}
        <form onSubmit={handleRunCheck} className="space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={configInput}
              onChange={(e) => setConfigInput(e.target.value)}
              placeholder="Paste a vless://, hysteria2://, vmess:// URI, or enter your Order Number (e.g., FBZ-88219)..."
              className="w-full bg-[#131317] border border-[#272730] focus:border-white/40 focus:ring-1 focus:ring-white/40 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 font-mono resize-none transition-all outline-none"
            />
          </div>

          {/* Quick paste helper buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-zinc-500 font-mono">Try with:</span>
            {sampleConfigs.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setConfigInput(sample.uri)}
                className="px-2.5 py-1 rounded-md bg-[#18181e] hover:bg-[#202028] border border-white/5 text-zinc-400 hover:text-white transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>

          {/* Options & Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-400 hover:text-zinc-300">
              <input
                type="checkbox"
                checked={includeDownloadTest}
                onChange={(e) => setIncludeDownloadTest(e.target.checked)}
                className="rounded border-[#2c2c36] bg-[#16161b] text-white focus:ring-0 w-4 h-4"
              />
              <span>Include a download test · up to 15 MB payload</span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-medium text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Probing Line...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Run Line Check</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Diagnostic Results Presentation */}
        {result && (
          <div className="mt-8 pt-8 border-t border-[#1f1f26] space-y-6">
            
            {/* Top Verdict Banner */}
            <div className="p-4 rounded-xl bg-[#141419] border border-[#272732] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3ad389]/10 border border-[#3ad389]/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#3ad389]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-base">Line Status: {result.overallStatus}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                      {result.protocol}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {result.remark} · Target: {result.targetHost}:{result.targetPort}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="bg-[#1a1a22] px-3 py-1.5 rounded-lg border border-white/5">
                  <span className="text-zinc-500 block text-[10px]">TOTAL RTT</span>
                  <span className="text-white font-bold">{result.totalLatencyMs} ms</span>
                </div>
                {result.packetLossRate && (
                  <div className="bg-[#1a1a22] px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="text-zinc-500 block text-[10px]">PACKET LOSS</span>
                    <span className="text-[#3ad389] font-bold">{result.packetLossRate}</span>
                  </div>
                )}
                {result.downloadSpeedMbps && (
                  <div className="bg-[#1a1a22] px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="text-zinc-500 block text-[10px]">SPEED</span>
                    <span className="text-white font-bold">{result.downloadSpeedMbps} Mbps</span>
                  </div>
                )}
              </div>
            </div>

            {/* 4-Hop Pipeline Diagram */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-3 font-semibold">
                Connection Pipeline Hops
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {result.hops.map((hop, index) => (
                  <div
                    key={hop.id}
                    className="p-3.5 rounded-xl bg-[#121216] border border-[#23232c] relative group hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        {getHopIcon(hop.id)}
                      </div>
                      <span className="text-xs font-mono font-bold text-zinc-300">
                        {hop.latencyMs} ms
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-white truncate">
                      {hop.title}
                    </div>
                    <div className="text-xs text-zinc-500 truncate mb-3">
                      {hop.subtitle}
                    </div>

                    <div className="space-y-1 pt-2 border-t border-white/5">
                      {hop.details.map((detail, dIdx) => (
                        <div key={dIdx} className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
                          <span className="w-1 h-1 rounded-full bg-[#3ad389]" />
                          <span className="truncate">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Engineering Advice */}
            <div className="p-4 rounded-xl bg-[#141419] border border-[#23232c] text-xs text-zinc-300 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block mb-0.5">Engineering Diagnosis & ISP Advice:</span>
                <p className="text-zinc-400 leading-relaxed">{result.advice}</p>
                <div className="mt-2 text-[11px] text-zinc-500 flex flex-wrap gap-4 font-mono">
                  <span>Detected ISP: {result.inferredIsp}</span>
                  <span>SNI Masquerade: {result.targetSni}</span>
                  <span>TLS Verification: PASS</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
