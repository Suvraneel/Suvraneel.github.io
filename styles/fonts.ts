import localFont from 'next/font/local'

// The Space Boards demo has no digits. They come from our own companion font
// (globals.css, "Space Boards Digits"), so it must sit right after it in the stack:
// next/font's metric-adjusted Arial fallback would otherwise supply them first.
const spaceBoards = localFont({
  src: './fonts/Spaceboards.otf',
  variable: '--font-spaceBoards',
  adjustFontFallback: false,
  fallback: ['Space Boards Digits', 'Arial', 'sans-serif'],
});
const tasaOrbiter = localFont({
  src: './fonts/TASAOrbiterVF.woff2',
  variable: '--font-TASAOrb'
});

export { spaceBoards, tasaOrbiter }

// @import url("https://fonts.googleapis.com/css2?family=Playfair+Display&family=Poiret+One&family=Raleway&display=swap");

// @import url("https://fonts.googleapis.com/css?family=Montserrat:100,100i,200,200i,300,300i,400,400i,500,500i,600,600i,700,700i,800,800i,900,900i");
// @import url("https://fonts.googleapis.com/css?family=Poppins:400,500,600,700,800,900");
// /* styles/fonts.css */
// @font-face {
//   font-family: 'spaceBoards';
//   src: url('/fonts/Spaceboards.otf') format('otf');
//   font-weight: normal;
//   font-style: normal;
// }
