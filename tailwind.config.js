/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // Shared class strings live here too (lib/modalMotion.ts).
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
			// Site-wide stacking, lowest first. Local stacking inside a component
			// (z-[1], z-10, ...) stays literal.
			zIndex: {
				rail: "50",
				preloader: "500",
				hint: "1500",
				"drawer-backdrop": "2000",
				drawer: "2001",
				"menu-toggle": "2003",
				modal: "5000",
			},
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
