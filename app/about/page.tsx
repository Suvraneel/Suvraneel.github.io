import { createPageMetadata } from "@lib/seo";
import AboutPage from "./AboutPage";

export const metadata = createPageMetadata({
  title: "About",
  description: "Learn about Suvraneel Bhuin, a software engineer and product builder.",
  path: "/about",
});

export default function Page() {
  return <AboutPage />;
}
