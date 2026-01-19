import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar"; 
import PageNavigation from "@/components/layout/PageNavigation"; 
// 1. Import the new Provider
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nilay Naha | Full Stack Developer",
  description: "Portfolio of Nilay Naha, specializing in AI, Python, and Web Development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 2. Wrap everything inside ThemeProvider */}
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <PageNavigation />
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}