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
        'cta': '0 4px 14px 0 rgba(15, 118, 110, 0.35)',
        'cta-dark': '0 4px 14px 0 rgba(245, 158, 11, 0.35)',
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            maxWidth: '100ch',
            color: 'var(--foreground)',
            a: {
              color: 'var(--primary)',
              textDecoration: 'none',
              fontWeight: '600',
              '&:hover': {
                textDecoration: 'underline',
                color: 'var(--primary-hover)',
              },
            },
            'h1, h2, h3, h4': {
              color: 'var(--foreground)',
              fontWeight: '700',
              letterSpacing: '-0.025em',
            },
            blockquote: {
              borderLeftColor: 'var(--primary)',
              backgroundColor: 'var(--muted)',
              padding: '1rem',
              fontStyle: 'italic',
              borderRadius: '0.5rem',
              color: 'var(--foreground)',
            },
            code: {
              color: 'var(--primary)',
              backgroundColor: 'var(--muted)',
              padding: '0.2rem 0.4rem',
              borderRadius: '0.25rem',
              fontWeight: '600',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#111827', // Dark background for code blocks
              color: '#f3f4f6',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              overflowX: 'auto',
            },
            table: {
              width: '100%',
              marginTop: '2em',
              marginBottom: '2em',
              borderCollapse: 'collapse',
            },
            'th, td': {
              borderColor: 'var(--border)',
              padding: '0.75rem',
            },
            th: {
              backgroundColor: 'var(--muted)',
              fontWeight: '600',
              textAlign: 'left',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
