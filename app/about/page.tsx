import type { Metadata } from "next";
import AboutPage from "./AboutPage";

export const metadata: Metadata = {
  title: "About",
  description: "About Suvraneel Bhuin.",
};

export default function Page() {
  return <AboutPage />;
}
