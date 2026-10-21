import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { shareImage } from "@lib/seo";

// Required for metadata routes under output: "export" (GitHub Pages): the card
// is rendered once at build time into a static JPEG.
export const dynamic = "force-static";

const { alt } = shareImage;
const size = { width: shareImage.width, height: shareImage.height };

// GitHub Pages types files by extension: a bare /opengraph-image would be served
// as application/octet-stream, which link-preview crawlers can reject. One image
// with a .jpg id exports to out/opengraph-image/card.jpg instead, the URL every
// page's metadata names (shareImage in lib/seo.ts).
export function generateImageMetadata() {
  return [{ id: "card.jpg", alt, size, contentType: shareImage.type }];
}

const ACCENT = "#1BFCD7";

// Satori reads static TTF/OTF/WOFF only (no WOFF2, no variable fonts). Space Boards
// ships as OTF; OGText-Regular.ttf is TASA Orbiter's "Deck Regular" instance
// (wght 400, opsz 32) cut from TASAOrbiterVF.woff2 with fontTools' instancer and
// renamed, as the OFL asks of modified versions of a Reserved Font Name.
// home-backdrop.jpg is the desktop Home (rail hidden) composed for this card, its
// left side darkened so the name can sit over the dashboard and stay legible. It
// bakes in Home's content, so regenerate it when that changes: screenshot Home at
// 1600x840 (rail hidden, pointer parked bottom-right), place the shot at left 200,
// top 20, width 1140 on a black 1200x630 page with a left-to-right black scrim and
// a radial vignette behind the copy, and save as JPEG q90.
const [spaceBoards, ogText, texture, backdrop] = await Promise.all([
  readFile(join(process.cwd(), "styles/fonts/Spaceboards.otf")),
  readFile(join(process.cwd(), "styles/fonts/OGText-Regular.ttf")),
  readFile(join(process.cwd(), "public/images/seed-46867.png"), "base64"),
  readFile(join(process.cwd(), "styles/og/home-backdrop.jpg"), "base64"),
]);

// Satori writes PNG, about 700 KB over the screenshot backdrop; WhatsApp drops
// previews much over 300 KB, so the card ships as a JPEG (about 85 KB).
export default async function Image() {
  const png = await new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#000", fontFamily: "OG Text" }}>
        <img
          src={`data:image/jpeg;base64,${backdrop}`}
          width={size.width}
          height={size.height}
          alt=""
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        <div style={{ position: "absolute", top: 64, left: 80, display: "flex", alignItems: "center" }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: ACCENT }} />
          <div style={{ marginLeft: 14, fontSize: 22, color: "rgba(255,255,255,0.55)" }}>suvraneel.github.io</div>
        </div>
        <div style={{ position: "absolute", top: 175, left: 80, display: "flex", flexDirection: "column" }}>
          {/* The site's heading texture (.animated-heading) clipped to the name, which
              wraps after "Suvraneel" and runs over the dashboard. Tight leading lets the
              r/n tails (0.43em below the baseline) cross into "Bhuin", as on the site;
              the bottom padding keeps Bhuin's own tail textured. Satori resolves a
              percentage background-position against the box, not (box - image) as CSS
              does, so the tile is offset in pixels, keeping its non-repeating edges out
              of the name. */}
          <div
            style={{
              width: 900,
              fontFamily: "Space Boards",
              fontSize: 104,
              lineHeight: 1,
              paddingBottom: "0.25em",
              color: "transparent",
              backgroundImage: `url(data:image/png;base64,${texture})`,
              backgroundSize: "420px 420px",
              backgroundPosition: "0px -57px",
              backgroundClip: "text",
            }}
          >
            Suvraneel Bhuin
          </div>
          <div style={{ marginTop: 9, fontSize: 30, color: "rgba(255,255,255,0.75)" }}>
            Software Engineer & Product Builder
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Boards", data: spaceBoards, style: "normal", weight: 400 },
        { name: "OG Text", data: ogText, style: "normal", weight: 400 },
      ],
    }
  ).arrayBuffer();
  const jpeg = await sharp(Buffer.from(png)).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": shareImage.type } });
}
