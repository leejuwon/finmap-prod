import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl;
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

  // ✅ (NEW) GSC 404로 남아있는 고정 URL 4개 강제 정리 (308)
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
    // ✅ 쿼리는 그대로 유지 (url.search는 건드리지 않음)
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
