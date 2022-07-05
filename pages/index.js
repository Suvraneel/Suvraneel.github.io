import { useTheme } from 'next-themes';
import Head from 'next/head';
import utilStyles from '../styles/utils.module.css';
import '../styles/Home.module.css'

export default function Home() {
  const { theme } = useTheme()
  return (
    <>
      <Head>
        <title>Portfolio</title>
      </Head>
      <div>
        <h1 className="namebar text-7xl relative top-32 left-32 font-medium">
          Hey there,<br/>I&apos;m <span>Suvraneel</span>
        </h1>
      </div>
    </>
  );
}