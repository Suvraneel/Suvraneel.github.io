import { ThemeProvider } from "next-themes";
import Layout from "../components/Layout";
import "../styles/globals.css";
import "@fontsource/raleway/400.css";
import "@fontsource/playfair-display"

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}

export default MyApp;
