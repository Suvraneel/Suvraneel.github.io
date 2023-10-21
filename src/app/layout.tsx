import AsciiArt from "@components/AsciiArt";
// import Hamburger from "@components/Hamburger";
import Navbar from "@components/Navbar";
import Providers from "@components/Providers";
// import NextNProgress from "@components/NextNProgress";
import "@fontsource/playfair-display";
import "@fontsource/raleway/400.css";
import "@styles/globals.css";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to Next.js',
}

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // This is the root layout
    <html lang="en">
      <body>
        <Providers>

          <div className="bg-transparent flex flex-row justify-start w-screen h-screen" id="visits">
            <div className="flex flex-col h-full w-full">
              <AsciiArt />
              {/* <NextNProgress color="#B338FF" /> */}
              {children}
              <Navbar />
              {/* <Hamburger /> */}
            </div>
          </div>
        </Providers>
      </body>
    </html >
  )
}