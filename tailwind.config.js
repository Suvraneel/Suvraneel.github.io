/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
			fontFamily: {
				sans: ["serif", "sans-serif"],
				primary: ['var(--font-spaceBoards)', "sans-serif"],
				secondary: ['var(--font-TASAOrb)', "sans-serif"],
			},
      colors: {
        primary: "#B338FF",
        accent: "#06FFC8",
      }
		},
  },
  plugins: [],
}