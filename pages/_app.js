import '@/styles/globals.css';
import { useEffect } from 'react';
import { FirebaseProvider } from '@/contexts/FirebaseProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import GlobalNavbar from '@/components/funcade/GlobalNavbar';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }
  }, []);

  return (
    <FirebaseProvider>
      <AuthProvider>
        <Head>
          <title>Funcade | Arcade Platform</title>
          <meta name="description" content="Real-time multiplayer premium arcade platform." />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>
        <main className={inter.className}>
          <GlobalNavbar />
          <Component {...pageProps} />
        </main>
      </AuthProvider>
    </FirebaseProvider>
  );
}
