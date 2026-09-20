import { createPageMetadata } from "@lib/seo";
import WorkPage from "./WorkPage";

export const metadata = createPageMetadata({
  title: "Work & Experience",
  description:
    "Professional experience, community work, and education from Suvraneel Bhuin.",
  path: "/work",
});

export default function Page() {
  return <WorkPage />;
}
