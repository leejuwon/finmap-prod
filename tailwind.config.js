/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./_components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      borderRadius: { 'xxl': '1rem' },
      boxShadow: { 'card': '0 6px 22px rgba(15,23,42,.08)' },
      colors: { brand: { 600: '#2563eb', 700: '#1d4ed8' } }
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
