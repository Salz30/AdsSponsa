// Tailwind CSS Config
import type { Config } from 'tailwindcss'


const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: 'hsl(262, 100%, 97%)',
          100: 'hsl(262, 95%, 93%)',
          200: 'hsl(262, 90%, 86%)',
          300: 'hsl(262, 85%, 75%)',
          400: 'hsl(262, 83%, 65%)',
          500: 'hsl(262, 83%, 58%)',
          600: 'hsl(262, 80%, 50%)',
          700: 'hsl(262, 78%, 42%)',
          800: 'hsl(262, 74%, 34%)',
          900: 'hsl(262, 70%, 26%)',
          950: 'hsl(262, 68%, 16%)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
