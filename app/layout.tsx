import type { Metadata } from "next";
import Script from "next/script";
import "../styles/globals.css";
import AppShell from "@components/AppShell";
import { spaceBoards, tasaOrbiter } from "@font";
import { GA_TRACKING_ID, gtagInit } from "@lib/gtag";
import { homeTitle, shareImage, siteDescription, siteName, siteUrl, twitterHandle } from "@lib/seo";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: homeTitle,
    template: "%s | Suvraneel Bhuin",
  },
  description: siteDescription,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName,
    title: homeTitle,
    description: siteDescription,
    url: "/",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    site: twitterHandle,
    creator: twitterHandle,
    title: homeTitle,
    description: siteDescription,
    images: [shareImage],
  },
  robots: { index: true, follow: true },
  verification: {
    google: "J9uDTeg3iujyef0pzqJ7s7xDlmizshJEn0767--L3nA",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}#person`,
        name: siteName,
        url: siteUrl.toString(),
        jobTitle: "Advanced Application Engineering Senior Analyst",
        worksFor: { "@type": "Organization", name: "Accenture" },
        email: "mailto:bsuvraneel@gmail.com",
        sameAs: [
          "https://github.com/Suvraneel",
          "https://www.linkedin.com/in/suvraneel-bhuin/",
          "https://twitter.com/SuvraneelB",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        name: `${siteName} Portfolio`,
        url: siteUrl.toString(),
        description: siteDescription,
        publisher: { "@id": `${siteUrl}#person` },
      },
    ],
  };

  return (
    // The fonts' CSS variables (--font-TASAOrb, --font-spaceBoards), for CSS that
    // can't take next/font's generated class names (the rail labels).
    <html lang="en" className={`${tasaOrbiter.variable} ${spaceBoards.variable}`} suppressHydrationWarning>
      <head>
        {/* Without JavaScript the Home preloader's cover would never lift: never show it. */}
        <noscript>
          <style>{`.preloader{display:none}`}</style>
        </noscript>
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {GA_TRACKING_ID && (
          <>
            <script dangerouslySetInnerHTML={{ __html: gtagInit(GA_TRACKING_ID) }} />
            {/* gtag.js (~175 KB) loads once the page is idle, off the critical path;
                the queue above holds the first page view until it arrives. */}
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="lazyOnload"
            />
          </>
        )}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
