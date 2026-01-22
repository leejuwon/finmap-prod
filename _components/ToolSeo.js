// _components/ToolSeo.js
import Head from "next/head";
import { useRouter } from "next/router";
import SeoHead from "./SeoHead";

function buildCanonical(site, asPath, effectiveLocale) {
  // SeoHead와 동일한 철학: query/hash 제거, /en 중복 제거, 홈(/)만 /en로 통일
  const safeUrl = String(asPath || "/");
  const noQuery = safeUrl.split("?")[0].split("#")[0];
  const rawPath = noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
  const path = rawPath.replace(/^\/en(?=\/|$)/, "");
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
  const effectiveLocale = (router.locale === "en" ? "en" : "ko");
  const canonical = buildCanonical(site, router.asPath, effectiveLocale);
  const ogImg = buildOgImage(site, image);

  const inLanguage = effectiveLocale === "en" ? "en" : "ko-KR";

  const webAppLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: appName || title || "FinMap Tool",
    description: desc || "",
    url: canonical,
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
        url={router.asPath}   // ✅ query/hash 있어도 SeoHead가 canonical 안정화
        image={image}
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
