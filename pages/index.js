import { useTheme } from 'next-themes';
import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';

export default function Home() {
  const { theme, setTheme } = useTheme()
  return (
    <Layout>
      <Head>
        <title>Portfolio</title>
      </Head>
    </Layout>
  );
}