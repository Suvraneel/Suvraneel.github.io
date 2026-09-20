import type { Metadata } from "next";
import HomePage from "./HomePage";

export const metadata: Metadata = {
  title: "Home",
  description: "Official portfolio website of Suvraneel Bhuin.",
};

export default function Page() {
  return <HomePage />;
}
