// Writes data/imageSizes.json: the intrinsic width and height of the images the
// pages show from public/images, so each <img> can carry width/height (the
// browser reserves its box before the file arrives). Re-run after adding images:
//   node scripts/image-sizes.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..", "public");
const dirs = ["images/project-assets", "images"];
const sizes = {};
const walk = async (dir, deep) => {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (deep) await walk(rel, deep);
      continue;
    }
    if (!/\.(webp|png|jpe?g|svg|avif)$/i.test(entry.name)) continue;
    try {
      const { width, height } = await sharp(path.join(root, rel)).metadata();
      if (width && height) sizes[`/${rel}`] = [width, height];
    } catch {
      // Not an image sharp reads: skipped.
    }
  }
};
await walk(dirs[0], true);
await walk(dirs[1], false);
const sorted = Object.fromEntries(Object.entries(sizes).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(path.resolve(import.meta.dirname, "..", "data", "imageSizes.json"), `${JSON.stringify(sorted, null, 0).replace(/\],/g, "],\n")}\n`);
console.log(Object.keys(sorted).length, "images");
