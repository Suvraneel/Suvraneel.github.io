// The Contact signature's one outside call: write it again. Sent by a sent
// message (the reply is signed off) and by a pull past the sequence's end
// (PageSequenceScroll). A window event, so neither has to hold the component.

import { prefersReducedMotion } from "@lib/pageTransition";

export const SIGN_AGAIN_EVENT = "signature:sign-again";

/** Asks the signature on the page to write itself again (ignored mid-write, hidden or under reduced motion). */
export const signAgain = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SIGN_AGAIN_EVENT));
};

/** The page's signature can be signed again: written (its ink dry), rendered (not stepped aside), motion allowed. */
export const canSignAgain = (pagePath: string) => {
  if (typeof window === "undefined" || prefersReducedMotion()) return false;
  const signature = document.querySelector(`[data-page="${pagePath}"] [data-signature][data-signed]`);
  return Boolean(signature?.getClientRects().length);
};
