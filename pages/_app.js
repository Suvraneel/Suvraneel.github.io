import { ThemeProvider } from "next-themes";
import Layout from "../components/Layout";
import "../styles/globals.css";
import "@fontsource/raleway/400.css";
import "@fontsource/playfair-display"
// import NextNProgress from "nextjs-progressbar";
import NextNProgress from "../components/NextNProgress";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <Layout>
        <NextNProgress color="#8F4FFB"/>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}

export default MyApp;
