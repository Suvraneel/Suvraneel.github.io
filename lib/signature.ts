// The Contact signature's one outside call: write it again. Sent by a sent
// message (the reply is signed off). A window event, so the form does not
// have to hold the component.

export const SIGN_AGAIN_EVENT = "signature:sign-again";

/** Asks the signature on the page to write itself again (ignored mid-write, hidden or under reduced motion). */
export const signAgain = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SIGN_AGAIN_EVENT));
};
