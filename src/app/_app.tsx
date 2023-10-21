import AsciiArt from "@components/AsciiArt";
import Layout from "@components/Layout";
import NextNProgress from "@components/NextNProgress";
import "@fontsource/playfair-display";
import "@fontsource/raleway/400.css";
import "@styles/globals.css";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  // countapi.hit('suvraneel.github.io', 'counter').then((result) => {
  //   console.log("%c This website has been visited "+result.value+" times.", "color: #0ff");
  // });
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <AnimatePresence mode="wait">
        <Layout>
        <AsciiArt />
          <NextNProgress color="#B338FF" />
          <Component {...pageProps} />
        </Layout>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default MyApp;
