// _components/SeoHead.js
import Head from "next/head";
import { useRouter } from "next/router";

export default function SeoHead({ title, desc, url = "/", image, locale }) {
  const router = useRouter();
  const site = "https://www.finmaphub.com";

  const effectiveLocale = locale || (router.locale === "en" ? "en" : "ko");

  const path = url.startsWith("/") ? url : `/${url}`;
  const prefix = effectiveLocale === "en" ? "/en" : "";
  const canonical = `${site}${prefix}${path}`;

  const ogImg = image
    ? (String(image).startsWith("http") ? image : `${site}${image.startsWith("/") ? image : `/${image}`}`)
    : `${site}/og-default.png`;

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
