import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render(){
    return (
      <Html lang="ko">
        <Head>
          {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}></script>
            <script dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `
            }}/>
          </>
        )}
        </Head>
        <body><Main/><NextScript/></body>
      </Html>
    );
  }
}
export default MyDocument;
