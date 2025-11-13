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
        </Head>
        <body><Main/><NextScript/></body>
      </Html>
    );
  }
}
export default MyDocument;
