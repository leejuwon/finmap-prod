import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();
  const { pathname } = url;

  // ✅ 정적 파일/Next 내부 경로는 제외
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".xml") ||
    pathname.endsWith(".txt") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  // ✅ (NEW-1) double-slash 정규화: /en/posts//investingInfo/... → /en/posts/investingInfo/...
  // (GSC에 실제로 떠있는 케이스가 있으니 미들웨어에서 잡아주는 게 가장 확실)  
  const collapsed = pathname.replace(/\/{2,}/g, "/");
  if (collapsed !== pathname) {
    url.pathname = collapsed;
    return NextResponse.redirect(url, 308);
  }

  // ✅ (NEW-2) 트레일링 슬래시 정리: /xxx/ → /xxx  (루트 "/"만 예외)
  // 정적 파일은 위에서 이미 제외됨
  if (pathname.length > 1 && pathname.endsWith("/")) {
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, 308);
  }

  // ✅ (NEW-3) ?lang=en|ko 쿼리 정리 (next.config redirects로는 쿼리 제거 불가)
  const lang = url.searchParams.get("lang");
  if (lang === "en" || lang === "ko") {
    url.searchParams.delete("lang");

    if (lang === "en") {
      // /?lang=en → /en
      if (pathname === "/") {
        url.pathname = "/en";
      } else if (!pathname.startsWith("/en")) {
        // /posts/... ?lang=en → /en/posts/...
        url.pathname = `/en${pathname}`;
      }
    }

    if (lang === "ko") {
      // /en?lang=ko → /
      if (pathname === "/en") {
        url.pathname = "/";
      } else if (pathname.startsWith("/en/")) {
        // /en/posts/... ?lang=ko → /posts/...
        url.pathname = pathname.replace(/^\/en/, "");
      }
      // ko는 defaultLocale이므로, /category/... ?lang=ko 같은 건 "쿼리만 제거"가 됨
    }

    return NextResponse.redirect(url, 308);
  }

  // ✅ (유지) GSC 404로 남아있는 고정 URL 4개 강제 정리 (308)
  const fixed = {
    "/posts/usd-krw-weak-won-sector-map-kospi":
      "/posts/investingInfo/usd-krw-weak-won-sector-map-kospi",

    "/posts/investingInfo/usdkrw-exchange-rate-and-kospi":
      "/posts/investingInfo/usd-krw-exchange-rate-and-kospi",

    "/category/investing": "/category/investingInfo",
    "/category/tax": "/category/personalFinance",
  };

  const dest = fixed[pathname];
  if (dest) {
    url.pathname = dest;    
    return NextResponse.redirect(url, 308);
  }

  // ✅ 템플릿 문자열 URL 방어: [ ] 포함 경로는 바로 404
  if (pathname.includes("[") || pathname.includes("]")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.next();
}

// 미들웨어 적용 범위 (전체에 걸되, 위에서 제외 처리함)
export const config = {
  matcher: ["/:path*"],
};
