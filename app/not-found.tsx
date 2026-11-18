import type { Metadata } from "next";
import { preload } from "react-dom";
import { spaceBoards, tasaOrbiter } from "@font";
import LiftHeading from "@components/LiftHeading";
import PillButton from "@components/PillButton";
import { createPageMetadata, siteDescription } from "@lib/seo";

// Exported as out/404.html, which GitHub Pages serves for any unknown URL. No
// path: the layout's Home canonical and share URL do not carry over.
export const metadata: Metadata = {
  ...createPageMetadata({ title: "Not found", description: siteDescription }),
  robots: { index: false, follow: true },
};

export default function NotFound() {
  // The heading's texture is this page's LCP, but only the stylesheet names it:
  // ask for it with the HTML, as Work does.
  preload("/images/seed-46867.webp", { as: "image", fetchPriority: "high" });
  return (
    <main className="nav-gap flex min-h-[100dvh] bg-black text-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-center px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-20 sm:px-10 sm:pb-28 sm:pt-24 lg:px-14 xl:px-20">
        {/* A capital F: Space Boards' lowercase f is two bars with no stem, so "found" read as "=OUND". */}
        <LiftHeading className={`text-display leading-none tracking-[-0.04em] ${spaceBoards.className}`}>
          Not Found
        </LiftHeading>
        <p className={`mt-6 max-w-xl text-balance text-body leading-[1.6] text-white/65 ${tasaOrbiter.className}`}>
          Nothing lives at this address. Try one of these instead.
        </p>
        {/* Each lowers its page over this one, as a step back would (PageTransitionProvider). */}
        <nav aria-label="Pages" className="mt-10 flex flex-wrap gap-3">
          <PillButton href="/">Home</PillButton>
          <PillButton href="/projects">Projects</PillButton>
          <PillButton href="/contact">Contact</PillButton>
        </nav>
      </div>
    </main>
  );
}
