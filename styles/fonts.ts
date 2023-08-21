import { Raleway, Montserrat, Poppins } from "next/font/google";
import localFont from 'next/font/local'

const raleway = Raleway({
  subsets: ['latin'],
  display: 'swap',
});
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
});
const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: "500",
});
const spaceBoards = localFont({
  src: './fonts/Spaceboards.otf',
  variable: '--font-spaceBoards'
});
const tasaOrbiter = localFont({
  src: './fonts/TASAOrbiterVF.woff2',
  variable: '--font-TASAOrb'
});

export { raleway, montserrat, poppins, spaceBoards, tasaOrbiter }

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