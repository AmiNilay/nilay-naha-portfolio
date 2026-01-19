"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// FIX: We remove the broken import and infer props directly from the component.
// This works on ALL versions of next-themes.
export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}