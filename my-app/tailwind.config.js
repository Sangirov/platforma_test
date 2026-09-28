/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neo-bg': '#e0e5ec', // Ochiq kulrang/havorang fon
      },
      boxShadow: {
        'neo': '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)', // Tashqi bo'rtib chiqqan soya
        'neo-inset': 'inset 6px 6px 10px 0 rgba(163, 177, 198, 0.7), inset -6px -6px 10px 0 rgba(255, 255, 255, 0.8)', // Ichkariga botgan soya
      }
    },
  },
  plugins: [],
}