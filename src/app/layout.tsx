import Hamburger from "@components/Hamburger/Hamburger";
import Navbar from "@components/Navbar/Navbar";
import Providers from "@components/Providers";
import "@styles/globals.css";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Official Portfolio | Suvraneel",
  description:
    "Official Portfolio Website | Suvraneel Bhuin | Full Stack Web3.0 Developer | NextJS/TypeScript/React/Spring Boot/NodeJS",
  metadataBase: new URL("https://suvraneel.github.io"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <Providers
          defaultTheme="dark"
          enableSystem
          enableColorScheme
          attribute="class"
        >
          <div
            className="bg-transparent flex flex-row justify-start"
            id="visits"
          >
            <div className="flex flex-col h-full w-full">
              {children}
              <Navbar />
              <Hamburger />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
