/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
			fontFamily: {
				sans: ["serif", "sans-serif"],
				primary: ['var(--font-spaceBoards)', "sans-serif"],
				secondary: ['var(--font-TASAOrb)', "sans-serif"],
			},
		},
  },
  plugins: [],
}