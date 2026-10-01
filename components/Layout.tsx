import Hamburger from "./Hamburger";
import Navbar from "./Navbar";

const Layout = ({ children, drawerKey }: { children: React.ReactNode; drawerKey?: string }) => {
  return (
    <div className="bg-transparent flex min-h-[100dvh] w-full flex-row justify-start overflow-x-hidden" id="visits">
      <div className="flex min-h-full w-full flex-col">
        {children}
        <Navbar />
        <Hamburger key={drawerKey} />
      </div>
    </div>
  );
}

export default Layout;
