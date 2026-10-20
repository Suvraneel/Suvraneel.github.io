import type { Metadata } from "next";
import { spaceBoards } from "@font";
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
  return (
    <main className="nav-gap flex min-h-[100dvh] bg-black text-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-center px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-20 sm:px-10 sm:pb-28 sm:pt-24 lg:px-14 xl:px-20">
        <LiftHeading className={`text-4xl font-bold leading-none tracking-[-0.04em] sm:text-6xl ${spaceBoards.className}`}>
          Not found
        </LiftHeading>
        <PillButton href="/" className="mt-10">
          Back to home
        </PillButton>
      </div>
    </main>
  );
}
