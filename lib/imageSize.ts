import sizes from "@data/imageSizes.json";

const table: Record<string, number[]> = sizes;

/**
 * width/height attributes for a local image (scripts/image-sizes.mjs records them),
 * so its box is reserved before the file arrives. Nothing for unknown or remote ones.
 */
export const intrinsicSize = (src: string | undefined): { width?: number; height?: number } => {
  const size = src ? table[src] : undefined;
  return size ? { width: size[0], height: size[1] } : {};
};
