import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import PageNavigation from "@/components/layout/PageNavigation";
import CustomCursor from "@/components/ui/CustomCursor";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://nilay-naha-portfolio.vercel.app";
const SITE_NAME = "Nilay Naha - Software Developer";
const SITE_DESCRIPTION =
  "Nilay Naha — Software Developer (Python) building secure REST APIs, backend systems, and full-stack apps with FastAPI, Node.js, MongoDB, and Next.js.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s | Nilay Naha",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Nilay Naha",
    "Software Developer",
    "Python Developer",
    "Backend Developer",
    "FastAPI",
    "Node.js",
    "MongoDB",
    "Next.js",
    "Portfolio",
    "Full Stack Developer",
  ],
  authors: [{ name: "Nilay Naha", url: SITE_URL }],
  creator: "Nilay Naha",
  publisher: "Nilay Naha",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nilay Naha - Software Developer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@nilay_naha",
  },
  icons: {
    icon: [
      { url: "/icon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CustomCursor />
          <Navbar />
          <PageNavigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}