import "@font";
import "@fontsource/playfair-display";
import "@fontsource/raleway/400.css";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "next-themes";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect } from "react";
import AsciiArt from "@components/AsciiArt";
import Layout from "@components/Layout";
import NextNProgress from "@components/NextNProgress";
import * as gtag from "@lib/gtag";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <AnimatePresence mode="wait">
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
          <Component {...pageProps} />
        </Layout>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default MyApp;
