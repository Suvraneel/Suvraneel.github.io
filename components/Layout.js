import { Navbar } from './Navbar';

const name = 'Suvraneel';
export const siteTitle = 'Next.js Sample Website';

export default function Layout({ children }) {
  return (
    <div className="bg-transparent">
        <Navbar/>
        {children}
    </div>
  );
}