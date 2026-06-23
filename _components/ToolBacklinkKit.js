import Link from "next/link";
import {
  ClipboardDocumentIcon,
  CodeBracketIcon,
  LinkIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { trackGaEvent } from "../utils/analytics";

const SITE_URL = "https://www.finmaphub.com";

export const TOOL_BACKLINK_CONFIG = {
  compound: {
    path: "/tools/compound-interest",
    name: {
      ko: "복리 계산기",
      en: "Compound Interest Calculator",
    },
    shareTitle: {
      ko: "FinMap 복리 계산기",
      en: "FinMap Compound Interest Calculator",
    },
    shareDescription: {
      ko: "원금, 월 적립금, 수익률, 기간으로 미래가치를 계산하는 FinMap 복리 계산기입니다.",
      en: "Calculate future value from principal, monthly contributions, return, and time horizon.",
    },
    anchors: {
      ko: ["복리 계산기", "월복리 계산기", "복리 이자 계산기", "적립식 복리 계산기"],
      en: ["compound interest calculator", "monthly compound interest calculator", "future value calculator"],
    },
    ctaDescription: {
      ko: "원금·월 적립금·수익률·기간을 바꿔 장기 미래가치를 확인합니다.",
      en: "Test principal, monthly contributions, return, and time horizon for long-term future value.",
    },
  },
  cagr: {
    path: "/tools/cagr-calculator",
    name: {
      ko: "CAGR 계산기",
      en: "CAGR Calculator",
    },
    shareTitle: {
      ko: "FinMap CAGR 계산기",
      en: "FinMap CAGR Calculator",
    },
    shareDescription: {
      ko: "초기·최종 자산과 기간으로 연평균 복리 수익률을 계산하는 FinMap CAGR 계산기입니다.",
      en: "Calculate compound annual growth rate from starting value, ending value, and years.",
    },
    anchors: {
      ko: ["CAGR 계산기", "연평균 수익률 계산기", "연평균 성장률 계산기", "투자 수익률 계산기"],
      en: ["CAGR calculator", "annualized return calculator", "compound annual growth rate calculator"],
    },
    ctaDescription: {
      ko: "기간이 다른 투자 성과를 연평균 수익률 기준으로 비교합니다.",
      en: "Compare investments with different holding periods using annualized return.",
    },
  },
  dca: {
    path: "/tools/dca-calculator",
    name: {
      ko: "적립식 투자 계산기",
      en: "DCA Calculator",
    },
    shareTitle: {
      ko: "FinMap 적립식 투자 계산기",
      en: "FinMap DCA Calculator",
    },
    shareDescription: {
      ko: "월 납입액, 수익률, 기간, 세금·수수료를 반영해 적립식 투자 결과를 계산합니다.",
      en: "Simulate dollar-cost averaging with contribution, return, tax, fee, and time assumptions.",
    },
    anchors: {
      ko: ["적립식 투자 계산기", "DCA 계산기", "월 적립식 투자 시뮬레이터", "ETF 적립식 계산기"],
      en: ["DCA calculator", "dollar-cost averaging calculator", "monthly investment calculator"],
    },
    ctaDescription: {
      ko: "매월 투자했을 때의 세전·세후 자산 경로와 목표 달성 가능성을 확인합니다.",
      en: "Check pre-tax and after-tax paths for a monthly investing plan.",
    },
  },
  dsrLtv: {
    path: "/tools/dsr-ltv-calculator",
    name: {
      ko: "DSR/LTV 계산기",
      en: "DSR/LTV Calculator",
    },
    shareTitle: {
      ko: "FinMap DSR/LTV 계산기",
      en: "FinMap DSR/LTV Calculator",
    },
    shareDescription: {
      ko: "보유자산, 소득, 금리, DSR, LTV로 대출 가능액과 아파트 구매 가능 가격대를 추정합니다.",
      en: "Estimate loan capacity and apartment affordability from assets, income, rate, DSR, and LTV.",
    },
    anchors: {
      ko: ["DSR/LTV 계산기", "주택담보대출 가능액 계산기", "아파트 구매 가능 금액 계산기", "대출 한도 계산기"],
      en: ["DSR/LTV calculator", "mortgage affordability calculator", "home loan capacity calculator"],
    },
    ctaDescription: {
      ko: "소득·자산·금리 조건에서 감당 가능한 대출액과 주택 가격 범위를 점검합니다.",
      en: "Estimate a safer home price range from income, assets, rate, DSR, and LTV inputs.",
    },
  },
  goal: {
    path: "/tools/goal-simulator",
    name: {
      ko: "목표 자산 계산기",
      en: "Goal Amount Calculator",
    },
    shareTitle: {
      ko: "FinMap 목표 자산 계산기",
      en: "FinMap Goal Amount Calculator",
    },
    shareDescription: {
      ko: "목표 금액까지 필요한 월 투자금과 자산 성장 경로를 계산합니다.",
      en: "Estimate the monthly investment and growth path needed to reach a target amount.",
    },
    anchors: {
      ko: ["목표 자산 계산기", "월 투자금 계산기", "목표 자산 시뮬레이터"],
      en: ["goal amount calculator", "monthly investment calculator", "target portfolio calculator"],
    },
    ctaDescription: {
      ko: "목표 금액·기간·수익률을 기준으로 필요한 월 투자금을 역산합니다.",
      en: "Reverse-calculate the monthly investment needed for a target amount.",
    },
  },
  fire: {
    path: "/tools/fire-calculator",
    name: {
      ko: "은퇴자금 계산기",
      en: "FIRE Calculator",
    },
    shareTitle: {
      ko: "FinMap 은퇴자금 계산기",
      en: "FinMap FIRE Calculator",
    },
    shareDescription: {
      ko: "현재 자산, 저축액, 지출, 출금률로 은퇴 가능성과 자산 지속 기간을 점검합니다.",
      en: "Estimate retirement readiness and asset longevity from savings, spending, and withdrawal assumptions.",
    },
    anchors: {
      ko: ["은퇴자금 계산기", "FIRE 계산기", "조기은퇴 계산기"],
      en: ["FIRE calculator", "retirement fund calculator", "early retirement calculator"],
    },
    ctaDescription: {
      ko: "은퇴 생활비와 출금률 기준으로 필요한 자산과 지속 가능성을 확인합니다.",
      en: "Check required retirement assets and sustainability from spending and withdrawal assumptions.",
    },
  },
};

const TOOL_ALIASES = {
  comp: "compound",
  compound: "compound",
  "compound-interest": "compound",
  cagr: "cagr",
  dca: "dca",
  goal: "goal",
  "goal-simulator": "goal",
  fire: "fire",
  dsr: "dsrLtv",
  ltv: "dsrLtv",
  dsrLtv: "dsrLtv",
  "dsr-ltv": "dsrLtv",
  "dsr-ltv-calculator": "dsrLtv",
};

export function normalizeToolId(toolId) {
  const raw = String(toolId || "").trim();
  return TOOL_ALIASES[raw] || TOOL_ALIASES[raw.toLowerCase()] || raw;
}

export function getToolBacklinkConfig(toolId) {
  return TOOL_BACKLINK_CONFIG[normalizeToolId(toolId)] || TOOL_BACKLINK_CONFIG.compound;
}

function buildCanonicalUrl(path, locale) {
  const rawPath = String(path || "/");
  const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const prefix = locale === "en" ? "/en" : "";
  return `${SITE_URL}${prefix}${normalizedPath}`;
}

function getCurrentCanonicalUrl(path, locale) {
  if (typeof document !== "undefined") {
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    if (canonical) return canonical;
  }
  return buildCanonicalUrl(path, locale);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildCitationHtml({ url, anchorText }) {
  return `<a href="${url}">${escapeHtml(anchorText)}</a>`;
}

async function copyText(value, message) {
  if (typeof window === "undefined") return false;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      // TODO: Replace alert copy feedback with a toast when the app-wide toast pattern is ready.
      alert(message);
      return true;
    }
  } catch {
    // Use the textarea fallback below.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    // TODO: Replace alert copy feedback with a toast when the app-wide toast pattern is ready.
    alert(message);
    return true;
  } catch {
    return false;
  }
}

