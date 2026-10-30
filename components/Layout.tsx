"use client";

import { useDashboardScene } from "./DashboardScene";
import Hamburger from "./Hamburger";
import Navbar from "./Navbar";

const Layout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // The first-visit preloader covers everything; until it exits, focus and
  // screen readers must not reach the page hidden underneath.
  const { preloaderActive } = useDashboardScene();

  return (
    // overflow-x-clip, not hidden: a scroll container here would catch sticky
    // elements (the Skills switcher) before they reach the window.
    <div
      className="bg-transparent flex min-h-[100dvh] w-full flex-row justify-start overflow-x-clip"
      id="visits"
      inert={preloaderActive}
    >
      <div className="flex min-h-full w-full flex-col">
        {children}
        <Navbar />
        <Hamburger />
      </div>
    </div>
  );
}

export default Layout;
