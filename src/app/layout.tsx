import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import "../index.css";
import { SITE_URL } from "../site.ts";

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});
const sans = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-inter-tight",
  display: "swap",
});

const description =
  "A year, in days: what is spent and what is left. No accounts. Nothing saved.";
const imageAlt =
  "Perspective: a year drawn as a row of day ticks on near-black.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Perspective — The time still left",
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Perspective",
    title: "Perspective — The time still left",
    description,
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: imageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Perspective — The time still left",
    description,
    images: [{ url: "/og.png", alt: imageAlt }],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
