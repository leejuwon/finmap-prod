// pages/_app.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import Layout from '../_components/Layout';   // ✅ Layout 추가
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  // 라우팅될 때마다 page_view 전송
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

      {/* ✅ Layout으로 전체 페이지 감싸기 */}
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;
