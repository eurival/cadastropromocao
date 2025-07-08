/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {  
    extend: {
      colors: {
        cinexPurple: '#8Fffff',
        cinexLilac:  '#5A2D82'
      }
    },
  },
  plugins: [],
}
