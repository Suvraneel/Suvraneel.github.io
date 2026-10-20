import { createPageMetadata, homeTitle } from "@lib/seo";
import HomePage from "./HomePage";

export const metadata = createPageMetadata({
  title: { absolute: homeTitle },
  description:
    "Suvraneel Bhuin is a software engineer at Accenture building production services across APIs and data, with experience leading open-source programmes.",
  path: "/",
});

export default function Page() {
  return <HomePage />;
}
