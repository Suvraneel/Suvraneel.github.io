import { createPageMetadata } from "@lib/seo";
import SkillsPage from "./SkillsPage";

export const metadata = createPageMetadata({
  title: "Skills",
  description: "Full-stack engineering across backend systems, product interfaces, agentic workflows, and Web3.",
  path: "/skills",
});

export default function Page() {
  return <SkillsPage />;
}
