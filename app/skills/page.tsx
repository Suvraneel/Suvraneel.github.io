import type { Metadata } from "next";
import SkillsPage from "./SkillsPage";

export const metadata: Metadata = {
  title: "Skills",
  description: "Technical skills and interests of Suvraneel Bhuin.",
};

export default function Page() {
  return <SkillsPage />;
}
