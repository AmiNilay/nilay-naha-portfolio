import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar"; 
import PageNavigation from "@/components/layout/PageNavigation"; 
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

// --- UPDATED METADATA ---
export const metadata: Metadata = {
  title: "Nilay Naha | Software Developer",
  description: "Portfolio of Nilay Naha, a Software Developer specializing in AI/ML.",
  icons: {
    icon: [
      // Light Mode Icon (Teal background)
      { url: '/icon-light.png', media: '(prefers-color-scheme: light)' },
      // Dark Mode Icon (Amber/Dark background)
      { url: '/icon-dark.png', media: '(prefers-color-scheme: dark)' },
    ],
    // Fallback for older browsers
    shortcut: '/favicon.ico',
    // Apple Touch Icon (iPhone home screen)
    apple: '/apple-icon.png',
  },
};
// ------------------------

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
            <PageNavigation />
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}