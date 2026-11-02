// About's desktop portrait, shared by the page that shows it and the page
// transition that carries it in from the dashboard's avatar (the same photo).

export const PORTRAIT_SRC = "/images/Suvraneel_DP.jpeg";
/**
 * The desktop layout (lg): the portrait in a column of its own. Only here does
 * it turn in relief, or does the dashboard's avatar open into it.
 */
export const PORTRAIT_COLUMN_MEDIA = "(min-width: 1024px)";
/**
 * Upright tablets and short windows below lg: the copy keeps the left and runs
 * over the portrait's faded side, clear of the face. Mirrored by the `split`
 * variant in tailwind.config.js, which styles it.
 */
export const PORTRAIT_SPLIT_MEDIA = "(min-width: 744px) and (max-width: 1023.98px) and (min-height: 600px)";
/** Wherever the portrait shows; only there is the photo fetched. */
export const PORTRAIT_MEDIA = `${PORTRAIT_COLUMN_MEDIA}, ${PORTRAIT_SPLIT_MEDIA}`;
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
