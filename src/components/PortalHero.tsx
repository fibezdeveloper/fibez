'use client';

import React, { useEffect, useRef } from 'react';
import SpinningGlobeCanvas from './SpinningGlobeCanvas';
import { FibezMonogram } from './FibezLogo';
import Link from 'next/link';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

export default function PortalHero() {
  const scrollTrackRef = useRef<HTMLElement | null>(null);
  const tileAnchorRef = useRef<HTMLDivElement | null>(null);
  const portalTileRef = useRef<HTMLDivElement | null>(null);
  const portalFzGlyphRef = useRef<SVGSVGElement | null>(null);
  const heroCopyLayerRef = useRef<HTMLDivElement | null>(null);
  const heroScrollIndicatorRef = useRef<HTMLDivElement | null>(null);
  const limePortalContentRef = useRef<HTMLDivElement | null>(null);
  const limePortalInnerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function updateCleanPortalZoom() {
      const scrollTrack = scrollTrackRef.current;
      const tileAnchor = tileAnchorRef.current;
      const portalTile = portalTileRef.current;
      const portalFzGlyph = portalFzGlyphRef.current;
      const heroCopyLayer = heroCopyLayerRef.current;
      const heroScrollIndicator = heroScrollIndicatorRef.current;
      const limePortalContent = limePortalContentRef.current;
      const limePortalInner = limePortalInnerRef.current;

      if (!scrollTrack || !tileAnchor || !portalTile || !portalFzGlyph || !heroCopyLayer || !heroScrollIndicator || !limePortalContent || !limePortalInner) {
        return;
      }

      const trackRect = scrollTrack.getBoundingClientRect();
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      const rawProgress = -trackRect.top / Math.max(maxScroll, 1);
      const p = Math.min(Math.max(rawProgress, 0), 1);

      if (rawProgress > 1.02) {
        portalTile.style.display = 'none';
        limePortalContent.style.display = 'none';
        return;
      } else {
        portalTile.style.display = 'flex';
        limePortalContent.style.display = 'flex';
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const anchorRect = tileAnchor.getBoundingClientRect();
      const baseCx = anchorRect.left + anchorRect.width / 2;
      const baseCy = anchorRect.top + anchorRect.height / 2;

      // Fade out initial FIBEZ 'FZ' glyph and hero headline as expansion starts
      portalFzGlyph.style.opacity = Math.max(0, 1 - p / 0.10).toFixed(3);
      heroCopyLayer.style.opacity = Math.max(0, 1 - (p - 0.03) / 0.20).toFixed(3);
      heroScrollIndicator.style.opacity = Math.max(0, 1 - p / 0.08).toFixed(3);

      let w: number;
      let h: number;
      let cx: number;
      let cy: number;
      let radius: number;

      if (p <= 0.25) {
        // PHASE 1: 72x72px square tile morphs into 240x300px rectangle
        const t = p / 0.25;
        const ease = t * t * (3 - 2 * t);
        w = lerp(72, 240, ease);
        h = lerp(72, 300, ease);
        cx = lerp(baseCx, vw * 0.5, ease);
        cy = lerp(baseCy, vh * 0.54, ease);
        radius = lerp(4, 2, ease);
      } else if (p <= 0.58) {
        // PHASE 2: Cleanly expands from 240x300px to 100vw x 100vh full screen
        const t = (p - 0.25) / 0.33;
        const ease = Math.pow(t, 1.65);
        w = lerp(240, vw, ease);
        h = lerp(300, vh, ease);
        cx = vw * 0.5;
        cy = lerp(vh * 0.54, vh * 0.5, ease);
        radius = lerp(2, 0, ease);
      } else {
        // PHASE 3: Locked at 100vw x 100vh while statement copy fades in
        w = vw;
        h = vh;
        cx = vw * 0.5;
        cy = vh * 0.5;
        radius = 0;
      }

      portalTile.style.width = `${w.toFixed(1)}px`;
      portalTile.style.height = `${h.toFixed(1)}px`;
      portalTile.style.left = `${(cx - w / 2).toFixed(1)}px`;
      portalTile.style.top = `${(cy - h / 2).toFixed(1)}px`;
      portalTile.style.borderRadius = `${radius.toFixed(1)}px`;

      // Cross-fade in the statement content
      if (p > 0.56) {
        const contentAlpha = Math.min(1, (p - 0.56) / 0.20);
        limePortalContent.style.opacity = contentAlpha.toFixed(3);
        limePortalContent.style.pointerEvents = contentAlpha > 0.8 ? 'auto' : 'none';
        const ty = (1 - contentAlpha) * 22;
        limePortalInner.style.transform = `translateY(${ty.toFixed(1)}px)`;
      } else {
        limePortalContent.style.opacity = '0';
        limePortalContent.style.pointerEvents = 'none';
      }
    }

    window.addEventListener('scroll', updateCleanPortalZoom, { passive: true });
    window.addEventListener('resize', updateCleanPortalZoom);
    updateCleanPortalZoom();

    return () => {
      window.removeEventListener('scroll', updateCleanPortalZoom);
      window.removeEventListener('resize', updateCleanPortalZoom);
    };
  }, []);

  return (
    <section id="hero-scroll-track" ref={scrollTrackRef} className="relative w-full h-[300vh] -mt-[56px]">
      {/* Sticky 100vh Viewport */}
      <div id="hero-sticky-viewport" className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-carbon">
        
        {/* Layer 1: Real-Time Spinning 3D Cyber Dotted Globe Canvas */}
        <SpinningGlobeCanvas />

        {/* Layer 2: Hero Headline & Subtext */}
        <div
          id="hero-copy-layer"
          ref={heroCopyLayerRef}
          className="relative z-10 flex flex-col items-center text-center px-4 max-w-[960px] mx-auto -mt-10 pointer-events-none select-none"
        >
          <div className="metadata-stamp mb-5">
            [ &nbsp; AUTOMATED DIGITAL GOODS &amp; SUBSCRIPTION MARKETPLACE &nbsp; ]
          </div>
          <h1 className="font-editorial text-chalk text-[46px] sm:text-[68px] md:text-[89px] leading-[0.94] tracking-[-0.03em] mb-6">
            Instant Digital Delivery<br />
            for the <span className="italic text-signalLime font-normal">Autonomous Web.</span>
          </h1>
          <p className="font-sans text-[13px] sm:text-[14px] text-bone/90 leading-[1.6] tracking-[0.02em] max-w-[540px] mx-auto">
            Browse, purchase, and instantly receive V2Ray/VPN configurations, NVMe Cloud VPS instances, premium subscriptions (Netflix, ChatGPT, Discord Nitro), and game keys — governed by a role-based command dashboard.
          </p>
          {/* Placeholder anchor where the 72x72px FIBEZ logo tile sits at scroll=0 */}
          <div id="tile-anchor" ref={tileAnchorRef} className="w-[72px] h-[72px] mt-8" />
        </div>

        {/* Bottom Center Scroll Indicator */}
        <div
          id="hero-scroll-indicator"
          ref={heroScrollIndicatorRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 font-mono text-[10px] tracking-[0.24em] text-ash uppercase flex items-center gap-3 select-none"
        >
          <span>·</span>
          <span>SCROLL TO EXPAND PORTAL</span>
          <span>·</span>
        </div>

        {/* Layer 3: SINGLE SOLID RECTANGULAR PORTAL TILE */}
        <div
          id="portal-rect-tile"
          ref={portalTileRef}
          className="fixed z-20 flex items-center justify-center overflow-hidden pointer-events-none rounded-[4px]"
        >
          <FibezMonogram
            id="portal-fz-glyph"
            ref={portalFzGlyphRef as any}
            className="w-11 h-11 text-voidBlack shrink-0 transition-opacity duration-75"
          />
        </div>

        {/* Layer 4: Flooded Signal Lime Section Content */}
        <div
          id="lime-portal-content"
          ref={limePortalContentRef}
          className="fixed inset-0 z-30 flex flex-col items-center justify-center text-center px-4 bg-dot-matrix-lime opacity-0 pointer-events-none"
        >
          <div id="lime-portal-inner" ref={limePortalInnerRef} className="max-w-[920px] mx-auto">
            <div className="font-sans text-[10px] font-medium uppercase tracking-[0.24em] text-voidBlack/75 mb-6">
              [ &nbsp; ZERO-LATENCY FULFILLMENT ENGINE &nbsp; ]
            </div>

            <h2 className="font-editorial text-voidBlack text-[42px] sm:text-[62px] md:text-[78px] leading-[1.02] tracking-[-0.025em] mb-6">
              Turns digital stock into <span className="italic">instant automated delivery</span><br />
              across buyers and <span className="italic">resellers.</span>
            </h2>

            <p className="font-sans text-[13px] sm:text-[14px] text-voidBlack/80 leading-[1.6] tracking-[0.02em] max-w-[560px] mx-auto mb-10">
              VLESS-Reality tunnels, KVM root Cloud VPS, Netflix/ChatGPT/Nitro seats, and global game keys dispatched from encrypted stock pools in under 380ms.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="#storefront-grid"
                className="bg-voidBlack text-chalk hover:bg-onyx font-sans text-[11px] font-semibold uppercase tracking-[0.22em] px-7 py-4 rounded-[4px] flex items-center gap-3 transition-transform active:scale-95"
              >
                <span>BROWSE MARKETPLACE</span>
                <span className="font-mono text-xs">↗</span>
              </a>
              <a
                href="#rbac-console"
                className="border border-voidBlack/75 text-voidBlack hover:bg-voidBlack/10 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] px-7 py-4 rounded-[4px] flex items-center gap-3 transition-transform active:scale-95"
              >
                <span>OPEN RBAC DASHBOARD</span>
                <span className="font-mono text-xs">→</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
