import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

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
