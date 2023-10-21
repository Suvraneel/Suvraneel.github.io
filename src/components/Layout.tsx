import Hamburger from "./Hamburger";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="bg-transparent flex flex-row justify-start w-screen h-screen" id="visits">
      <div className="flex flex-col h-full w-full">
        {children}
        <Navbar />
        <Hamburger />
      </div>
    </div>
  );
}

export default Layout;
