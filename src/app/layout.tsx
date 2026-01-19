import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar"; 
// Removed PageNavigation import
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nilay Naha | Software Developer",
  description: "Portfolio of Nilay Naha, a Software Developer specializing in AI/ML.",
  icons: {
    icon: [
      { url: '/icon-light.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark.png', media: '(prefers-color-scheme: dark)' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            {/* PageNavigation was removed from here to fix UI overlap */}
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}