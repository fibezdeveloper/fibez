'use client';

import React from 'react';

const TESTIMONIALS = [
  {
    quote: "Fibez has completely replaced our manual VPS and proxy provisioning pipeline. We trigger the API from our CI/CD and have high-performance V2Ray nodes operational in less than half a second.",
    author: "Malith Fernando",
    role: "Lead DevOps Engineer at CloudEdge",
    avatarInitials: "MF",
  },
  {
    quote: "The zero-trust key vault is immaculate. No more waiting around on Telegram or WhatsApp for sellers to send account logins. Instant delivery with warranty backing is revolutionary for our team.",
    author: "Naveen Perera",
    role: "Backend Architect & Indie Hacker",
    avatarInitials: "NP",
  },
  {
    quote: "The V2Ray Reality nodes bypass our local ISP traffic shaping effortlessly. Ping to Singapore dropped from 180ms to 24ms. It's the most reliable network connection we've ever used.",
    author: "Dinuka Jayasuriya",
    role: "Infrastructure Lead at SysMatrix",
    avatarInitials: "DJ",
  },
];

export default function Testimonials() {
  return (
    <section id="reviews" className="w-full py-24 bg-black border-t border-[#292d30]">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Section Headline */}
        <div className="max-w-2xl mb-16">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#9281f7] mb-3">
            Real Experience
          </div>
          <h2 className="text-[40px] sm:text-[56px] font-normal leading-[1.12] tracking-[-0.05em] text-white">
            Built for developers who value speed.
          </h2>
        </div>

        {/* Testimonial Cards Grid: 16px radius, 1px #292d30 border */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={idx}
              className="resend-card p-8 flex flex-col justify-between"
            >
              <p className="text-[15px] sm:text-[16px] leading-[1.6] text-[#f0f0f0] mb-8 font-normal">
                "{item.quote}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-[#1f2224]">
                <div className="w-8 h-8 rounded-full border border-[#292d30] bg-[#141618] flex items-center justify-center font-mono text-xs text-[#f0f0f0] font-medium shrink-0">
                  {item.avatarInitials}
                </div>
                <div>
                  <div className="text-[14px] font-medium text-white">
                    {item.author}
                  </div>
                  <div className="text-[12px] text-[#a1a4a5]">
                    {item.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