function trackToolAction(action, toolId, locale, location) {
  trackGaEvent("tool_backlink_action", {
    action,
    source_tool: normalizeToolId(toolId),
    locale,
    location,
  });
}

export function ToolSharePanel({ toolId, locale = "ko", location = "top_share" }) {
  const config = getToolBacklinkConfig(toolId);
  const isKo = locale === "ko";

  const handleShare = async () => {
    const url = getCurrentCanonicalUrl(config.path, locale);
    const title = isKo ? config.shareTitle.ko : config.shareTitle.en;
    const text = isKo ? config.shareDescription.ko : config.shareDescription.en;

    try {
      if (typeof navigator !== "undefined" && navigator?.share) {
        await navigator.share({ title, text, url });
        trackToolAction("share_canonical", toolId, locale, location);
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
      // Real share errors fall through to copy so the action still has a useful result.
    }

    const copied = await copyText(url, isKo ? "canonical URL이 복사되었습니다." : "Canonical URL copied.");
    if (copied) trackToolAction("copy_canonical_from_share", toolId, locale, location);
  };

  const handleCopyCanonical = async () => {
    const url = getCurrentCanonicalUrl(config.path, locale);
    const copied = await copyText(url, isKo ? "canonical URL이 복사되었습니다." : "Canonical URL copied.");
    if (copied) trackToolAction("copy_canonical", toolId, locale, location);
  };

  return (
    <section className="card border-blue-100 bg-blue-50">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="mb-1 break-words text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            {isKo ? "share & cite" : "share & cite"}
          </p>
          <h2 className="break-words text-lg font-semibold leading-snug text-slate-950">
            {isKo ? "이 계산기 공유하기" : "Share this calculator"}
          </h2>
          <p className="mt-1 break-words text-sm leading-relaxed text-slate-700">
            {isKo
              ? "외부 글이나 커뮤니티에는 쿼리 없는 canonical URL을 공유하면 중복 URL 없이 인용하기 좋습니다."
              : "Use the query-free canonical URL when citing this calculator from articles or communities."}
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-2 min-[390px]:grid-cols-2 sm:w-auto">
          <button
            type="button"
            className="btn-primary flex w-full items-center gap-2"
            onClick={handleShare}
          >
            <ShareIcon className="h-5 w-5" />
            {isKo ? "이 계산기 공유하기" : "Share calculator"}
          </button>
          <button
            type="button"
            className="btn-secondary flex w-full items-center gap-2"
            onClick={handleCopyCanonical}
          >
            <LinkIcon className="h-5 w-5" />
            {isKo ? "canonical URL 복사" : "Copy canonical URL"}
          </button>
        </div>
      </div>
    </section>
  );
}

export function ToolCitationBox({ toolId, locale = "ko", location = "citation_box" }) {
  const config = getToolBacklinkConfig(toolId);
  const isKo = locale === "ko";
  const url = buildCanonicalUrl(config.path, locale);
  const anchors = isKo ? config.anchors.ko : config.anchors.en;
  const primaryAnchor = anchors[0];
  const citationHtml = buildCitationHtml({ url, anchorText: primaryAnchor });

  const handleCopyHtml = async () => {
    const canonicalUrl = getCurrentCanonicalUrl(config.path, locale);
    const html = buildCitationHtml({ url: canonicalUrl, anchorText: primaryAnchor });
    const copied = await copyText(html, isKo ? "인용 HTML이 복사되었습니다." : "Citation HTML copied.");
    if (copied) trackToolAction("copy_citation_html", toolId, locale, location);
  };

  return (
    <section className="card border-slate-200 bg-white">
      <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="mb-1 break-words text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {isKo ? "citation" : "citation"}
          </p>
          <h2 className="break-words text-lg font-semibold leading-snug text-slate-950">
            {isKo ? "이 계산기를 인용하려면" : "How to cite this calculator"}
          </h2>
          <p className="mt-1 break-words text-sm leading-relaxed text-slate-600">
            {isKo
              ? "글에서 계산 방법이나 결과 예시를 설명할 때 아래 HTML처럼 출처 링크를 남기면 됩니다."
              : "When referencing the method or examples, cite the canonical page with a simple HTML link."}
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary flex w-full items-center gap-2 sm:w-auto"
          onClick={handleCopyHtml}
        >
          <ClipboardDocumentIcon className="h-5 w-5" />
          {isKo ? "HTML 복사" : "Copy HTML"}
        </button>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-950 p-4 text-slate-100">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            <CodeBracketIcon className="h-4 w-4" />
            HTML
          </div>
          <code className="block min-w-0 whitespace-pre-wrap break-words text-sm leading-relaxed">
            {citationHtml}
          </code>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="break-words text-sm font-semibold text-slate-900">
            {isKo ? "추천 앵커 텍스트" : "Recommended anchor text"}
          </h3>
          <ul className="mt-3 flex min-w-0 flex-wrap gap-2">
            {anchors.map((anchor) => (
              <li
                key={anchor}
                className="max-w-full break-words rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
              >
                {anchor}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function uniqueToolIds(ids) {
  const seen = new Set();
  const out = [];
  ids.forEach((id) => {
    const normalized = normalizeToolId(id);
    if (!TOOL_BACKLINK_CONFIG[normalized] || seen.has(normalized)) return;
    seen.add(normalized);
    out.push(normalized);
  });
  return out;
}

function getPostSearchText(post) {
  return [
    post?.slug,
    post?.title,
    post?.sourceTitle,
    post?.description,
    post?.sourceDescription,
    post?.category,
    ...(Array.isArray(post?.tags) ? post.tags : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function inferPostToolIds(post) {
  const text = getPostSearchText(post);
  const matches = [];

  if (/\bdsr\b|\bltv\b|주택대출|주택담보|대출|아파트|내\s*집|내집|mortgage|home[-\s]?buy|apartment|loan/.test(text)) {
    matches.push("dsrLtv");
  }
  if (/\bdca\b|적립식|월\s*투자|월\s*납입|일시투자|dollar[-\s]?cost|monthly contribution|lump sum/.test(text)) {
    matches.push("dca");
  }
  if (/\bcagr\b|연평균|연복리|수익률|growth rate|annualized|return/.test(text)) {
    matches.push("cagr");
  }
  if (/복리|월복리|compound|future value/.test(text)) {
    matches.push("compound");
  }
  if (/\bfire\b|은퇴|조기은퇴|retirement|withdrawal/.test(text)) {
    matches.push("fire");
  }
  if (/목표|target|goal|월\s*투자금|필요\s*월|how much|monthly investment/.test(text)) {
    matches.push("goal");
  }

  return uniqueToolIds(matches);
}

function fallbackToolsForPost(post) {
  const category = String(post?.category || "").toLowerCase();
  if (category.includes("투자") || category.includes("investing")) return ["cagr", "dca"];
  if (category.includes("경제") || category.includes("economic")) return ["cagr"];
  return ["compound", "goal"];
}

export function getPostRelatedToolIds(post, explicitTools = [], limit = 3) {
  const normalizedExplicit = uniqueToolIds(explicitTools);
  const inferred = inferPostToolIds(post);
  const priority = inferred.includes("dsrLtv") ? ["dsrLtv"] : [];

  return uniqueToolIds([
    ...priority,
    ...normalizedExplicit,
    ...inferred,
    ...fallbackToolsForPost(post),
  ]).slice(0, limit);
}

export function RelatedCalculatorCtaGrid({
  toolIds,
  locale = "ko",
  title,
  description,
  source = "blog_detail",
  sourcePost,
  location = "post_bottom",
}) {
  const ids = uniqueToolIds(toolIds || []);
  const isKo = locale === "ko";
  if (!ids.length) return null;

  return (
    <section className="not-prose mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
      <div className="mb-4 min-w-0">
        <h2 className="break-words text-base font-semibold leading-snug text-slate-950 md:text-lg">
          {title || (isKo ? "관련 계산기로 숫자 확인하기" : "Check the numbers with related calculators")}
        </h2>
        <p className="mt-1 break-words text-sm leading-relaxed text-slate-700">
          {description ||
            (isKo
              ? "글의 기준을 내 금액·기간·수익률로 바꿔보면 판단이 더 쉬워집니다."
              : "Turn the article's assumptions into your own numbers, time horizon, and return inputs.")}
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ids.map((id) => {
          const config = TOOL_BACKLINK_CONFIG[id];
          return (
            <Link
              key={id}
              href={config.path}
              locale={locale}
              prefetch={false}
              onClick={() =>
                trackGaEvent("related_calculator_click", {
                  action: "click_related_calculator",
                  source,
                  target_tool: id,
                  ...(sourcePost ? { source_post: sourcePost } : {}),
                  locale,
                  location,
                })
              }
              className="block min-w-0 rounded-xl border border-blue-100 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
            >
              <div className="mb-1 break-words text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                FinMap tool
              </div>
              <h3 className="break-words text-sm font-semibold leading-snug text-slate-950">
                {isKo ? config.name.ko : config.name.en}
              </h3>
              <p className="mt-2 break-words text-xs leading-relaxed text-slate-600">
                {isKo ? config.ctaDescription.ko : config.ctaDescription.en}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
