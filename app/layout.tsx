// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import PwaInit from "@/components/PwaInit";
import { getSiteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultOpenGraphImage = "https://res.cloudinary.com/dckndb9ux/image/upload/v1761344574/Screenshot_2025-10-24_212856_lt4hdq.png";
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "PortfolioHub",
  title: {
    default: "PortfolioHub",
    template: "%s | PortfolioHub",
  },
  description: "Showcase your projects and skills with PortfolioHub, a modern portfolio platform.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PortfolioHub",
  },
  openGraph: {
    title: "PortfolioHub",
    description: "Showcase your projects and skills with PortfolioHub, a modern portfolio platform.",
    url: siteUrl,
    siteName: "PortfolioHub",
    images: [
      {
        url: defaultOpenGraphImage,
        width: 1200,
        height: 630,
        alt: "PortfolioHub - Showcase your projects and skills",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PortfolioHub",
    description: "Showcase your projects and skills with PortfolioHub, a modern portfolio platform.",
    images: [defaultOpenGraphImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PwaInit />
        <Navbar/>
        {children}
      </body>
    </html>
  );
}