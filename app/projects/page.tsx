import type { Metadata } from "next";
import ProjectsPage from "./ProjectsPage";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects by Suvraneel Bhuin.",
};

export default function Page() {
  return <ProjectsPage />;
}
