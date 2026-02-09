// _components/Header.js
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { setLang } from "../lib/lang";

/* ------------------------------
   1️⃣ 상위 네비게이션
-------------------------------- */
const navItems = [
  { href: "/", labelKo: "홈", labelEn: "Home" },
  { href: "/market", labelKo: "시장정보", labelEn: "Market Info"},
  { href: "/tools", labelKo: "금융도구", labelEn: "Finance Tools" },
];

/* ------------------------------
   2️⃣ Blog / Insights 하위 메뉴
-------------------------------- */
const blogItems = [
  { href: "/category/economicInfo", labelKo: "경제정보", labelEn: "Economics" },
  { href: "/category/personalFinance", labelKo: "재테크", labelEn: "Personal Finance" },
  { href: "/category/investingInfo", labelKo: "투자정보", labelEn: "Investing" },
];

export default function Header() {
  const router = useRouter();

  /* ------------------------------
     언어 상태
  -------------------------------- */
  const lang = router.locale === "en" ? "en" : "ko";

  /* ------------------------------
     포스트 번역 가용성 이벤트
  -------------------------------- */
  const postAvailRef = useRef(null);
  const [langBlockMsg, setLangBlockMsg] = useState("");

  useEffect(() => {
    const onAvail = (e) => {
      postAvailRef.current = e?.detail || null;
    };
    window.addEventListener("fm_post_availability", onAvail);
    return () => window.removeEventListener("fm_post_availability", onAvail);
  }, []);

  useEffect(() => {
    setLangBlockMsg("");
  }, [router.asPath]);

  /* ------------------------------
     Blog dropdown 상태 + ref
  -------------------------------- */
  const [blogOpen, setBlogOpen] = useState(false);
  const blogWrapRef = useRef(null);

  // ✅ 바깥 클릭 시 닫기 (가장 안정적인 방식)
  useEffect(() => {
    const onDown = (e) => {
      if (!blogWrapRef.current) return;
      if (blogWrapRef.current.contains(e.target)) return;
      setBlogOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* ------------------------------
     언어 변경 핸들러
  -------------------------------- */
  const handleLangChange = async (next) => {
    if (!router.isReady) return;
    if (next === lang) return;

    const isPostDetail = router.pathname === "/posts/[category]/[slug]";

    // 포스트 상세: 번역 없으면 차단
    if (isPostDetail) {
      const available = postAvailRef.current?.available?.[next];
      if (!available) {
        setLangBlockMsg(
          lang === "ko"
            ? "이 글은 영어 버전이 아직 없습니다."
            : "This post doesn't have the other language version yet."
        );
        return;
      }
    }

    setLang(next);    

    // ✅ 혹시 query에 남아있을 수 있는 lang 파라미터 제거
    const q = { ...(router.query || {}) };
    delete q.lang;

    // ✅ 핵심: asPath(이미 /en 포함 가능)로 push하지 말고
    //          pathname/query + locale 옵션으로만 전환해야 토글이 안정적임
    await router.push({ pathname: router.pathname, query: q }, undefined, {
      locale: next,
    });
  };

  const nav = useMemo(() => navItems, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-slate-100">
      <nav className="w-full px-3 sm:px-4">
        <div className="w-full max-w-5xl lg:max-w-6xl mx-auto flex items-center gap-3 py-2 sm:py-3">
          {/* ---------------- Logo ---------------- */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/brand/finmaphub-icon.svg"
              alt="FinMap Logo"
              className="h-7 w-7 sm:h-8 sm:w-8"
            />
            <div className="leading-tight">
              <span className="block text-sm sm:text-base block text-[14px] sm:text-[16px] font-semibold text-slate-900">
                FinMap
              </span>
              <span className="hidden sm:block text-[11px] text-slate-500">
                {lang === "ko"
                  ? "금융 기초 · 투자계획 지도"
                  : "Personal Finance · Investing Map"}
              </span>
            </div>
          </Link>

          {/* ---------------- Navigation ---------------- */}
          <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-6">
            {/* ===== 가로 스크롤 영역 ===== */}
            <div className="header-nav flex items-center gap-1 sm:gap-2 text-[12px] sm:text-[14px]">
              {nav.map((item) => {
                const active =
                  item.href === "/"
                    ? router.pathname === "/"
                    : router.pathname.startsWith(item.href);

                const label = lang === "ko" ? item.labelKo : item.labelEn;

                if (item.comingSoon) {
                  return (
                    <span
                      key={item.href}
                      className="px-2 sm:px-3 py-1 rounded-full text-slate-400 bg-slate-50 cursor-not-allowed"
                    >
                      {label}
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      "px-2 sm:px-3 py-1 rounded-full transition-colors " +
                      (active
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
                    }
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* ===== Insights dropdown (스크롤 밖) ===== */}
            <div ref={blogWrapRef} className="relative">
              <button
                type="button"
                onClick={() => setBlogOpen((v) => !v)}
                className={
                  "px-2 sm:px-3 py-1 rounded-full transition-colors text-[12px] sm:text-[14px] " +
                  (router.pathname.startsWith("/category/")
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
                }
              >
                {lang === "ko" ? "인사이트" : "Insights"}
                <span className="ml-1">▾</span>
              </button>

              {blogOpen && (
                <div className="absolute left-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg p-1 z-50">
                  {blogItems.map((b) => {
                    const bLabel = lang === "ko" ? b.labelKo : b.labelEn;
                    const bActive = router.pathname.startsWith(b.href);

                    return (
                      <Link
                        key={b.href}
                        href={b.href}
                        className={
                          "block px-3 py-2 rounded-lg text-sm " +
                          (bActive
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-slate-700 hover:bg-slate-100")
                        }
                        onClick={() => setBlogOpen(false)}
                      >
                        {bLabel}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>


          {/* ---------------- Right: Language ---------------- */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <div className="flex border border-slate-200 rounded-full text-[9px] sm:text-[11px] md:text-xs overflow-hidden">
              <button
                type="button"
                onClick={() => handleLangChange("ko")}
                className={
                  "px-1.5 py-0.5 sm:px-2 sm:py-1 " +
                  (lang === "ko"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600")
                }
              >
                한국어
              </button>
              <button
                type="button"
                onClick={() => handleLangChange("en")}
                className={
                  "px-1.5 py-0.5 sm:px-2 sm:py-1 " +
                  (lang === "en"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600")
                }
              >
                EN
              </button>
            </div>

            {langBlockMsg && (
              <div className="mt-1 text-[11px] text-rose-600">
                {langBlockMsg}
              </div>
            )}

            <span className="header-domain text-[9px] sm:text-[11px] md:text-sm text-slate-500">
              finmaphub.com
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}
