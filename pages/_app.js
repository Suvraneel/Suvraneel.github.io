import "@fontsource/playfair-display";
import "@fontsource/raleway/400.css";
import { ThemeProvider } from "next-themes";
import Layout from "../components/Layout";
import "../styles/globals.css";
// import NextNProgress from "nextjs-progressbar";
import { AnimatePresence } from "framer-motion";
import NextNProgress from "../components/NextNProgress";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
        <AnimatePresence exitBeforeEnter>
          <Layout>
            <NextNProgress color="#8F4FFB" />
            <Component {...pageProps} />
          </Layout>
        </AnimatePresence>
    </ThemeProvider>
  );
}

export default MyApp;
