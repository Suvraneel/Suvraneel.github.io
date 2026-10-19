import type { Metadata } from "next";
import "../styles/globals.css";
import AppShell from "@components/AppShell";
import { GA_TRACKING_ID, gtagInit } from "@lib/gtag";
import { siteDescription, siteName, siteUrl } from "@lib/seo";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Suvraneel Bhuin | Software Engineer & Product Builder",
    template: "%s | Suvraneel Bhuin",
  },
  description: siteDescription,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName,
    title: "Suvraneel Bhuin | Software Engineer & Product Builder",
    description: siteDescription,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "Suvraneel Bhuin | Software Engineer & Product Builder",
    description: siteDescription,
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
        name: `${siteName} — Portfolio`,
        url: siteUrl.toString(),
        description: siteDescription,
        publisher: { "@id": `${siteUrl}#person` },
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
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
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
          </>
        )}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
