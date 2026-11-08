import type { Metadata } from "next";
import { PT_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import InteractiveGridCanvas from "@/components/InteractiveGridCanvas";

const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fibez — Automated Digital Goods & Subscription Marketplace",
  description:
    "Zero-latency digital goods clearance vault. Instant access to V2Ray configs, Cloud VPS, premium developer tools, and game keys.",
  keywords: [
    "V2Ray configs",
    "VPN subscriptions",
    "Cloud VPS",
    "Software licenses",
    "Instant digital goods",
    "Fibez",
  ],
  icons: {
    icon: "/brand/fibez-logo-dark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ptSerif.variable} ${interTight.variable} ${jetbrainsMono.variable} dark antialiased`}
    >
      <body className="min-h-screen bg-[var(--color-carbon)] text-[var(--color-bone)] flex flex-col font-sans selection:bg-[var(--color-accent)] selection:text-black">
        <Providers>
          <InteractiveGridCanvas />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
