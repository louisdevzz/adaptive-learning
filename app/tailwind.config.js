// tailwind.config.js
const {heroui} = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/components/(button|card|navbar|ripple|spinner|breadcrumbs|progress).js"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#2563EB",
        "primary-dark": "#1D4ED8",
        "secondary": "#EFF6FF",
        "accent": "#F0F9FF",
        "background-light": "#FFFFFF",
        "background-soft": "#F8FAFC",
        "background-dark": "#0F172A",
        "text-main": "#0F172A",
        "text-muted": "#64748B",
        "card-border": "#E2E8F0",
      },
      fontFamily: {
        "display": ["var(--font-roboto-flex)", "sans-serif"],
        "body": ["var(--font-roboto-flex)", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
        "full": "9999px"
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'glow': '0 0 20px rgba(37, 99, 235, 0.3)',
      }
    },
  },
  plugins: [heroui()],
};