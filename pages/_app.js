import "@fontsource/playfair-display";
import "@fontsource/raleway/400.css";
import { ThemeProvider } from "next-themes";
import Layout from "../components/Layout";
import "../styles/globals.css";
// import NextNProgress from "nextjs-progressbar";
import { AnimatePresence } from "framer-motion";
import NextNProgress from "../components/NextNProgress";
import { ChakraProvider } from "@chakra-ui/react";
// 1. Import the extendTheme function
import { extendTheme } from '@chakra-ui/react'

// 2. Extend the theme to include custom colors, fonts, etc
const theme = extendTheme({
  styles: {
    global: () => ({
      body: {
        bg: ""
      }
    })
  }
});

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <ChakraProvider theme={theme}>
        <AnimatePresence exitBeforeEnter>
          <Layout>
            <NextNProgress color="#8F4FFB" />
            <Component {...pageProps} />
          </Layout>
        </AnimatePresence>
      </ChakraProvider>
    </ThemeProvider>
  );
}

export default MyApp;
