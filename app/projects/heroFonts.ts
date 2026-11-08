import { Aoboshi_One, Inter, JetBrains_Mono, Public_Sans } from "next/font/google";

// The two flagship project tiles are set in their own brands' type (Google
// Fonts, OFL, self-hosted at build). Kept out of the shared @font module so
// only /projects loads them. Monoma: Aoboshi One headlines, Public Sans text,
// JetBrains Mono labels, as usemonoma.com. SettleX sets Helvetica Neue
// (commercial, so only the system copy is used) and falls back to Inter, as
// settlex.fi does; not preloaded, since Apple devices never need it.
export const monomaDisplay = Aoboshi_One({ weight: "400", subsets: ["latin"], variable: "--font-monoma-display" });
export const monomaText = Public_Sans({ subsets: ["latin"], variable: "--font-monoma-text" });
export const monomaMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-monoma-mono" });
export const settlexFallback = Inter({
  weight: ["300", "400"],
  subsets: ["latin"],
  variable: "--font-settlex-fallback",
  preload: false,
});
