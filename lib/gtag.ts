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

/** A GA4 page view for the current URL and title. */
export const pageview = () => {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", "page_view", {
    page_location: window.location.href,
    page_title: document.title,
  });
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
