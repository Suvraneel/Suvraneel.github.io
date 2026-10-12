"use client";

import { useIsPresent } from "framer-motion";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useContext, useState, type ReactNode } from "react";

/**
 * Keeps an exiting route rendering the segment it showed while it was live.
 * Without this, the App Router context update that mounts the next page would
 * also re-render the exiting copy as the next page, so both layers would show
 * the destination during the push.
 */
export default function FrozenRouter({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const isPresent = useIsPresent();
  const [frozen, setFrozen] = useState(context);

  // Track the live context while present; freeze the last one once exiting.
  if (isPresent && context !== frozen) setFrozen(context);

  if (!context) return <>{children}</>;

  return (
    <LayoutRouterContext.Provider value={isPresent ? context : frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}
