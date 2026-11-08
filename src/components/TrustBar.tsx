import React from 'react';

export default function TrustBar() {
  return (
    <section className="w-full border-y border-[#292d30] py-10 bg-black">
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-[#6e727a] mb-8">
          Enterprise infrastructure trusted by developers worldwide
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center justify-items-center opacity-60 hover:opacity-100 transition-opacity">
          
          {/* Cloudflare */}
          <div className="flex items-center gap-2 text-[#f0f0f0]">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.6.1 2.78 1.44 2.78 2.96 0 1.65-1.35 3-3 3z"/>
            </svg>
            <span className="font-mono text-sm tracking-wider font-medium">CLOUDFLARE</span>
          </div>

          {/* DigitalOcean */}
          <div className="flex items-center gap-2 text-[#f0f0f0]">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 0C5.408 0 .04 5.367.04 12c0 3.633 1.621 6.892 4.192 9.083l3.29-3.29a7.355 7.355 0 0 1-2.047-5.793c0-4.067 3.298-7.365 7.365-7.365 4.067 0 7.365 3.298 7.365 7.365 0 4.067-3.298 7.365-7.365 7.365v4.56c6.633 0 12-5.367 12-12 0-6.633-5.367-12-12-12zm-3.52 17.515H4.88v3.64h3.64v-3.64zm0-4.32H5.6v3.6h2.92v-3.6z"/>
            </svg>
            <span className="font-mono text-sm tracking-wider font-medium">DIGITALOCEAN</span>
          </div>

          {/* Hetzner */}
          <div className="flex items-center gap-2 text-[#f0f0f0]">
            <span className="w-5 h-5 rounded-[4px] border border-[#f0f0f0] flex items-center justify-center font-bold text-xs">H</span>
            <span className="font-mono text-sm tracking-wider font-medium">HETZNER</span>
          </div>

          {/* AWS */}
          <div className="flex items-center gap-2 text-[#f0f0f0]">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.75 14.25c-.27 0-.54.03-.8.1-.48-1.52-1.92-2.6-3.62-2.6-.96 0-1.84.34-2.52.92-.68-.58-1.56-.92-2.52-.92-1.7 0-3.14 1.08-3.62 2.6-.26-.07-.53-.1-.8-.1-2.07 0-3.75 1.68-3.75 3.75S2.82 21.75 4.89 21.75h13.86c2.07 0 3.75-1.68 3.75-3.75s-1.68-3.75-3.75-3.75z"/>
            </svg>
            <span className="font-mono text-sm tracking-wider font-medium">AWS NEON</span>
          </div>

          {/* Stripe */}
          <div className="flex items-center gap-1.5 text-[#f0f0f0]">
            <span className="font-serif italic font-bold text-lg">stripe</span>
            <span className="font-mono text-xs tracking-wider text-[#a1a4a5]">PAY</span>
          </div>

          {/* GitHub */}
          <div className="flex items-center gap-2 text-[#f0f0f0]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span className="font-mono text-sm tracking-wider font-medium">GITHUB</span>
          </div>

        </div>
      </div>
    </section>
  );
}
