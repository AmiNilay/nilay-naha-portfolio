import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import PageNavigation from "@/components/layout/PageNavigation";
import CustomCursor from "@/components/ui/CustomCursor";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

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