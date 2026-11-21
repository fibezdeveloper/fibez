'use client';

import { useSiteFlag } from '@/lib/use-site-flags';
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
import TechText from '@/components/TechText';
import { FaqAccordion } from '@/components/ui/FaqAccordion';
import { EncryptedText } from '@/components/ui/encrypted-text';
import { cn } from '@/lib/utils';

export default function DocsPage() {
  const whatsappOn = useSiteFlag('whatsapp');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'v2ray-android': true,
    'v2ray-ios': false,
    'v2ray-windows': false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
      <div className="mb-12 pb-8 border-b border-[#1f1f23]">
        <div className="font-mono text-xs uppercase tracking-[0.2em] mb-2">
          <EncryptedText
            text="Knowledge Base & Client Tutorials"
            encryptedClassName="text-zinc-600"
            revealedClassName="text-[#3ad389]"
            revealDelayMs={30}
          />
        </div>
        <div className="h-[48px] sm:h-[60px] w-full max-w-[680px] relative -ml-1">
          <h1 className="sr-only">Client Configuration & Deployment Guides</h1>
          <TechText
            text="Client Configuration & Deployment Guides"
            align="left"
            fontWeight={700}
            fontSize={38}
            color="#ffffff"
            accentColor="#3ad389"
            reveal="letter"
            dashLength={4}
            dashGap={2}
            specks={14}
            intro="none"
            clickKick
            guides={false}
          />
        </div>
        <p className="text-sm text-[#a1a4a5] mt-2 max-w-2xl leading-relaxed">
          Step-by-step setup guides for NetMod Syna (Windows/Android), v2rayNG (Android), Shadowrocket (iOS), and product activation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-4 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-white">Quick Jump</div>
            <nav className="flex flex-col space-y-2 text-xs font-mono text-[#a1a4a5]">
              <a
                href="#v2ray-android"
                onClick={() => setOpenSections((prev) => ({ ...prev, 'v2ray-android': true }))}
                className="hover:text-white transition-colors"
              >
                1. Android (v2rayNG)
              </a>
              <a
                href="#v2ray-ios"
                onClick={() => setOpenSections((prev) => ({ ...prev, 'v2ray-ios': true }))}
                className="hover:text-white transition-colors"
              >
                2. iOS (Shadowrocket / Streisand)
              </a>
              <a
                href="#v2ray-windows"
                onClick={() => setOpenSections((prev) => ({ ...prev, 'v2ray-windows': true }))}
                className="hover:text-white transition-colors"
              >
                3. Windows &amp; Android (NetMod)
              </a>
              <a href="#faq" className="hover:text-white transition-colors">
                4. Frequently Asked Questions
              </a>
            </nav>
          </div>

          <div className="p-4 rounded-[16px] bg-[#141417] border border-[#1f1f23] text-xs font-mono space-y-2">
            <div className="text-white font-medium flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
              <span>Need Direct Assistance?</span>
            </div>
            <p className="text-[#a1a4a5] leading-relaxed">
              Our infrastructure engineers are online 24/7 on WhatsApp and Discord.
            </p>
            <div className="pt-1 flex flex-col gap-1.5">
              {whatsappOn && (
                <a
                  href="https://wa.me/94771234567"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white hover:underline flex items-center justify-between"
                >
                  <span>WhatsApp Engineer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <a
                href="https://discord.gg/fibez"
                target="_blank"
                rel="noreferrer"
                className="text-white hover:underline flex items-center justify-between"
              >
                <span>Discord Community</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Section 1: Android Setup */}
          <section id="v2ray-android" className="rounded-2xl overflow-hidden border border-white/10 bg-[#0c0c0e]/80 shadow-xl">
            <button
              type="button"
              onClick={() => toggleSection('v2ray-android')}
              className={cn(
                "flex items-center justify-between w-full py-4 px-5 relative cursor-pointer text-left outline-none",
                "border-l-[6px] md:border-l-[8px] transition-all duration-200",
                openSections['v2ray-android']
                  ? "border-l-[#3ad389] bg-[#3ad389]/[0.08] text-white font-semibold"
                  : "border-l-[#1f1f26] bg-transparent text-zinc-300 hover:border-l-zinc-500 hover:text-white hover:bg-white/[0.02]"
              )}
              aria-expanded={openSections['v2ray-android']}
            >
              <div className="flex items-center gap-3.5 pl-2">
                <div className="w-8 h-8 rounded-lg bg-[#16161a] border border-[#26262b] flex items-center justify-center text-white shrink-0">
                  <Smartphone className="w-4 h-4 text-[#3ad389]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-medium text-white flex items-center gap-2 flex-wrap">
                    <span>1. Android: v2rayNG Setup</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                      Recommended for Mobile
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5 font-normal">
                    Native VLESS reality protocol support &amp; automatic latency testing
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 pr-2">
                <span className={cn(
                  "text-xl sm:text-2xl font-light select-none leading-none",
                  openSections['v2ray-android'] ? "text-[#3ad389]" : "text-zinc-500"
                )}>
                  {openSections['v2ray-android'] ? "−" : "+"}
                </span>
                <span className={cn(
                  "block w-2 h-2 border-t-2 border-r-2 transition-transform duration-200 ease-in-out shrink-0",
                  openSections['v2ray-android'] ? "rotate-[-45deg] border-[#3ad389] translate-y-0.5" : "rotate-[135deg] border-zinc-500 -translate-y-0.5"
                )} />
              </div>
            </button>

            <div className={cn(
              "grid transition-all duration-300 ease-in-out w-full border-l-[6px] md:border-l-[8px]",
              openSections['v2ray-android'] ? "grid-rows-[1fr] border-l-[#3ad389] bg-[#3ad389]/[0.02]" : "grid-rows-[0fr] border-l-transparent bg-transparent"
            )}>
              <div className="overflow-hidden">
                <div className="p-5 sm:p-6 pt-3 space-y-4 text-xs border-t border-white/[0.06]">
                  <p className="text-[#a1a4a5] leading-relaxed">
                    v2rayNG is the recommended open-source Android client with native VLESS protocol support and automatic latency testing.
                  </p>
                  <ol className="list-decimal list-inside text-xs text-zinc-300 space-y-2.5 font-mono">
                    <li>Download <strong>v2rayNG</strong> from Google Play Store or GitHub releases.</li>
                    <li>Go to your Fibez <Link href="/vault" className="text-white underline hover:text-[#3ad389]">Key Vault</Link> and copy your VLESS URI or open the QR code.</li>
                    <li>Open v2rayNG, tap the <strong>+</strong> button at top right, and select <strong>Import config from Clipboard</strong> (or Scan QR Code).</li>
                    <li>Tap the newly imported node and tap the floating <strong>V</strong> circle at the bottom right to connect.</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: iOS Setup */}
          <section id="v2ray-ios" className="rounded-2xl overflow-hidden border border-white/10 bg-[#0c0c0e]/80 shadow-xl">
            <button
              type="button"
              onClick={() => toggleSection('v2ray-ios')}
              className={cn(
                "flex items-center justify-between w-full py-4 px-5 relative cursor-pointer text-left outline-none",
                "border-l-[6px] md:border-l-[8px] transition-all duration-200",
                openSections['v2ray-ios']
                  ? "border-l-[#3ad389] bg-[#3ad389]/[0.08] text-white font-semibold"
                  : "border-l-[#1f1f26] bg-transparent text-zinc-300 hover:border-l-zinc-500 hover:text-white hover:bg-white/[0.02]"
              )}
              aria-expanded={openSections['v2ray-ios']}
            >
              <div className="flex items-center gap-3.5 pl-2">
                <div className="w-8 h-8 rounded-lg bg-[#16161a] border border-[#26262b] flex items-center justify-center text-white shrink-0">
                  <Smartphone className="w-4 h-4 text-[#3ad389]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-medium text-white flex items-center gap-2 flex-wrap">
                    <span>2. iOS: Shadowrocket &amp; Streisand Setup</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                      iPhone &amp; iPad
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5 font-normal">
                    High-speed TLS masquerade routing &amp; automated clipboard detection
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 pr-2">
                <span className={cn(
                  "text-xl sm:text-2xl font-light select-none leading-none",
                  openSections['v2ray-ios'] ? "text-[#3ad389]" : "text-zinc-500"
                )}>
                  {openSections['v2ray-ios'] ? "−" : "+"}
                </span>
                <span className={cn(
                  "block w-2 h-2 border-t-2 border-r-2 transition-transform duration-200 ease-in-out shrink-0",
                  openSections['v2ray-ios'] ? "rotate-[-45deg] border-[#3ad389] translate-y-0.5" : "rotate-[135deg] border-zinc-500 -translate-y-0.5"
                )} />
              </div>
            </button>

            <div className={cn(
              "grid transition-all duration-300 ease-in-out w-full border-l-[6px] md:border-l-[8px]",
              openSections['v2ray-ios'] ? "grid-rows-[1fr] border-l-[#3ad389] bg-[#3ad389]/[0.02]" : "grid-rows-[0fr] border-l-transparent bg-transparent"
            )}>
              <div className="overflow-hidden">
                <div className="p-5 sm:p-6 pt-3 space-y-4 text-xs border-t border-white/[0.06]">
                  <p className="text-[#a1a4a5] leading-relaxed">
                    For iPhone &amp; iPad devices, Shadowrocket and Streisand provide high-speed TLS masquerade routing.
                  </p>
                  <ol className="list-decimal list-inside text-xs text-zinc-300 space-y-2.5 font-mono">
                    <li>Install <strong>Shadowrocket</strong> or <strong>Streisand</strong> from the App Store.</li>
                    <li>Copy your VLESS configuration key from the <Link href="/vault" className="text-white underline hover:text-[#3ad389]">Key Vault</Link>.</li>
                    <li>When opening Shadowrocket, it will automatically detect the clipboard string and prompt to add it. Tap <strong>Save</strong>.</li>
                    <li>Toggle the connection switch to <strong>ON</strong>. Allow iOS VPN permissions if prompted.</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Windows & Mac Setup */}
          <section id="v2ray-windows" className="rounded-2xl overflow-hidden border border-white/10 bg-[#0c0c0e]/80 shadow-xl">
            <button
              type="button"
              onClick={() => toggleSection('v2ray-windows')}
              className={cn(
                "flex items-center justify-between w-full py-4 px-5 relative cursor-pointer text-left outline-none",
                "border-l-[6px] md:border-l-[8px] transition-all duration-200",
                openSections['v2ray-windows']
                  ? "border-l-[#3ad389] bg-[#3ad389]/[0.08] text-white font-semibold"
                  : "border-l-[#1f1f26] bg-transparent text-zinc-300 hover:border-l-zinc-500 hover:text-white hover:bg-white/[0.02]"
              )}
              aria-expanded={openSections['v2ray-windows']}
            >
              <div className="flex items-center gap-3.5 pl-2">
                <div className="w-8 h-8 rounded-lg bg-[#16161a] border border-[#26262b] flex items-center justify-center text-white shrink-0">
                  <Laptop className="w-4 h-4 text-[#3ad389]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-medium text-white flex items-center gap-2 flex-wrap">
                    <span>3. Windows &amp; macOS: Sing-box &amp; v2rayN</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                      Desktop &amp; CLI
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5 font-normal">
                    Full system proxying &amp; per-app TUN routing for gaming and downloads
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 pr-2">
                <span className={cn(
                  "text-xl sm:text-2xl font-light select-none leading-none",
                  openSections['v2ray-windows'] ? "text-[#3ad389]" : "text-zinc-500"
                )}>
                  {openSections['v2ray-windows'] ? "−" : "+"}
                </span>
                <span className={cn(
                  "block w-2 h-2 border-t-2 border-r-2 transition-transform duration-200 ease-in-out shrink-0",
                  openSections['v2ray-windows'] ? "rotate-[-45deg] border-[#3ad389] translate-y-0.5" : "rotate-[135deg] border-zinc-500 -translate-y-0.5"
                )} />
              </div>
            </button>

            <div className={cn(
              "grid transition-all duration-300 ease-in-out w-full border-l-[6px] md:border-l-[8px]",
              openSections['v2ray-windows'] ? "grid-rows-[1fr] border-l-[#3ad389] bg-[#3ad389]/[0.02]" : "grid-rows-[0fr] border-l-transparent bg-transparent"
            )}>
              <div className="overflow-hidden">
                <div className="p-5 sm:p-6 pt-3 space-y-4 text-xs border-t border-white/[0.06]">
                  <p className="text-[#a1a4a5] leading-relaxed">
                    On desktop, Sing-box or v2rayN allows full system proxying or per-app TUN routing for gaming and torrenting.
                  </p>
                  <div className="p-3.5 rounded-[12px] bg-black/60 border border-white/5 font-mono text-xs text-zinc-300 space-y-2">
                    <div className="text-white font-semibold flex items-center justify-between">
                      <span>Sing-box CLI Quick Run:</span>
                      <span className="text-[10px] text-[#3ad389] font-mono">Cross-platform</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded bg-[#07050d] border border-[#1f1f23]">
                      <code>sing-box run -c ./fibez-config.json</code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('sing-box run -c ./fibez-config.json', 'c1')}
                        className="text-[#a1a4a5] hover:text-white p-1"
                        aria-label="Copy CLI command"
                      >
                        {copiedCode === 'c1' ? <Check className="w-3.5 h-3.5 text-[#3ad389]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: FAQs */}
          <section id="faq" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#16161a] border border-[#26262b] flex items-center justify-center text-[#3ad389]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-white">4. Frequently Asked Questions</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Quick answers regarding VLESS VPN protocol setup, payment, and node telemetry.</p>
              </div>
            </div>

            <FaqAccordion className="py-2" />
          </section>

        </div>

      </div>
    </div>
  );
}
