//proxy.js
import { NextResponse } from "next/server";

export function proxy(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
  const url = req.nextUrl.clone();
  const originalPath = url.pathname;
  const href = url.href;

  const beforePath = req.nextUrl.pathname;
  const beforeSearch = req.nextUrl.search; // '?a=1' 또는 ''
  // ✅ 정적 파일/Next 내부 경로는 제외
  const STATIC_EXT_RE =
    /\.(?:xml|txt|png|jpe?g|webp|svg|ico|gif|css|js|map|json|woff2?|ttf|eot|otf|pdf|mp4|webm|webmanifest)$/i;
  if (
    originalPath.startsWith("/_next") ||
    originalPath.startsWith("/api") ||
    originalPath === "/favicon.ico" ||
    STATIC_EXT_RE.test(originalPath) ||
    originalPath === "/apple-app-site-association" ||
    originalPath === "/.well-known/apple-app-site-association"
  ) return NextResponse.next();
 

  let changed = false;
  let path = originalPath;

  // ✅ 카테고리 canonical case 매핑 (중복/404 방지: economicinfo -> economicInfo 등)
  const CATEGORY_CANON = {
    economicinfo: "economicInfo",
    personalfinance: "personalFinance",
    investinginfo: "investingInfo",
  };


  // ✅ 템플릿 문자열 URL 방어: [ ] 및 인코딩(%5B/%5D)까지 바로 404
  if (path.includes("[") || path.includes("]") || /%5b|%5d/i.test(href)) {
    return new NextResponse("Not Found", { status: 404 });
  }  

  // ✅ (0) marketing/query 노이즈 제거 (중복 URL 감소 → category hub/목차 페이지 색인에 도움)
  // - 필요한 쿼리는 남기고, 추적용 파라미터만 제거
  // - lang 은 아래에서 별도로 처리
  const DROP_QS = [
    /^utm_/i,
    /^(gclid|fbclid|igshid|mc_cid|mc_eid)$/i,
  ];
  for (const key of Array.from(url.searchParams.keys())) {
    if (key === "lang") continue;
    if (DROP_QS.some((re) => re.test(key))) {
      url.searchParams.delete(key);
      changed = true;
    }
  }

  // ✅ (1) double-slash 정규화
  const collapsed = path.replace(/\/{2,}/g, "/");
  if (collapsed !== path) {
    path = collapsed;
    changed = true;
  }

  // ✅ (1.25) index.html 류 제거
  if (/\/index\.html?$/i.test(path)) {
    path = path.replace(/\/index\.html?$/i, "");
    if (path === "") path = "/";
    changed = true;
  }

  // ✅ (1.5) /en/en 정규화 (체인 줄이기)
  if (path === "/en/en") { path = "/en"; changed = true; }
  else if (path.startsWith("/en/en/")) { path = path.replace(/^\/en\/en/, "/en"); changed = true; }

  if (path === "/category/economics") { path = "/category/economicInfo"; changed = true; }

  // ✅ (1.6) /ko prefix 정규화
  if (path === "/ko") { path = "/"; changed = true; }
  else if (path.startsWith("/ko/")) { path = path.replace(/^\/ko/, ""); changed = true; }


  // ✅ (2) lang 파라미터 정리 + locale prefix 정규화
  const lang = url.searchParams.get("lang");
  if (lang === "en" || lang === "ko") {
    url.searchParams.delete("lang");
    changed = true;

    if (lang === "en") {
      if (path === "/") path = "/en";
      else if (!path.startsWith("/en")) path = `/en${path}`;
    } else {
      // lang === "ko"
      if (path === "/en" || path === "/en/") path = "/";
      else if (path.startsWith("/en/")) path = path.replace(/^\/en/, "");
    }
  }

  // ✅ (2.5) legacy 언어 패턴 정리
  // /posts/{cat}/en/{slug} -> /en/posts/{cat}/{slug}
  let m = path.match(/^\/posts\/([^/]+)\/en\/([^/]+)$/);
  if (m) { path = `/en/posts/${m[1]}/${m[2]}`; changed = true; }

  // /en/posts/{cat}/ko/{slug} -> /posts/{cat}/{slug}
  m = path.match(/^\/en\/posts\/([^/]+)\/ko\/([^/]+)$/);
  if (m) { path = `/posts/${m[1]}/${m[2]}`; changed = true; }

  // (옵션) /en/posts/{cat}/en/{slug} -> /en/posts/{cat}/{slug}
  m = path.match(/^\/en\/posts\/([^/]+)\/en\/([^/]+)$/);
  if (m) { path = `/en/posts/${m[1]}/${m[2]}`; changed = true; }

  // (옵션) /posts/{cat}/ko/{slug} -> /posts/{cat}/{slug}
  m = path.match(/^\/posts\/([^/]+)\/ko\/([^/]+)$/);
  if (m) { path = `/posts/${m[1]}/${m[2]}`; changed = true; }

  // ✅ (2.75) category case 정규화
  // - /en/posts/{cat}/{slug} , /posts/{cat}/{slug}
  // - /en/category/{cat} , /category/{cat}
  // - trailing slash 유무 모두 커버(/?$)
  const getCanonCat = (cat) => {
    if (!cat) return null;
    return CATEGORY_CANON[String(cat).toLowerCase()] || null;
  };

  let mm;

  // /en/posts/{cat}/{slug}
  mm = path.match(/^\/en\/posts\/([^/]+)\/([^/]+)\/?$/);
  if (mm) {
    const cat = mm[1];
    const slug = mm[2];
    const canon = getCanonCat(cat);
    if (canon && cat !== canon) {
      path = `/en/posts/${canon}/${slug}`;
      changed = true;
    }
  }

  // /posts/{cat}/{slug}
  mm = path.match(/^\/posts\/([^/]+)\/([^/]+)\/?$/);
  if (mm) {
    const cat = mm[1];
    const slug = mm[2];
    const canon = getCanonCat(cat);
    if (canon && cat !== canon) {
      path = `/posts/${canon}/${slug}`;
      changed = true;
    }
  }

  // /en/category/{cat}
  mm = path.match(/^\/en\/category\/([^/]+)\/?$/);
  if (mm) {
    const cat = mm[1];
    const canon = getCanonCat(cat);
    if (canon && cat !== canon) {
      path = `/en/category/${canon}`;
      changed = true;
    }
  }

  // /category/{cat}
  mm = path.match(/^\/category\/([^/]+)\/?$/);
  if (mm) {
    const cat = mm[1];
    const canon = getCanonCat(cat);
    if (canon && cat !== canon) {
      path = `/category/${canon}`;
      changed = true;
    }
  }

  // ✅ (3) 고정 URL 매핑 (※ 여기서 path 기준으로 적용)
  const fixed = {
    "/posts/usd-krw-weak-won-sector-map-kospi":
      "/posts/investingInfo/usd-krw-weak-won-sector-map-kospi",
    "/posts/investingInfo/usd-krw-exchange-rate-kospi":
      "/posts/investingInfo/usd-krw-weak-won-sector-map-kospi",
    "/posts/investingInfo/usdkrw-exchange-rate-and-kospi":
      "/posts/investingInfo/usd-krw-exchange-rate-and-kospi",
    "/category/investing": "/category/investingInfo",
    "/category/tax": "/category/personalFinance",
    "/posts/compound-interest": "/tools/compound-interest",

    // en 쪽도 혹시 들어오면 같이 정리 (안전빵)
    "/en/category/investing": "/en/category/investingInfo",
    "/en/category/tax": "/en/category/personalFinance",
  };

  // fixed는 “트레일링 슬래시 제거 전/후” 모두 잡히게 처리
  const pathNoSlash = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  if (fixed[pathNoSlash]) {
    path = fixed[pathNoSlash];
    changed = true;
  }

  // ✅ (4) 트레일링 슬래시 정리 (루트 "/" 제외)
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
    changed = true;
  }

  // ✅ 최종 URL 계산
  url.pathname = path;
  const afterPath = url.pathname;
  const afterSearch = url.search;

  // ✅ "진짜로 달라질 때만" redirect (셀프-redirect 무한루프 방지)
  if (afterPath !== beforePath || afterSearch !== beforeSearch) {
    const status = (req.method === "GET" || req.method === "HEAD") ? 301 : 308;
    const res = NextResponse.redirect(url, status);
    // 🔎 (원인 추적용) 이 헤더가 보이면 "미들웨어가 리다이렉트 만든 것"
    res.headers.set("x-fm-redirect", "middleware");
    return res;
  }
  return NextResponse.next();
}

// 미들웨어 적용 범위 (전체에 걸되, 위에서 제외 처리함)
export const config = {
  matcher: ["/:path*"],
};
