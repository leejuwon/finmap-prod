import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render(){
    return (
      <Html lang="ko">
        <Head> 
          <meta name="google-site-verification" content="8FhqQNDjbZ-QpdePXdPiCR_VJwQstaK-tbuYIlXxs_A" />         
        </Head>
        <body><Main/><NextScript/></body>
      </Html>
    );
  }
}
export default MyDocument;
