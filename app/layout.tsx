import type { Metadata } from "next";
import "../styles/globals.css";
import AppShell from "@components/AppShell";

export const metadata: Metadata = {
  title: {
    default: "Portfolio - Suvraneel Bhuin",
    template: "%s | Portfolio - Suvraneel",
  },
  description: "Official portfolio website of Suvraneel Bhuin.",
  verification: {
    google: "J9uDTeg3iujyef0pzqJ7s7xDlmizshJEn0767--L3nA",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
