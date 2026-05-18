// _components/ToolSeo.js
import Head from "next/head";
import { useRouter } from "next/router";
import SeoHead from "./SeoHead";

function buildCanonical(site, asPath, effectiveLocale) {
  // SeoHead와 동일한 철학: query/hash 제거, /en 중복 제거, URL path 정규화
  const safeUrl = String(asPath || "/");
  let noQuery = safeUrl.split("?")[0].split("#")[0];
  try {
    if (/^https?:\/\//i.test(safeUrl)) noQuery = new URL(safeUrl).pathname || "/";
  } catch {
    noQuery = "/";
  }
  const rawPath = noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
  let path = rawPath.replace(/^\/en(?=\/|$)/, "").replace(/^\/ko(?=\/|$)/, "");
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  const normalizedPath = path || "/";

  const prefix = effectiveLocale === "en" ? "/en" : "";
  const canonicalPath =
    prefix === "/en" && normalizedPath === "/" ? "/en" : `${prefix}${normalizedPath}`;

  return `${site}${canonicalPath}`;
}

function buildOgImage(site, image) {
  if (!image) return `${site}/og-default.png`;
  const s = String(image);
  if (s.startsWith("http")) return s;
  return `${site}${s.startsWith("/") ? s : `/${s}`}`;
}

export default function ToolSeo({
  title,
  desc,
  image,
  url,
  canonical,
  locale,
  robots = "index,follow,max-image-preview:large",
  // JSON-LD 옵션
  appName, // 없으면 title 사용
  appCategory = "FinanceApplication",
  priceCurrency = "KRW",
  isFree = true,
  about, // 필요 시 { "@type": "...", "name": "..." } 등
  keywords, // optional
}) {
  const router = useRouter();
  const site = "https://www.finmaphub.com";
  const effectiveLocale = locale || (router.locale === "en" ? "en" : "ko");
  const seoUrl = canonical || url || router.asPath;
  const canonicalUrl = canonical || buildCanonical(site, seoUrl, effectiveLocale);
  const ogImg = buildOgImage(site, image);

  const inLanguage = effectiveLocale === "en" ? "en" : "ko-KR";

  const webAppLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: appName || title || "FinMap Tool",
    description: desc || "",
    url: canonicalUrl,
    image: ogImg,
    applicationCategory: appCategory,
    operatingSystem: "Web",
    inLanguage,
    isAccessibleForFree: !!isFree,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency,
    },
    publisher: {
      "@type": "Organization",
      name: "FinMap",
      url: site,
    },
  };

  if (!desc) delete webAppLd.description;
  if (!image) delete webAppLd.image;
  if (!isFree) delete webAppLd.offers;
  if (about) webAppLd.about = about;
  if (keywords) webAppLd.keywords = keywords;

  return (
    <>
      {/* ✅ canonical/hreflang/og/twitter는 SeoHead가 처리 */}
      <SeoHead
        title={title}
        desc={desc}
        url={seoUrl}          // ✅ query/hash 있어도 SeoHead가 canonical 안정화
        canonical={canonical}
        image={image}
        locale={effectiveLocale}
        robots={robots}
        type="website"        // ✅ 도구는 article이 아니라 website/WebApp 성격
      />

      {/* ✅ Tool(WebApplication) JSON-LD */}
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }}
        />
      </Head>
    </>
  );
}
