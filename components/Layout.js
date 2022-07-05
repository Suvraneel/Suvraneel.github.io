import { Navbar } from './Navbar';

const name = 'Suvraneel';
export const siteTitle = 'Next.js Portfolio Website';

export default function Layout({ children }) {
  return (
    <div className="bg-transparent flex flex-row justify-start w-screen h-screen overflow-auto">
        <Navbar/>
        <div className="flex flex-col">
          {children}
        </div>
    </div>
  );
}