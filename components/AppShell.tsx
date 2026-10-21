"use client";

import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import AsciiArt from "@components/AsciiArt";
import Layout from "@components/Layout";
import { DashboardSceneProvider } from "@components/DashboardScene";
import PageSequenceScroll from "@components/PageSequenceScroll";
import PageStage from "@components/transition/PageLayer";
import { PageTransitionProvider } from "@components/transition/PageTransitionProvider";
import SplineLinkGuard from "@components/SplineLinkGuard";
import * as gtag from "@lib/gtag";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // One page view per committed route, the first load included. By now the
  // route's <title> is in place; at the history push it is still the old page's.
  useEffect(() => {
    gtag.pageview();
  }, [pathname]);

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <DashboardSceneProvider>
        <PageTransitionProvider>
          <Layout>
            <AsciiArt />
            <PageSequenceScroll />
            <SplineLinkGuard />
            <PageStage>{children}</PageStage>
          </Layout>
        </PageTransitionProvider>
      </DashboardSceneProvider>
    </ThemeProvider>
  );
}
