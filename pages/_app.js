// pages/_app.js
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import Layout from '../_components/Layout';
import '../styles/globals.css';
//import "../lib/charts.js";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  const ADS_CLIENT = 'ca-pub-1869932115288976';

  // ✅ charts helper: client-only (avoid SSR crash when window/document is used)
  useEffect(() => {
    import('../lib/charts.js').catch(() => {});
  }, []);

  useEffect(() => {
    if (!GA_ID) return;
    const handleRouteChange = (url) => {
      window.gtag && window.gtag('config', GA_ID, { page_path: url });
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events, GA_ID]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      {/* GA4 */}
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { send_page_view: true });
            `}
          </Script>
        </>
      )}

      {/* ✔ AdSense Loader – ONLY THIS SCRIPT */}
      <Script
        id="adsbygoogle-loader"
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CLIENT}`}
        crossOrigin="anonymous"
      />

      {/* ❌ 삭제됨: Auto Ads push → 광고 오류 원인 */}
      {/*
      <Script id="adsbygoogle-auto" strategy="afterInteractive">
        {(adsbygoogle = window.adsbygoogle || []).push({});}
      </Script>
      */}

      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;
