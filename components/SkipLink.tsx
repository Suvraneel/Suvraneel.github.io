"use client";

/**
 * The first Tab stop: jumps past the rail (and Home's dashboard links) to the
 * page on screen. Pages share the stage during a lift, so it finds the settled
 * page's <main> when used, not by id. Inert under the first-visit preloader, as
 * the page is.
 */
export default function SkipLink({ inert }: { inert?: boolean }) {
  return (
    <a
      href="#content"
      inert={inert || undefined}
      onClick={(event) => {
        const path = window.location.pathname.replace(/\/$/, "") || "/";
        const main =
          document.querySelector<HTMLElement>(`[data-page="${path}"] main`) ?? document.querySelector<HTMLElement>("main");
        if (!main) return;
        event.preventDefault();
        if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
      }}
      className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-modal focus-visible:rounded-full focus-visible:bg-white focus-visible:px-5 focus-visible:py-3 focus-visible:text-sm focus-visible:font-medium focus-visible:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      Skip to content
    </a>
  );
}
