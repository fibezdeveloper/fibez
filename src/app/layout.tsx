import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store-context";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Fibez — Automated Digital Goods & Subscription Marketplace",
  description:
    "The digital delivery engine for developers. Instant automated provisioning for V2Ray VPN configurations, Cloud VPS instances, subscriptions, and game keys.",
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
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} dark antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-black text-[#f0f0f0] font-sans selection:bg-[#9281f7] selection:text-black"
      >
        <StoreProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
