/**
 * The 3D dashboard as a still, for wide screens that can't run the Spline
 * scene (no GPU, or a scene that failed to load). Recorded from the live
 * scene (sceneDACCORD_NEW) on a GPU at 2000 x 900 CSS px, 2x, over a
 * transparent page, then cropped to what it draws: 1232 x 900 CSS px whose
 * left edge sits 624px left of the view's centre.
 *
 * The scene keeps a fixed vertical field of view: it scales with the view's
 * height and stays centred, so the still is placed in vh and lands exactly
 * where the scene would draw at any window size.
 */
export const POSTER_W = 1232;
export const POSTER_H = 900;
/** The still's box, in the scene's own units (its height is the view's). */
export const POSTER_BOX = {
  left: `calc(50% - ${((624 / POSTER_H) * 100).toFixed(3)}vh)`,
  width: `${((POSTER_W / POSTER_H) * 100).toFixed(3)}vh`,
} as const;

export const POSTER_SOURCES = {
  avif: "/images/dashboard/dashboard-poster-1x.avif 1232w, /images/dashboard/dashboard-poster-2x.avif 2464w",
  webp: "/images/dashboard/dashboard-poster-1x.webp 1232w, /images/dashboard/dashboard-poster-2x.webp 2464w",
  fallback: "/images/dashboard/dashboard-poster-1x.webp",
  sizes: `${((POSTER_W / POSTER_H) * 100).toFixed(1)}vh`,
} as const;

type Spot = { href: string; label: string } & (
  | { points: string }
  | { cx: number; cy: number; r: number }
);

/**
 * The scene's links, in the still's pixels. Mapped by clicking the live scene
 * on a 12px grid and recording what each click opened (the cards' hulls), the
 * socials as circles on their icons.
 */
export const POSTER_SPOTS: Spot[] = [
  { href: "/projects", label: "Projects", points: "366,618 402,606 618,582 630,582 654,606 654,726 642,738 594,750 486,762 366,762" },
  { href: "https://usemonoma.com", label: "Monoma", points: "366,378 378,366 474,354 594,342 642,342 666,378 666,510 654,534 582,546 474,558 366,558" },
  { href: "https://mvp.settlex.fi", label: "SettleX", points: "678,342 690,330 906,306 954,306 966,318 978,354 978,426 966,486 954,498 870,510 762,522 678,522" },
  { href: "https://github.com/Open-Sorcerer", label: "Open-Sorcerer on GitHub", points: "666,594 678,582 714,570 930,546 942,546 966,570 966,690 954,702 858,714 750,726 678,726 666,714" },
  { href: "https://suvraneel.bio.link/", label: "All of Suvraneel's links", points: "1050,150 1062,126 1074,114 1134,114 1146,126 1146,174 1134,198 1110,210 1074,210 1050,186" },
  { href: "https://github.com/Suvraneel", label: "GitHub", cx: 139, cy: 278, r: 26 },
  { href: "https://www.linkedin.com/in/suvraneel", label: "LinkedIn", cx: 139, cy: 349, r: 26 },
  { href: "https://x.com/SuvraneelB", label: "X", cx: 139, cy: 417, r: 26 },
  { href: "https://discord.com/users/723094669675724801", label: "Discord", cx: 137, cy: 489, r: 27 },
  { href: "https://www.instagram.com/suvraneel", label: "Instagram", cx: 139, cy: 562, r: 26 },
  { href: "https://leetcode.com/u/Suvraneel/", label: "LeetCode", cx: 139, cy: 633, r: 26 },
];
