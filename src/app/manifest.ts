import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Official Portfolio | Suvraneel",
    short_name: "Portfolio | Suvraneel",
    description:
      "Official Portfolio Website | Suvraneel Bhuin | Full Stack Web3.0 Developer | NextJS/TypeScript/React/Spring Boot/NodeJS",
    start_url: "/",
    display: "standalone",
    background_color: "#1c1717",
    theme_color: "#1c1717",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
