"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// FIX: Instead of importing "ThemeProviderProps", we infer it directly from the component.
// This prevents the "Cannot find module" error.
export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}