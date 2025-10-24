import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PortfolioHub",
    template: "%s | PortfolioHub",
  },
  description: "Showcase your projects and skills with PortfolioHub, a modern portfolio platform.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "PortfolioHub",
    description: "Showcase your projects and skills with PortfolioHub, a modern portfolio platform.",
    url: "https://your-domain.com/",
    siteName: "PortfolioHub",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "PortfolioHub Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PortfolioHub",
    description: "Showcase your projects and skills with PortfolioHub, a modern portfolio platform.",
    images: ["/favicon.png"],
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
        <Navbar/>
        {children}
      </body>
    </html>
  );
}
