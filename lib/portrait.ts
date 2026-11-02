// About's desktop portrait, shared by the page that shows it and the page
// transition that carries it in from the dashboard's avatar (the same photo).

export const PORTRAIT_SRC = "/images/Suvraneel_DP.jpeg";
/** Where the portrait's column shows (lg, as on its <aside>); only there is the photo fetched. */
export const PORTRAIT_MEDIA = "(min-width: 1024px)";
/**
 * The studio backdrop is near black, not the page's #000: the photo's edges
 * fade into the page so its frame never reads as a rectangle. Left: along the
 * column; top and bottom: these shares of the photo's frame. The right edge
 * is the viewport's, and the bottom one shows only where the frame stops
 * short of the column (a tall, narrow window): elsewhere it runs past the
 * bottom of the screen, its fade with it.
 */
export const PHOTO_FADE_LEFT = "linear-gradient(to right, transparent, #000 4.5rem)";
export const PHOTO_FADE_TOP_SHARE = 0.1;
export const PHOTO_FADE_BOTTOM_SHARE = 0.03;
export const PHOTO_FADE_TOP = `linear-gradient(to bottom, transparent, #000 ${PHOTO_FADE_TOP_SHARE * 100}%)`;
export const PHOTO_FADE_BOTTOM = `linear-gradient(to top, transparent, #000 ${PHOTO_FADE_BOTTOM_SHARE * 100}%)`;
/** The photo's object-position (object-[40%_100%]) in its frame. */
export const PHOTO_POSITION: [number, number] = [0.4, 1];
