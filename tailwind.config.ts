// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Ensure dark mode works for the blog
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6", // Replace with your portfolio's primary color
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // Optional: Customize typography for Reading Mode
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100ch', // Better readability
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"), // CRITICAL: This styles your blog content
  ],
};

export default config;