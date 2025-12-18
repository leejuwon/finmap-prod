// _components/SeoHead.js
import Head from "next/head";

export default function SeoHead({ title, desc, url = "/", image, locale = "ko" }) {
  const site = "https://www.finmaphub.com";

  const path = url.startsWith("/") ? url : `/${url}`;
  const prefix = locale === "en" ? "/en" : "";
  const canonical = `${site}${prefix}${path}`;

  const ogImg = image || `${site}/og-default.png`;

  // ✅ hreflang
  const hrefKo = `${site}${path}`;
  const hrefEn = `${site}/en${path}`;

  return (
    <Head>
      <title>{title ? `${title} | FinMap` : "FinMap"}</title>
      {desc && <meta name="description" content={desc} />}

      <link rel="canonical" href={canonical} />

      <link rel="alternate" hrefLang="ko" href={hrefKo} />
      <link rel="alternate" hrefLang="en" href={hrefEn} />
      <link rel="alternate" hrefLang="x-default" href={hrefKo} />

      {/* OG / Twitter */}
      <meta property="og:title" content={title || "FinMap"} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="FinMap" />
      <meta property="og:type" content="article" />
      <meta property="og:image" content={ogImg} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || "FinMap"} />
      {desc && <meta name="twitter:description" content={desc} />}
      <meta name="twitter:image" content={ogImg} />
    </Head>
  );
}
