import type { MetadataRoute } from "next";
import { siteUrl } from "@lib/seo";

const routes = [
  { path: "/", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/work", priority: 0.9 },
  { path: "/projects", priority: 0.9 },
  { path: "/skills", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-09-21T00:00:00.000Z");

  return routes.map(({ path, priority }) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified,
    changeFrequency: "monthly",
    priority,
  }));
}
