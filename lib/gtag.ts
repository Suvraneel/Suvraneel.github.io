export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    gtag: any;
  }
}

/**
 * The inline tag for the root layout: queues gtag and its config while the
 * HTML parses, so the first page view (sent after hydration) is never lost to
 * a script that hasn't loaded yet. Config sends no page view of its own; the
 * app sends one per route (`pageview`), so GA4's "Page changes based on
 * browser history events" must be off or each route change counts twice.
 */
export const gtagInit = (id: string) =>
  `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(id)},{send_page_view:false});`;

/** Frames (~1/3 s) pageview() waits for a route's own <title> before sending anyway. */
const MAX_TITLE_WAIT_FRAMES = 20;

/** The last page view sent, so a route change can tell its title from the old page's. */
let lastSent: { path: string; title: string } | null = null;

/** A GA4 page view for the current URL and title. */
export const pageview = () => {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  // The URL is read now, so a navigation during the wait cannot relabel this hit.
  const location = window.location.href;
  const path = window.location.pathname;

  const send = (frames: number) => {
    const title = document.title;
    // A client navigation can commit before its <title> lands: for a frame or
    // two the document has no title, or still the previous page's.
    const stale = !title || (lastSent !== null && lastSent.path !== path && title === lastSent.title);
    if (stale && frames < MAX_TITLE_WAIT_FRAMES) {
      window.requestAnimationFrame(() => send(frames + 1));
      return;
    }
    lastSent = { path, title };
    window.gtag("event", "page_view", { page_location: location, page_title: title });
  };
  send(0);
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value: number;
}) => {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
