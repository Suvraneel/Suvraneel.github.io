// About's desktop portrait, shared by the page that shows it and the page
// transition that carries it in from the dashboard's avatar (the same photo).

export const PORTRAIT_SRC = "/images/Suvraneel_DP.jpeg";
/** Where the portrait's column shows (lg, as on its <aside>); only there is the photo fetched. */
export const PORTRAIT_MEDIA = "(min-width: 1024px)";
/**
 * The studio backdrop is near black, not the page's #000: the photo's left
 * and top edges fade into the page so its frame never reads as a rectangle
 * (the right and bottom edges are the viewport's). Left: along the column;
 * top: along the photo's frame.
 */
export const PHOTO_FADE_LEFT = "linear-gradient(to right, transparent, #000 4.5rem)";
export const PHOTO_FADE_TOP = "linear-gradient(to bottom, transparent, #000 10%)";
/** The photo's object-position (object-[40%_100%]) in its frame. */
export const PHOTO_POSITION: [number, number] = [0.4, 1];
