import "@fontsource/playfair-display";
import "@fontsource/raleway/400.css";
import { ThemeProvider } from "next-themes";
import Layout from "../components/Layout";
import "../styles/globals.css";
import { AnimatePresence } from "framer-motion";
import NextNProgress from "../components/NextNProgress";
import countapi from 'countapi-js';
import AsciiArt from "../components/AsciiArt";
import "@/fonts";

function MyApp({ Component, pageProps }) {
  // countapi.hit('suvraneel.github.io', 'counter').then((result) => {
  //   console.log("%c This website has been visited "+result.value+" times.", "color: #0ff");
  // });
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <AnimatePresence mode="wait">
        <Layout>
        <AsciiArt />
          <NextNProgress color="#8F4FFB" />
          <Component {...pageProps} />
        </Layout>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default MyApp;
