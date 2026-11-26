import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store-context";
import ClientLayout from "@/components/ClientLayout";
import MotionManager from "@/components/MotionManager";
import { MOTION_BOOT_SCRIPT } from "@/lib/motion-boot";

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

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

export const metadata: Metadata = {
  metadataBase:
    appUrl && (appUrl.startsWith("http://") || appUrl.startsWith("https://"))
      ? new URL(appUrl)
      : new URL("https://fibez.store"),
  title: {
    default: "Fibez — High Speed Digital Store & V2Ray Hub",
    template: "%s | Fibez",
  },
  description:
    "Instant digital store for High-Speed VLESS VPN (SLT, Dialog, Hutch & Airtel), gift cards, game top-ups, streaming accounts, and software keys delivered in seconds.",
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Fibez",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Fibez" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Applies the remembered animation level (Admin -> Optimization) before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT_SCRIPT }} />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-black text-[#f0f0f0] font-sans selection:bg-white selection:text-black"
      >
        <StoreProvider>
          <Suspense fallback={null}>
            <MotionManager>
              <ClientLayout>
                {children}
              </ClientLayout>
            </MotionManager>
          </Suspense>
        </StoreProvider>
      </body>
    </html>
  );
}
