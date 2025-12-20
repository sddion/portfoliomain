import { type Config } from "tailwindcss"

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        progress: {
          '0%': { width: '0%' }
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        progress: 'progress 2s ease-in-out forwards'
      },
      fontFamily: {
        sans: ["var(--ui-font-sans)", "sans-serif"],
        mono: ["var(--ui-font-mono)", "monospace"],
      }
    }
  }
} satisfies Config