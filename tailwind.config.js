/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
      },
      boxShadow: {
        cta: "0 4px 14px 0 rgba(15, 118, 110, 0.35)",
        "cta-dark": "0 4px 14px 0 rgba(245, 158, 11, 0.35)",
      },
      typography: ({ theme }: any) => ({
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "inherit",
            a: {
              color: "var(--primary)",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              textDecorationThickness: "2px",
              fontWeight: "600",
              "&:hover": {
                opacity: "0.85",
                textDecorationColor: "var(--primary)",
              },
            },
            "h1, h2, h3, h4, h5, h6": {
              color: "inherit",
              fontWeight: "700",
              letterSpacing: "-0.025em",
            },
            strong: {
              color: "inherit",
              fontWeight: "700",
            },
            "thead th": {
              fontSize: "0.75rem",
              fontWeight: "700",
              textTransform: "uppercase" as const,
              letterSpacing: "0.05em",
              paddingBottom: "0.75rem",
            },
            blockquote: {
              borderLeftColor: "var(--primary)",
              fontStyle: "italic",
              color: "inherit",
            },
            code: {
              color: "var(--primary)",
              fontWeight: "600",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            pre: {
              backgroundColor: "#0d1117",
              color: "#e6edf3",
              borderRadius: "12px",
              padding: "1.5rem",
              overflowX: "auto",
            },
            table: {
              width: "100%",
              marginTop: "2em",
              marginBottom: "2em",
              borderCollapse: "collapse",
            },
            "th, td": {
              borderColor: "var(--border)",
              padding: "0.75rem 1rem",
            },
            th: {
              fontWeight: "700",
              textAlign: "left" as const,
            },
          },
        },
        invert: {
          css: {
            color: "inherit",
            strong: {
              color: "inherit",
            },
            "h1, h2, h3, h4, h5, h6": {
              color: "inherit",
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};