import "@font";
import "@fontsource/playfair-display";
import "@fontsource/raleway/400.css";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "next-themes";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import AsciiArt from "@components/AsciiArt";
import Layout from "@components/Layout";
import NextNProgress from "@components/NextNProgress";
import { DashboardSceneProvider } from "@components/DashboardScene";
import PageSequenceScroll from "@components/PageSequenceScroll";
import * as gtag from "@lib/gtag";
import "../styles/globals.css";

const pageOrder = ["/", "/about", "/work", "/projects", "/skills", "/contact"];

const routePath = (url: string) => url.split(/[?#]/)[0] || "/";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const currentRoute = useRef(routePath(router.asPath));
  const [transitionDirection, setTransitionDirection] = useState(1);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    const handleRouteStart = (url: string) => {
      const nextRoute = routePath(url);
      const fromIndex = pageOrder.indexOf(currentRoute.current);
      const toIndex = pageOrder.indexOf(nextRoute);

      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        setTransitionDirection(toIndex > fromIndex ? 1 : -1);
      }

      currentRoute.current = nextRoute;
    };

    router.events.on("routeChangeStart", handleRouteStart);
    return () => router.events.off("routeChangeStart", handleRouteStart);
  }, [router.events]);

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <DashboardSceneProvider>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={router.asPath}
            initial={{ opacity: 0, y: transitionDirection * 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: transitionDirection * -28 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <Layout>
              <AsciiArt />
              <Head>
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', '${gtag.GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `,
                  }}
                />
              </Head>
              {/* Global Site Tag (gtag.js) - Google Analytics */}
              <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
              />
              <NextNProgress color="#B338FF" />
              <PageSequenceScroll />
              <Component {...pageProps} />
            </Layout>
          </motion.div>
        </AnimatePresence>
      </DashboardSceneProvider>
    </ThemeProvider>
  );
}

export default MyApp;
