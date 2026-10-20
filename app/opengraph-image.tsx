import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { shareImage } from "@lib/seo";

// Required for metadata routes under output: "export" (GitHub Pages): the card
// is rendered once at build time into a static PNG.
export const dynamic = "force-static";

const { alt } = shareImage;
const size = { width: shareImage.width, height: shareImage.height };

// GitHub Pages types files by extension: a bare /opengraph-image would be served
// as application/octet-stream, which link-preview crawlers can reject. One image
// with a .png id exports to out/opengraph-image/card.png instead, the URL every
// page's metadata names (shareImage in lib/seo.ts).
export function generateImageMetadata() {
  return [{ id: "card.png", alt, size, contentType: "image/png" }];
}

const ACCENT = "#1BFCD7";

// Satori reads static TTF/OTF/WOFF only (no WOFF2, no variable fonts). Space Boards
// ships as OTF; OGText-Regular.ttf is TASA Orbiter's "Deck Regular" instance
// (wght 400, opsz 32) cut from TASAOrbiterVF.woff2 with fontTools' instancer and
// renamed, as the OFL asks of modified versions of a Reserved Font Name.
const [spaceBoards, tasaOrbiter, texture] = await Promise.all([
  readFile(join(process.cwd(), "styles/fonts/Spaceboards.otf")),
  readFile(join(process.cwd(), "styles/fonts/OGText-Regular.ttf")),
  readFile(join(process.cwd(), "public/images/seed-46867.png"), "base64"),
]);

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          background: "#000",
          fontFamily: "TASA Orbiter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: ACCENT }} />
          <div style={{ flex: 1, height: 1, margin: "0 24px", background: "rgba(255,255,255,0.16)" }} />
          <div style={{ fontSize: 24, letterSpacing: "0.04em", color: "rgba(255,255,255,0.55)" }}>
            suvraneel.github.io
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* The site's heading texture (.animated-heading) clipped to the name, which
              wraps after "Suvraneel". The leading and bottom padding make room for the
              r/n tails (0.43em below the baseline), which the texture must also cover. */}
          <div
            style={{
              fontFamily: "Space Boards",
              fontSize: 120,
              lineHeight: 1.28,
              paddingBottom: "0.1em",
              color: "transparent",
              backgroundImage: `url(data:image/png;base64,${texture})`,
              backgroundSize: "512px 512px",
              backgroundPosition: "0% 30%",
              backgroundClip: "text",
            }}
          >
            Suvraneel Bhuin
          </div>
          <div style={{ marginTop: 24, fontSize: 36, color: "rgba(255,255,255,0.7)" }}>
            Software Engineer & Product Builder
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Boards", data: spaceBoards, style: "normal", weight: 400 },
        { name: "TASA Orbiter", data: tasaOrbiter, style: "normal", weight: 400 },
      ],
    }
  );
}
