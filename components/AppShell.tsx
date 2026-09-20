"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import AsciiArt from "@components/AsciiArt";
import Layout from "@components/Layout";
import { DashboardSceneProvider } from "@components/DashboardScene";
import PageSequenceScroll from "@components/PageSequenceScroll";
import ScrollToExplore from "@components/ScrollToExplore";
import * as gtag from "@lib/gtag";

const pageOrder = ["/", "/about", "/work", "/projects", "/skills", "/contact"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  // The prior route is intentionally read during render so directional page
  // transitions can be derived before the next screen enters.
  // eslint-disable-next-line react-hooks/refs
  const fromIndex = pageOrder.indexOf(previousPathname.current);
  const toIndex = pageOrder.indexOf(pathname);
  const transitionDirection = fromIndex !== -1 && toIndex !== -1 && toIndex < fromIndex ? -1 : 1;

  useEffect(() => {
    gtag.pageview(pathname);
    previousPathname.current = pathname;
  }, [pathname]);

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <DashboardSceneProvider>
        <Layout>
          <AsciiArt />
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
          <PageSequenceScroll />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={pathname}
              data-page={pathname}
              className="h-full w-full"
              initial={{ opacity: 0, y: transitionDirection * 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: transitionDirection * -28 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
          <ScrollToExplore />
        </Layout>
      </DashboardSceneProvider>
    </ThemeProvider>
  );
}
