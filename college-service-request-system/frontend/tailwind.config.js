/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#05070f',
          900: '#0a0e1a',
          800: '#0f1526',
          700: '#161d33',
          600: '#1e2745',
        },
        accent: {
          500: '#4f7cff',
          400: '#6b93ff',
          300: '#94b1ff',
        },
      },
      boxShadow: {
        glow: '0 0 40px rgba(79, 124, 255, 0.15)',
        card: '0 8px 30px rgba(0,0,0,0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
