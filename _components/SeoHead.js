// _components/SeoHead.js
import Head from "next/head";
import { useRouter } from "next/router";

export default function SeoHead({ title, desc, url = "/", image, locale, type }) {
  const router = useRouter();
  const site = "https://www.finmaphub.com";

  const effectiveLocale = locale || (router.locale === "en" ? "en" : "ko");

    // ✅ og:type 자동 결정 (기본: 툴/일반=website, 포스트=article)
  const autoType =
    type ||
    (router?.pathname?.startsWith("/posts") ? "article" : "website");

  // ✅ url에 쿼리/해시가 붙어도 canonical/hreflang이 흔들리지 않도록 제거
  const safeUrl = String(url || "/");
  const noQuery = safeUrl.split("?")[0].split("#")[0];
  const rawPath = noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
  const path = rawPath.replace(/^\/en(?=\/|$)/, ""); // url에 실수로 /en 붙여도 제거
  const normalizedPath = path || "/";
  const prefix = effectiveLocale === "en" ? "/en" : "";
  const canonical = `${site}${prefix}${normalizedPath}`;

  const ogImg = image
    ? (String(image).startsWith("http") ? image : `${site}${image.startsWith("/") ? image : `/${image}`}`)
    : `${site}/og-default.png`;

  const hrefKo = `${site}${normalizedPath}`;
  const hrefEn = `${site}/en${normalizedPath}`;

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
      <meta property="og:type" content={autoType} />
      <meta property="og:image" content={ogImg} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || "FinMap"} />
      {desc && <meta name="twitter:description" content={desc} />}
      <meta name="twitter:image" content={ogImg} />
    </Head>
  );
}
