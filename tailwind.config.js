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
        promoter: '#F49BC1',
        orf1: '#FF8C7A',
        orf2: '#F4C542',
        orf3: '#C97AF4',
        linker: '#A9E2F3',
        regulatory: '#7ED957',
        backbone: '#9CA3AF', // Gray-400
      }
    },
  },
  plugins: [],
}
