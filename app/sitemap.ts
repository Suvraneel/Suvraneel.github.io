import { execFileSync } from "node:child_process";
import type { MetadataRoute } from "next";
import { siteUrl } from "@lib/seo";

// Required for metadata routes under output: "export" (GitHub Pages).
export const dynamic = "force-static";

// Each route lists the sources that change what the page shows, so lastmod
// reflects real content edits (search engines only trust an accurate lastmod).
const routes = [
  { path: "/", sources: ["app/page.tsx", "app/HomePage.tsx", "public/spline/sceneDACCORD_NEW.splinecode"] },
  { path: "/about", sources: ["app/about", "public/images/Suvraneel_DP.jpeg"] },
  { path: "/work", sources: ["app/work", "data/workData.ts", "components/ChronoCard.tsx"] },
  { path: "/projects", sources: ["app/projects", "data/projectsDat.ts", "components/ProjectModal.tsx"] },
  { path: "/skills", sources: ["app/skills"] },
  { path: "/contact", sources: ["app/contact"] },
] as const;

// Date of the last commit touching any of the sources; needs full git history
// in CI (actions/checkout fetch-depth: 0). Falls back to the build time.
function lastCommitDate(sources: readonly string[]) {
  try {
    const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...sources], {
      encoding: "utf8",
    }).trim();
    if (iso) return new Date(iso);
  } catch {
    // Not a git checkout (e.g. a tarball build).
  }
  return new Date();
}

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, sources }) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified: lastCommitDate(sources),
  }));
}
