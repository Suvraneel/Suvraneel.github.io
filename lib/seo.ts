import type { Metadata } from "next";

export const siteUrl = new URL("https://suvraneel.github.io");
export const siteName = "Suvraneel Bhuin";
export const siteDescription =
  "Portfolio of Suvraneel Bhuin, a software engineer building thoughtful digital products and enterprise systems.";

type PageMetadata = {
  title: string;
  description: string;
  path: string;
};

export function createPageMetadata({ title, description, path }: PageMetadata): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName,
      title,
      description,
      url: path,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
