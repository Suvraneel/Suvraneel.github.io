import { createPageMetadata } from "@lib/seo";
import ProjectsPage from "./ProjectsPage";

export const metadata = createPageMetadata({
  title: "Projects",
  description: "Selected software projects designed and built by Suvraneel Bhuin.",
  path: "/projects",
});

export default function Page() {
  return <ProjectsPage />;
}
