import { createPageMetadata } from "@lib/seo";
import ContactPage from "./ContactPage";

export const metadata = createPageMetadata({
  title: "Contact",
  description: "Contact Suvraneel Bhuin for software engineering and product work.",
  path: "/contact",
});

export default function Page() {
  return <ContactPage />;
}
