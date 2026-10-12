/**
 * Whether a link should render as a plain <a> rather than next/link: other
 * origins and schemes, new-tab or download links, and files (a path with an
 * extension, e.g. a PDF), none of which are client-side page navigations.
 */
export function isPlainAnchor(href: string, target?: string, download?: boolean | string) {
  if ((target && target !== "_self") || (download !== undefined && download !== false)) return true;
  if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith("//")) return true;
  const path = href.split(/[?#]/)[0];
  return /\.[a-z\d]+$/i.test(path);
}
