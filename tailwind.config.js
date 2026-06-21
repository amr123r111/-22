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
        background: 'var(--background)',
        surface: 'var(--surface)',
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        text: 'var(--text)',
        'text-secondary': 'var(--text-secondary)',
      }
    },
  },
  plugins: [],
}
