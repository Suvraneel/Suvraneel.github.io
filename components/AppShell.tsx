"use client";

import { ThemeProvider } from "next-themes";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import AsciiArt from "@components/AsciiArt";
import Layout from "@components/Layout";
import { DashboardSceneProvider } from "@components/DashboardScene";
import PageSequenceScroll from "@components/PageSequenceScroll";
import PageStage from "@components/transition/PageLayer";
import { PageTransitionProvider } from "@components/transition/PageTransitionProvider";
import * as gtag from "@lib/gtag";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasAnalytics = Boolean(gtag.GA_TRACKING_ID);

  useEffect(() => {
    gtag.pageview(pathname);
  }, [pathname]);

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <DashboardSceneProvider>
        <PageTransitionProvider>
          <Layout drawerKey={pathname}>
            <AsciiArt />
            {hasAnalytics && (
              <>
                <Script id="google-analytics-init" strategy="afterInteractive">
                  {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('js', new Date());
gtag('config', '${gtag.GA_TRACKING_ID}', { page_path: window.location.pathname });`}
                </Script>
                <Script
                  id="google-analytics"
                  strategy="afterInteractive"
                  src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
                />
              </>
            )}
            <PageSequenceScroll />
            <PageStage>{children}</PageStage>
          </Layout>
        </PageTransitionProvider>
      </DashboardSceneProvider>
    </ThemeProvider>
  );
}
