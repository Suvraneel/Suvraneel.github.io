import type { MetadataRoute } from "next";
import { siteUrl } from "@lib/seo";

// Required for metadata routes under output: "export" (GitHub Pages).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
