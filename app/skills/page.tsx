import { createPageMetadata } from "@lib/seo";
import SkillsPage from "./SkillsPage";

export const metadata = createPageMetadata({
  title: "Skills",
  description: "Technical skills, tools, and interests of Suvraneel Bhuin.",
  path: "/skills",
});

export default function Page() {
  return <SkillsPage />;
}
