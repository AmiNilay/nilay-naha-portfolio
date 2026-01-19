import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar"; 
import PageNavigation from "@/components/layout/PageNavigation"; // Put this back
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            <PageNavigation /> {/* Restores the dots on the right */}
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}