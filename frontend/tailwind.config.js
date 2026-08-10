/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#64b5f6',
        softgreen: '#b9f6ca'
      }
      ,
      fontFamily: {
        sans: ['var(--font-plus-jakarta)'],
      }
    }
  },
  plugins: [],
}
