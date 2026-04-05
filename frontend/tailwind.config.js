/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-secondary": "var(--accent-secondary)",
        "accent-foreground": "var(--accent-foreground)",
        border: "var(--border)",
        card: "var(--card)",
        ring: "var(--ring)",
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Calistoga"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.06)',
        md: '0 4px 6px rgba(0,0,0,0.07)',
        lg: '0 10px 15px rgba(0,0,0,0.08)',
        xl: '0 20px 25px rgba(0,0,0,0.1)',
        accent: '0 4px 14px rgba(0,82,255,0.25)',
        'accent-lg': '0 8px 24px rgba(0,82,255,0.35)',
      },
      keyframes: {
        rotateIn: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.3)', opacity: '0.7' },
        }
      },
      animation: {
        'rotate-slow': 'rotateIn 60s linear infinite',
        'float': 'float 5s ease-in-out infinite',
        'float-alt': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 2s infinite',
      }
    },
  },
  plugins: [],
}
