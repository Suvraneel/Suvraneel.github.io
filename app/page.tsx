import { createPageMetadata } from "@lib/seo";
import HomePage from "./HomePage";

export const metadata = createPageMetadata({
  title: "Software Engineer & Product Builder",
  description:
    "Portfolio of Suvraneel Bhuin, a software engineer building thoughtful digital products and enterprise systems.",
  path: "/",
});

export default function Page() {
  return <HomePage />;
}
