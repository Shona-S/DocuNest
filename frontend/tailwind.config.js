/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0d0c1d',
        surface: '#1a1625',
        border: '#2a2535',
        lavender: '#b9a6f5',
        text: '#eaeaea',
        'text-secondary': '#a0a0a0',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      transitionProperty: {
        'all': 'all',
      },
    },
  },
  plugins: [],
}

