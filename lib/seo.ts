import type { Metadata } from "next";

export const siteUrl = new URL("https://suvraneel.github.io");
export const siteName = "Suvraneel Bhuin";
export const siteTagline = "Software Engineer & Product Builder";
/** X (Twitter) handle, credited as the site and the author on share cards. */
export const twitterHandle = "@SuvraneelB";
/** Home's title, and the layout's default for any route without its own. */
export const homeTitle = `${siteName} | ${siteTagline}`;
export const siteDescription =
  "Portfolio of Suvraneel Bhuin, a software engineer building thoughtful digital products and enterprise systems.";

/**
 * The branded share card, app/opengraph-image.tsx exported as a static JPEG
 * (its "card.jpg" image id). Metadata merges shallowly, so a page's own
 * openGraph and twitter objects drop the layout's image: each one lists it.
 */
export const shareImage = {
  url: "/opengraph-image/card.jpg",
  width: 1200,
  height: 630,
  alt: `${siteName}, ${siteTagline}`,
  type: "image/jpeg",
};

type PageMetadata = {
  /** A page name gets the layout's " | Suvraneel Bhuin" suffix; `absolute` is used as it is. */
  title: string | { absolute: string };
  description: string;
  /** Omitted (the 404 page): no canonical or share URL, and the layout's Home canonical is cleared. */
  path?: string;
};

export function createPageMetadata({ title, description, path }: PageMetadata): Metadata {
  // Share cards get the full title: the layout's template only reaches <title>.
  const shareTitle = typeof title === "string" ? `${title} | ${siteName}` : title.absolute;
  return {
    title,
    description,
    alternates: path ? { canonical: path } : null,
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName,
      title: shareTitle,
      description,
      url: path,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      site: twitterHandle,
      creator: twitterHandle,
      title: shareTitle,
      description,
      images: [shareImage],
    },
  };
}
