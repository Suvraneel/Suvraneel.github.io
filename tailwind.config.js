/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
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
      colors: {
        // Solid cyan for small accents, sampled from the wordmark texture's cyan
        // end (public/images/seed-46867.png). Defined once as --accent in globals.css.
        accent: "rgb(var(--accent) / <alpha-value>)",
      }
		},
  },
  plugins: [],
}
