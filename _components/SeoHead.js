// _components/SeoHead.js
import Head from "next/head";
import { useRouter } from "next/router";

const SITE_URL = "https://www.finmaphub.com";

function normalizePath(input) {
  const safeUrl = String(input || "/").trim() || "/";
  let pathname = safeUrl;

  try {
    if (/^https?:\/\//i.test(safeUrl)) {
      const parsed = new URL(safeUrl);
      pathname = parsed.pathname || "/";
    } else {
      pathname = safeUrl.split("?")[0].split("#")[0];
    }
  } catch {
    pathname = "/";
  }

  const rawPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  let path = rawPath.replace(/^\/en(?=\/|$)/, "").replace(/^\/ko(?=\/|$)/, "");
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path || "/";
}

function normalizeAlternateHref(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";

  try {
    const parsed = new URL(raw, SITE_URL);
    if (parsed.origin !== SITE_URL) return "";

    let path = parsed.pathname || "/";
    if (path === "/ko") path = "/";
    else if (path.startsWith("/ko/")) path = path.replace(/^\/ko/, "") || "/";
    if (path === "/en/en") path = "/en";
    else if (path.startsWith("/en/en/")) path = path.replace(/^\/en\/en/, "/en");
    path = path.replace(/\/{2,}/g, "/");
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

    return `${SITE_URL}${path || "/"}${parsed.search || ""}${parsed.hash || ""}`;
  } catch {
    return "";
  }
}

export default function SeoHead({
  title,
  desc,
  url = "/",
  canonical,
  image,
  locale,
  type,
  robots,
  alternateLanguages = true,
  hreflangAlternates,
}) {
  const router = useRouter();

  const effectiveLocale = locale || (router.locale === "en" ? "en" : "ko");

  // ✅ og:type 자동 결정 (기본: 툴/일반=website, 포스트=article)
  const autoType =
    type || (router?.pathname?.startsWith("/posts") ? "article" : "website");

  const normalizedPath = normalizePath(canonical || url);
  const prefix = effectiveLocale === "en" ? "/en" : "";

  // ✅ 홈(/)일 때만 /en/ -> /en 으로 통일 (리디렉션 포함 페이지 방지)
  const canonicalPath =
    prefix === "/en" && normalizedPath === "/" ? "/en" : `${prefix}${normalizedPath}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  const ogImg = image
    ? (String(image).startsWith("http")
        ? image
        : `${SITE_URL}${String(image).startsWith("/") ? image : `/${image}`}`)
    : `${SITE_URL}/og-default.png`;

  const inferredHrefKo = `${SITE_URL}${normalizedPath}`;
  // ✅ hreflang도 동일 규칙 적용: 홈은 /en
  const inferredHrefEn = normalizedPath === "/" ? `${SITE_URL}/en` : `${SITE_URL}/en${normalizedPath}`;
  const explicitHrefKo = normalizeAlternateHref(hreflangAlternates?.ko);
  const explicitHrefEn = normalizeAlternateHref(hreflangAlternates?.en);
  const hasExplicitAlternates = Boolean(explicitHrefKo && explicitHrefEn);
  const hrefKo = alternateLanguages && hasExplicitAlternates ? explicitHrefKo : inferredHrefKo;
  const hrefEn = alternateLanguages && hasExplicitAlternates ? explicitHrefEn : inferredHrefEn;
  const shouldEmitXDefault = normalizedPath === "/";

  // ✅ OG locale 신호 강화(권장)
  const ogLocale = effectiveLocale === "en" ? "en_US" : "ko_KR";
  const ogAltLocale = effectiveLocale === "en" ? "ko_KR" : "en_US";

  return (
    <Head>
      <title>{title ? `${title} | FinMap` : "FinMap"}</title>
      {desc && <meta name="description" content={desc} />}

      {robots && <meta name="robots" content={robots} />}
      {robots && <meta name="googlebot" content={robots} />}

      <link rel="canonical" href={canonicalUrl} />
      {alternateLanguages ? (
        <>
          <link rel="alternate" hrefLang="ko" href={hrefKo} />
          <link rel="alternate" hrefLang="en" href={hrefEn} />
          {shouldEmitXDefault && <link rel="alternate" hrefLang="x-default" href={hrefKo} />}
        </>
      ) : (
        <>
          <link rel="alternate" hrefLang={effectiveLocale === "en" ? "en" : "ko"} href={canonicalUrl} />
          {shouldEmitXDefault && <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />}
        </>
      )}
      <link rel="alternate" type="application/rss+xml" title="FinMap RSS" href={`${SITE_URL}/rss.xml`} />

      <meta property="og:title" content={title || "FinMap"} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="FinMap" />
      <meta property="og:type" content={autoType} />
      <meta property="og:image" content={ogImg} />

      <meta property="og:locale" content={ogLocale} />
      {alternateLanguages && <meta property="og:locale:alternate" content={ogAltLocale} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || "FinMap"} />
      {desc && <meta name="twitter:description" content={desc} />}
      <meta name="twitter:image" content={ogImg} />
    </Head>
  );
}
