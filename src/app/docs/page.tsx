'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  BookOpen, 
  Terminal, 
  ShieldCheck, 
  Copy, 
  Check, 
  Smartphone, 
  Laptop, 
  Server, 
  HelpCircle, 
  MessageSquare, 
  ArrowRight,
  ExternalLink 
} from 'lucide-react';

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#8e87aa] mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#5c5673]" />
        <span className="text-white">Documentation & Setup Guides</span>
      </div>

      {/* Header */}
      <div className="mb-12 pb-8 border-b border-[#231e38]">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#9281f7] mb-2">
          Knowledge Base & Client Tutorials
        </div>
        <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
          Client Configuration & Deployment Guides
        </h1>
        <p className="text-sm text-[#8e87aa] mt-2 max-w-2xl leading-relaxed">
          Comprehensive step-by-step setup guides for Sing-box, v2rayNG, Shadowrocket, and initial Linux Cloud VPS hardening.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-4 rounded-[16px] bg-[#0c0919] border border-[#231e38] space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[#9281f7]">Quick Jump</div>
            <nav className="flex flex-col space-y-2 text-xs font-mono text-[#8e87aa]">
              <a href="#v2ray-android" className="hover:text-white transition-colors">1. Android (v2rayNG)</a>
              <a href="#v2ray-ios" className="hover:text-white transition-colors">2. iOS (Shadowrocket / Streisand)</a>
              <a href="#v2ray-windows" className="hover:text-white transition-colors">3. Windows & Mac (Sing-box)</a>
              <a href="#vps-hardening" className="hover:text-white transition-colors">4. Cloud VPS Initial Setup</a>
              <a href="#faq" className="hover:text-white transition-colors">5. Frequently Asked Questions</a>
            </nav>
          </div>

          <div className="p-4 rounded-[16px] bg-[#120e24] border border-[#2b2447] text-xs font-mono space-y-2">
            <div className="text-white font-medium flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#9281f7]" />
              <span>Need Direct Assistance?</span>
            </div>
            <p className="text-[#8e87aa] leading-relaxed">
              Our infrastructure engineers are online 24/7 on WhatsApp and Discord.
            </p>
            <div className="pt-1 flex flex-col gap-1.5">
              <a
                href="https://wa.me/94771234567"
                target="_blank"
                rel="noreferrer"
                className="text-[#9281f7] hover:underline flex items-center justify-between"
              >
                <span>WhatsApp Engineer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://discord.gg/fibez"
                target="_blank"
                rel="noreferrer"
                className="text-[#9281f7] hover:underline flex items-center justify-between"
              >
                <span>Discord Community</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="lg:col-span-9 space-y-12">
          
          {/* Section 1: Android Setup */}
          <section id="v2ray-android" className="p-6 rounded-[20px] bg-[#0c0919] border border-[#231e38] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#17122b] border border-[#2d234d] flex items-center justify-center text-[#9281f7]">
                <Smartphone className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-medium text-white">1. Android: v2rayNG Setup</h2>
            </div>
            <p className="text-xs text-[#8e87aa] leading-relaxed">
              v2rayNG is the recommended open-source Android client with native Reality protocol support and automatic latency testing.
            </p>
            <ol className="list-decimal list-inside text-xs text-zinc-300 space-y-2 font-mono">
              <li>Download <strong>v2rayNG</strong> from Google Play Store or GitHub releases.</li>
              <li>Go to your Fibez <Link href="/vault" className="text-[#9281f7] hover:underline">Key Vault</Link> and copy your VLESS URI or open the QR code.</li>
              <li>Open v2rayNG, tap the <strong>+</strong> button at top right, and select <strong>Import config from Clipboard</strong> (or Scan QR Code).</li>
              <li>Tap the newly imported node and tap the floating <strong>V</strong> circle at the bottom right to connect.</li>
            </ol>
          </section>

          {/* Section 2: iOS Setup */}
          <section id="v2ray-ios" className="p-6 rounded-[20px] bg-[#0c0919] border border-[#231e38] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#17122b] border border-[#2d234d] flex items-center justify-center text-[#9281f7]">
                <Smartphone className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-medium text-white">2. iOS: Shadowrocket & Streisand Setup</h2>
            </div>
            <p className="text-xs text-[#8e87aa] leading-relaxed">
              For iPhone & iPad devices, Shadowrocket and Streisand provide high-speed TLS masquerade routing.
            </p>
            <ol className="list-decimal list-inside text-xs text-zinc-300 space-y-2 font-mono">
              <li>Install <strong>Shadowrocket</strong> or <strong>Streisand</strong> from the App Store.</li>
              <li>Copy your VLESS Reality key from the <Link href="/vault" className="text-[#9281f7] hover:underline">Key Vault</Link>.</li>
              <li>When opening Shadowrocket, it will automatically detect the clipboard string and prompt to add it. Tap <strong>Save</strong>.</li>
              <li>Toggle the connection switch to <strong>ON</strong>. Allow iOS VPN permissions if prompted.</li>
            </ol>
          </section>

          {/* Section 3: Windows & Mac Setup */}
          <section id="v2ray-windows" className="p-6 rounded-[20px] bg-[#0c0919] border border-[#231e38] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#17122b] border border-[#2d234d] flex items-center justify-center text-[#9281f7]">
                <Laptop className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-medium text-white">3. Windows & macOS: Sing-box & v2rayN</h2>
            </div>
            <p className="text-xs text-[#8e87aa] leading-relaxed">
              On desktop, Sing-box or v2rayN allows full system proxying or per-app TUN routing for gaming and torrenting.
            </p>
            <div className="p-3.5 rounded-[12px] bg-black/60 border border-white/5 font-mono text-xs text-zinc-300 space-y-2">
              <div className="text-[#9281f7] font-semibold">Sing-box CLI Quick Run:</div>
              <div className="flex items-center justify-between p-2.5 rounded bg-[#07050d] border border-[#231e38]">
                <code>sing-box run -c ./fibez-config.json</code>
                <button
                  type="button"
                  onClick={() => copyToClipboard('sing-box run -c ./fibez-config.json', 'c1')}
                  className="text-[#8e87aa] hover:text-white"
                >
                  {copiedCode === 'c1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </section>

          {/* Section 4: Cloud VPS Hardening */}
          <section id="vps-hardening" className="p-6 rounded-[20px] bg-[#0c0919] border border-[#231e38] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#17122b] border border-[#2d234d] flex items-center justify-center text-[#9281f7]">
                <Server className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-medium text-white">4. Cloud VPS: Ubuntu 24.04 Initial Hardening</h2>
            </div>
            <p className="text-xs text-[#8e87aa] leading-relaxed">
              Once you claim your root SSH credentials in the Key Vault, execute these initial security hardening commands:
            </p>
            <div className="p-3.5 rounded-[12px] bg-black/60 border border-white/5 font-mono text-xs text-zinc-300 space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded bg-[#07050d] border border-[#231e38]">
                <code>sudo apt update && sudo apt upgrade -y && sudo ufw allow 22 && sudo ufw enable</code>
                <button
                  type="button"
                  onClick={() => copyToClipboard('sudo apt update && sudo apt upgrade -y && sudo ufw allow 22 && sudo ufw enable', 'c2')}
                  className="text-[#8e87aa] hover:text-white"
                >
                  {copiedCode === 'c2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </section>

          {/* Section 5: FAQs */}
          <section id="faq" className="p-6 rounded-[20px] bg-[#0c0919] border border-[#231e38] space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-[8px] bg-[#17122b] border border-[#2d234d] flex items-center justify-center text-[#9281f7]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-medium text-white">5. Frequently Asked Questions</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-[12px] bg-[#120e24] border border-[#261f42]">
                <div className="font-semibold text-white mb-1">How fast are licenses and credentials delivered?</div>
                <p className="text-[#8e87aa]">
                  Fulfillment is 100% automated via our zero-trust pipeline. Once payment is confirmed, payload keys are minted and available in your Key Vault in under 400 milliseconds.
                </p>
              </div>

              <div className="p-3.5 rounded-[12px] bg-[#120e24] border border-[#261f42]">
                <div className="font-semibold text-white mb-1">What payment methods are supported?</div>
                <p className="text-[#8e87aa]">
                  We accept Automated Online Card Payments (Visa/Mastercard), Cryptocurrencies (USDT TRC20, TON, Bitcoin), and Sri Lankan Local Bank Transfers with instant slip upload verification.
                </p>
              </div>

              <div className="p-3.5 rounded-[12px] bg-[#120e24] border border-[#261f42]">
                <div className="font-semibold text-white mb-1">What happens if a node or account credentials degrade?</div>
                <p className="text-[#8e87aa]">
                  Every active subscription includes a 100% replacement guarantee. You can trigger an automated replacement key directly inside your Key Vault console.
                </p>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
