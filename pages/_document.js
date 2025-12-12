import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render(){
    return (
      <Html lang="ko">
        <Head> 
          {/* ✅ AdSense 사이트 검증용 메타 태그 */}
          <meta
            name="google-adsense-account"
            content="ca-pub-1869932115288976"  // ← AdSense에서 보여준 값 그대로
          />
          <meta name="google-site-verification" content="8FhqQNDjbZ-QpdePXdPiCR_VJwQstaK-tbuYIlXxs_A" />

           {/* ✅ Favicon */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
          <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
          
          {/* ✅ PWA 대응 (선택) */}
          <meta name="theme-color" content="#0f172a" />
        </Head>
        <body><Main/><NextScript/></body>
      </Html>
    );
  }
}
export default MyDocument;
