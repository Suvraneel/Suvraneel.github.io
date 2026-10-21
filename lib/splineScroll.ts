import type { Application } from "@splinetool/runtime";

// ---------------------------------------------------------------------------
// Spline "Scroll" events with trigger "load" (e.g. Work's plant) don't read a
// scroll position: the runtime counts window wheel events, one step per event
// (sign only), and seeks the event's transitions to steps / total. A trackpad
// flick sends dozens of events, so such a scene runs ahead of its page, and
// keys, the scrollbar and arrivals don't move it at all. `scrubSplineScroll`
// detaches those events from the wheel and seeks their transitions to a
// progress we give it, so the scene follows its page's real scroll.
//
// This reaches into the runtime's event manager, which is not public API.
// Checked against @splinetool/runtime 2.0.75 (pinned): on any other shape it
// returns null and the scene keeps its own wheel stepping.
// ---------------------------------------------------------------------------

type SeekableTransition = {
  object: { currentTransitionEvent?: unknown };
  init: () => void;
  seek: (progress: number) => void;
};

type WheelScrollEvent = {
  data: { steps: number };
  scrollCounter: number;
  actions: { Transition: SeekableTransition[] };
};

const isScrubbable = (event: WheelScrollEvent) =>
  event?.data?.steps > 0 &&
  Array.isArray(event.actions?.Transition) &&
  event.actions.Transition.every((transition) => typeof transition.seek === "function" && typeof transition.init === "function");

/** Detaches a loaded scene's wheel-driven Scroll events and returns a seek to a progress (0 to 1), or null. */
export const scrubSplineScroll = (spline: Application): ((progress: number) => void) | null => {
  const wheelEvents: unknown = spline.eventManager?.handlers?.Scroll?.wheelEventsPerObject;
  if (!(wheelEvents instanceof Map) || wheelEvents.size === 0) return null;
  const events = [...wheelEvents.values()].flat() as WheelScrollEvent[];
  if (!events.every(isScrubbable)) return null;
  wheelEvents.clear();

  return (progress) => {
    const at = Math.min(Math.max(progress, 0), 1);
    for (const event of events) {
      // As the runtime's own step does: bind every transition to the event driving it, then seek.
      for (const transition of event.actions.Transition) {
        if (transition.object.currentTransitionEvent !== event) {
          transition.object.currentTransitionEvent = event;
          transition.init();
        }
      }
      event.scrollCounter = at * event.data.steps;
      event.actions.Transition.forEach((transition) => transition.seek(at));
    }
    spline.requestRender();
  };
};
