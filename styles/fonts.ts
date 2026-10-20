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
