'use client';

import React, { useState } from 'react';
import { Copy, Check, Play, Terminal, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CodeWindow() {
  const [activeTab, setActiveTab] = useState<'nodejs' | 'curl' | 'python' | 'go'>('nodejs');
  const [isCopied, setIsCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    id: string;
    sku: string;
    status: string;
    durationMs: number;
    payloadPreview: string;
    timestamp: string;
  } | null>(null);

  const snippets = {
    nodejs: `import { Fibez } from 'fibez';

const fibez = new Fibez({ 
  apiKey: process.env.FIBEZ_API_KEY // fbz_live_79a...
});

// Instant programmatic delivery for high-speed digital assets
const delivery = await fibez.vault.dispense({
  sku: 'v2ray-singapore-reality-10gbps',
  recipient: 'developer@terminal.sh',
  region: 'ap-southeast-1',
  durationDays: 30,
});

console.log(delivery.status); // "DELIVERED"
console.log(delivery.configUri); // "vless://9f02.../?encryption=none&security=reality"`,

    curl: `curl -X POST https://api.fibez.io/v1/vault/dispense \\
  -H "Authorization: Bearer fbz_live_79a4..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "sku": "cloud-vps-nvme-4c8g",
    "recipient": "devops@company.internal",
    "datacenter": "hetzner-fsn1",
    "os": "ubuntu-24.04-lts"
  }'`,

    python: `from fibez import FibezClient

client = FibezClient(api_key="fbz_live_79a4...")

# Dispense license key or subscription credentials in < 400ms
delivery = client.vault.dispense(
    sku="chatgpt-team-workspace",
    recipient="engineer@startup.io",
    warranty_guard=True
)

print(delivery.status)        # DELIVERED
print(delivery.license_key)   # "sk-ant-live-491..."`,

    go: `package main

import (
	"context"
	"fmt"
	"github.com/fibez/fibez-go"
)

func main() {
	client := fibez.NewClient("fbz_live_79a4...")
	
	resp, err := client.Vault.Dispense(context.Background(), &fibez.DispenseParams{
		SKU:       "v2ray-singapore-reality-10gbps",
		Recipient: "sysadmin@edge.net",
	})
	
	fmt.Println(resp.Status)    // DELIVERED
	fmt.Println(resp.ConfigURI) // vless://...
}`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleTestDispatch = () => {
    setIsExecuting(true);
    setExecutionResult(null);

    setTimeout(() => {
      setIsExecuting(false);
      setExecutionResult({
        id: 'fbz_disp_' + Math.random().toString(36).substring(2, 9),
        sku: activeTab === 'curl' ? 'cloud-vps-nvme-4c8g' : 'v2ray-singapore-reality-10gbps',
        status: 'DELIVERED',
        durationMs: 284,
        payloadPreview: activeTab === 'curl' 
          ? 'ssh root@138.199.34.81 -i ~/.ssh/fibez_ed25519'
          : 'vless://0e6d61f1-3d4a-4a2e-a5cf-81b47c94b72a@sg-edge.fibez.io:443?security=reality&sni=gateway.apple.com#Fibez-SG-Reality',
        timestamp: new Date().toISOString(),
      });
    }, 450);
  };

  return (
    <section id="api" className="w-full py-24 bg-black border-t border-[#292d30]">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Section Headline in tight geometric Favorit/Inter */}
        <div className="max-w-2xl mb-12">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3">
            Programmatic Infrastructure
          </div>
          <h2 className="text-[40px] sm:text-[54px] font-normal leading-[1.12] tracking-[-0.05em] text-white">
            Dispense in code. <br />
            Receive in milliseconds.
          </h2>
          <p className="text-[17px] leading-relaxed text-[#a1a4a5] mt-4">
            Zero human intervention. Integrated webhooks and SDKs deliver V2Ray configurations, root SSH credentials, and license keys directly into your workflows.
          </p>
        </div>

        {/* Code Terminal Box — Resend Terminal Styling */}
        <div className="resend-card overflow-hidden">
          
          {/* Terminal Window Header Bar */}
          <div className="h-12 px-4 border-b border-[#292d30] flex items-center justify-between bg-black">
            
            {/* Traffic Light Dots */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#292d30]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#292d30]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#292d30]" />
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center gap-1">
                {(['nodejs', 'curl', 'python', 'go'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`font-mono text-xs px-3 py-1 rounded-[6px] transition-colors ${
                      activeTab === tab
                        ? 'text-white bg-[#1a1c1e] border border-[#292d30]'
                        : 'text-[#a1a4a5] hover:text-white'
                    }`}
                  >
                    {tab === 'nodejs' && 'Node.js'}
                    {tab === 'curl' && 'cURL'}
                    {tab === 'python' && 'Python'}
                    {tab === 'go' && 'Go'}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions: Run Test Dispatch + Copy Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleTestDispatch}
                disabled={isExecuting}
                className="btn-ghost-resend !py-1 !px-2.5 !text-xs text-[#f0f0f0]"
                title="Execute test delivery"
              >
                <Play className={`w-3 h-3 text-[#3ad389] ${isExecuting ? 'animate-spin' : ''}`} />
                <span>{isExecuting ? 'Dispatching...' : 'Test Dispatch'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="btn-ghost-resend !py-1 !px-2.5 !text-xs text-[#a1a4a5] hover:text-white"
                title="Copy code"
              >
                {isCopied ? <Check className="w-3 h-3 text-[#3ad389]" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

          </div>

          {/* Terminal Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left: Code Snippet */}
            <div className="lg:col-span-8 p-6 font-mono text-[13px] leading-relaxed text-[#f0f0f0] overflow-x-auto bg-black">
              <pre className="whitespace-pre">
                {snippets[activeTab].split('\n').map((line, idx) => {
                  // Resend syntax highlighting:
                  // Iris Violet for strings and tokens
                  // Smoke Gray for comments
                  // Bone White for keywords
                  const isComment = line.trim().startsWith('//') || line.trim().startsWith('#');
                  if (isComment) {
                    return <div key={idx} className="text-[#6e727a]">{line}</div>;
                  }
                  return (
                    <div key={idx}>
                      <span className="text-[#464a4d] select-none mr-4 text-xs">{(idx + 1).toString().padStart(2, '0')}</span>
                      <span>
                        {line.split(/(['"].*?['"])/).map((segment, segIdx) => {
                          if (segment.startsWith("'") || segment.startsWith('"')) {
                            return <span key={segIdx} className="text-zinc-300">{segment}</span>;
                          }
                          if (segment.includes('const ') || segment.includes('import ') || segment.includes('from ') || segment.includes('await ') || segment.includes('func ') || segment.includes('package ')) {
                            return <span key={segIdx} className="text-white font-medium">{segment}</span>;
                          }
                          return <span key={segIdx} className="text-[#e0e0e0]">{segment}</span>;
                        })}
                      </span>
                    </div>
                  );
                })}
              </pre>
            </div>

            {/* Right: Live Dispatch Observation & Decryption Panel */}
            <div className="lg:col-span-4 p-6 border-t lg:border-t-0 lg:border-l border-[#292d30] bg-[#000000] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#292d30]">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#a1a4a5]">
                    Vault Telemetry
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-white">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>EDGE READY</span>
                  </div>
                </div>

                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-[#1f2224]">
                    <span className="text-[#6e727a]">Protocol</span>
                    <span className="text-[#f0f0f0]">gRPC / REST v1</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1f2224]">
                    <span className="text-[#6e727a]">Encryption</span>
                    <span className="text-white">AES-GCM-256</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1f2224]">
                    <span className="text-[#6e727a]">Region Latency</span>
                    <span className="text-zinc-300">18ms (Singapore)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1f2224]">
                    <span className="text-[#6e727a]">Inventory State</span>
                    <span className="text-white">Instant Auto-Fulfill</span>
                  </div>
                </div>

                {/* Execution Output Preview */}
                {executionResult ? (
                  <div className="mt-5 p-3 rounded-[6px] border border-[#292d30] bg-[#080808] space-y-2">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-white flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        {executionResult.status}
                      </span>
                      <span className="text-[#a1a4a5]">{executionResult.durationMs}ms</span>
                    </div>
                    <div className="font-mono text-[11px] text-zinc-300 truncate">
                      {executionResult.payloadPreview}
                    </div>
                    <div className="font-mono text-[10px] text-[#6e727a]">
                      Ref: {executionResult.id}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 p-4 rounded-[6px] border border-dashed border-[#292d30] text-center">
                    <p className="font-mono text-xs text-[#6e727a]">
                      Click "Test Dispatch" above to trigger a live zero-trust key provisioning simulation.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#292d30] flex items-center justify-between text-xs text-[#a1a4a5]">
                <span>Neon PostgreSQL Pool</span>
                <span className="font-mono text-[#f0f0f0]">Active (Serverless)</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
