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

// Default metadata for non-user pages
const defaultMetadata = {
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
};

// Default Open Graph image (for non-user pages)
const defaultOpenGraphImage = "https://res.cloudinary.com/dckndb9ux/image/upload/v1761344574/Screenshot_2025-10-24_212856_lt4hdq.png";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...defaultMetadata,
    openGraph: {
      title: "PortfolioHub",
      description: defaultMetadata.description,
      url: "https://your-domain.com/",
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
      description: defaultMetadata.description,
      images: [defaultOpenGraphImage],
    },
  };
}

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