import type { Metadata } from "next";
import WorkPage from "./WorkPage";

export const metadata: Metadata = {
  title: "Work",
  description: "Professional experience, community work, and education of Suvraneel Bhuin.",
};

export default function Page() {
  return <WorkPage />;
}
