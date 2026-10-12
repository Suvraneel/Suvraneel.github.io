// ---------------------------------------------------------------------------
// Spline "Scroll" events with trigger "load" (e.g. Work's plant) don't read a
// scroll position: the runtime counts window wheel events, one step per event
// (sign only), clamped to the event's step count. To start such a scene part
// way through (a backward arrival at the page bottom), we replay steps as
// synthetic wheel events. They are tagged so our own wheel handlers ignore them.
// ---------------------------------------------------------------------------

const synthetic = new WeakSet<Event>();

/** True for wheel events replayed by `stepSplineScroll`, never for user input. */
export const isSyntheticScrollStep = (event: Event) => synthetic.has(event);

/** Advances (positive) or rewinds (negative) every in-view wheel-driven Spline scene by `steps`. */
export const stepSplineScroll = (steps: number) => {
  const deltaY = steps > 0 ? 1 : -1;
  for (let i = 0; i < Math.abs(steps); i += 1) {
    const event = new WheelEvent("wheel", { deltaY, cancelable: true });
    synthetic.add(event);
    window.dispatchEvent(event);
  }
};
