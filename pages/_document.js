import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);

    // ✅ Next i18n이 켜져 있으면 locale이 들어올 수 있음 (가장 신뢰도 높음)
    const locale = ctx.locale;

    // ✅ fallback: req.url 기반
    const reqUrl = ctx.req?.url || "";
    const isEnByPath = reqUrl === "/en" || reqUrl.startsWith("/en/");

    const htmlLang = locale === "en" || isEnByPath ? "en" : "ko";

    return {
      ...initialProps,
      htmlLang,
      __debugLocale: locale || "",
      __debugReqUrl: reqUrl,
    };
  }

  render() {
    const htmlLang = this.props.htmlLang || "ko";

    return (
      <Html lang={htmlLang}>
        <Head>

          {/* ✅ AdSense 사이트 검증용 메타 태그 */}
          <meta
            name="google-adsense-account"
            content="ca-pub-1869932115288976"
          />
          <meta
            name="google-site-verification"
            content="8FhqQNDjbZ-QpdePXdPiCR_VJwQstaK-tbuYIlXxs_A"
          />

          {/* ✅ Favicon */}
          <link rel="icon" href="/favicon-v2.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
          <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />

          {/* ✅ PWA 대응 (선택) */}
          <meta name="theme-color" content="#0f172a" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
