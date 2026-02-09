import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();
  const originalPath = url.pathname;
  const href = url.href;

  // ✅ 정적 파일/Next 내부 경로는 제외
  if (
    originalPath.startsWith("/_next") ||
    originalPath.startsWith("/api") ||
    originalPath === "/favicon.ico" ||
    originalPath.endsWith(".xml") ||
    originalPath.endsWith(".txt") ||
    originalPath.endsWith(".png") ||
    originalPath.endsWith(".jpg") ||
    originalPath.endsWith(".jpeg") ||
    originalPath.endsWith(".webp") ||
    originalPath.endsWith(".svg") ||
    originalPath.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  let changed = false;
  let path = originalPath;

  // ✅ 템플릿 문자열 URL 방어: [ ] 및 인코딩(%5B/%5D)까지 바로 404
  if (
    path.includes("[") || path.includes("]") ||
    href.includes("%5B") || href.includes("%5D")
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // ✅ (0) i18n defaultLocale 중복 제거: /ko/... → /...
  if (path === "/ko") { path = "/"; changed = true; }
  else if (path.startsWith("/ko/")) { path = path.replace(/^\/ko/, ""); changed = true; }


  // ✅ (1) double-slash 정규화
  const collapsed = path.replace(/\/{2,}/g, "/");
  if (collapsed !== path) {
    path = collapsed;
    changed = true;
  }

  // ✅ (1.5) /en/en 정규화 (체인 줄이기)
  if (path === "/en/en") { path = "/en"; changed = true; }
  else if (path.startsWith("/en/en/")) { path = path.replace(/^\/en\/en/, "/en"); changed = true; }

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

  // ✅ (3) 고정 URL 매핑 (※ 여기서 path 기준으로 적용)
  const fixed = {
    "/posts/usd-krw-weak-won-sector-map-kospi":
      "/posts/investingInfo/usd-krw-weak-won-sector-map-kospi",
    "/posts/investingInfo/usdkrw-exchange-rate-and-kospi":
      "/posts/investingInfo/usd-krw-exchange-rate-and-kospi",
    "/category/investing": "/category/investingInfo",
    "/category/tax": "/category/personalFinance",

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

  // ✅ 최종 redirect 1회만
  if (changed) {
    url.pathname = path;    
    return NextResponse.redirect(url, 308); // 영구 정규화
  }

  return NextResponse.next();
}

// 미들웨어 적용 범위 (전체에 걸되, 위에서 제외 처리함)
export const config = {
  matcher: ["/:path*"],
};
