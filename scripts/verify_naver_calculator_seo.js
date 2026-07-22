const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://www.finmaphub.com";
const BASE_URL = process.env.NAVER_CALCULATOR_SEO_BASE_URL || "";

const TARGETS = [
  {
    path: "/tools/dsr-ltv-calculator",
    file: ".next/server/pages/ko/tools/dsr-ltv-calculator.html",
    titleKeywords: ["DSR 계산기", "주택담보대출", "LTV"],
    descKeywords: ["연소득", "기존대출 월상환액", "주택담보대출 금리", "DSR", "대출 가능액"],
    anchorKeywords: ["DSR 계산기", "주택담보대출 계산기", "주택담보대출 가능액 계산기"],
    bodyKeywords: ["DSR 계산기", "주택담보대출 계산기", "대출 가능액 계산기", "LTV 계산기"],
    maxKeywordCount: 28,
  },
  {
    path: "/tools/compound-interest",
    file: ".next/server/pages/ko/tools/compound-interest.html",
    titleKeywords: ["복리 계산기", "월복리", "적립식 투자"],
    descKeywords: ["원금", "월 적립금", "연 수익률", "세금", "수수료", "물가상승률"],
    descKeywordGroups: [
      { label: "복리 의미", any: ["복리 계산기", "복리", "월복리"] },
      { label: "계산 목적", any: ["계산", "미래가치"] },
    ],
    anchorKeywords: ["복리 계산기", "월복리", "적립식"],
    bodyKeywords: ["복리 계산기", "월복리 계산기", "적립식 복리 계산기"],
    maxKeywordCount: 32,
  },
  {
    path: "/tools/fire-calculator",
    file: ".next/server/pages/ko/tools/fire-calculator.html",
    titleKeywords: ["은퇴자금 계산기", "노후자금 계산기", "FIRE 계산기"],
    descKeywords: ["은퇴자금 계산기", "노후자금 계산기", "은퇴 생활비", "FIRE"],
    anchorKeywords: ["은퇴자금 계산기", "노후자금 계산기", "FIRE 계산기"],
    bodyKeywords: ["은퇴자금 계산기", "노후자금 계산기", "FIRE 계산기"],
    maxKeywordCount: 30,
  },
];

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function includesAll(text, keywords) {
  const haystack = normalizeText(text);
  return keywords.map((keyword) => ({
    keyword,
    found: haystack.includes(keyword),
  }));
}

function includesKeywordGroups(text, groups = []) {
  const haystack = normalizeText(text);
  return groups.map((group) => {
    const any = Array.isArray(group.any) ? group.any : [];
    const all = Array.isArray(group.all) ? group.all : [];
    const anyFound = any.length === 0 || any.some((keyword) => haystack.includes(keyword));
    const allFound = all.every((keyword) => haystack.includes(keyword));

    return {
      label: group.label || [...all, ...any].join(" / "),
      found: anyFound && allFound,
      matched: any.filter((keyword) => haystack.includes(keyword)),
      required: all.filter((keyword) => haystack.includes(keyword)),
    };
  });
}

function countOccurrences(text, keyword) {
  if (!keyword) return 0;
  return (normalizeText(text).match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
}

function parseJsonLdBlocks($) {
  const blocks = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else blocks.push(parsed);
    } catch {
      blocks.push({ parseError: true, raw: raw.slice(0, 120) });
    }
  });
  return blocks;
}

function findFaqPages(blocks) {
  const found = [];
  for (const block of blocks) {
    if (block?.["@type"] === "FAQPage") found.push(block);
    if (Array.isArray(block?.["@graph"])) {
      found.push(...block["@graph"].filter((item) => item?.["@type"] === "FAQPage"));
    }
  }
  return found;
}

function resolveBuiltHtmlFile(target) {
  const candidates = [
    target.file,
    `.next/server/pages/ko${target.path}.html`,
    `.next/server/pages${target.path}.html`,
    `.next/server/app/ko${target.path}.html`,
    `.next/server/app${target.path}.html`,
  ];
  return candidates
    .map((candidate) => ({ candidate, abs: path.join(ROOT, candidate) }))
    .find((item) => fs.existsSync(item.abs));
}

async function loadTarget(target) {
  if (BASE_URL) {
    const url = `${BASE_URL.replace(/\/+$/, "")}${target.path}`;
    const response = await fetch(url, { redirect: "manual" });
    return {
      mode: "http",
      status: response.status,
      finalUrl: response.url || url,
      xRobotsTag: response.headers.get("x-robots-tag") || "",
      html: await response.text(),
    };
  }

  const resolved = resolveBuiltHtmlFile(target);
  if (!resolved) {
    return {
      mode: "built-html",
      status: 0,
      finalUrl: target.file,
      xRobotsTag: "",
      html: "",
      missingFile: path.join(ROOT, target.file),
    };
  }

  return {
    mode: "built-html",
    status: 200,
    finalUrl: resolved.candidate,
    xRobotsTag: "",
    html: fs.readFileSync(resolved.abs, "utf8"),
  };
}

function checkTarget(target, loaded) {
  const $ = cheerio.load(loaded.html || "");
  const title = normalizeText($("title").first().text());
  const description = normalizeText($('meta[name="description"]').attr("content"));
  const canonical = normalizeText($('link[rel="canonical"]').attr("href"));
  const metaRobots = normalizeText($('meta[name="robots"]').attr("content"));
  const h1Texts = $("h1")
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter(Boolean);
  const bodyText = normalizeText($("body").text());
  const anchorTexts = $("a")
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter(Boolean);

  const jsonLdBlocks = parseJsonLdBlocks($);
  const faqPages = findFaqPages(jsonLdBlocks);
  const faqQuestions = faqPages.flatMap((page) =>
    (page.mainEntity || []).map((item) => normalizeText(item.name))
  );
  const visibleFaqQuestions = $("details summary")
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter(Boolean);

  const titleResults = includesAll(title, target.titleKeywords);
  const descResults = includesAll(description, target.descKeywords);
  const descGroupResults = includesKeywordGroups(description, target.descKeywordGroups);
  const anchorResults = target.anchorKeywords.map((keyword) => ({
    keyword,
    found: anchorTexts.some((text) => text.includes(keyword)),
  }));
  const faqSync = faqQuestions.length > 0 && faqQuestions.every((q) => visibleFaqQuestions.includes(q));
  const keywordCounts = target.bodyKeywords.map((keyword) => ({
    keyword,
    count: countOccurrences(bodyText, keyword),
  }));
  const keywordOveruse = keywordCounts.filter((item) => item.count > target.maxKeywordCount);

  const checks = [
    ["HTTP 200", loaded.status === 200],
    ["self canonical", canonical === `${SITE}${target.path}`],
    ["meta robots noindex 없음", !/noindex/i.test(metaRobots)],
    ["X-Robots-Tag noindex 없음", !/noindex/i.test(loaded.xRobotsTag)],
    ["title 목표 키워드", titleResults.every((item) => item.found)],
    [
      "description 목표 키워드",
      descResults.every((item) => item.found) && descGroupResults.every((item) => item.found),
    ],
    ["H1 1개", h1Texts.length === 1],
    ["FAQPage JSON-LD", faqPages.length > 0],
    ["FAQ visible 문구 정합", faqSync],
    ["목표 키워드 과도 반복 없음", keywordOveruse.length === 0],
    ["내부링크 앵커 목표 키워드", anchorResults.some((item) => item.found)],
  ];

  return {
    target,
    loaded,
    title,
    description,
    canonical,
    metaRobots,
    xRobotsTag: loaded.xRobotsTag,
    h1Texts,
    faqQuestions,
    visibleFaqQuestions,
    titleResults,
    descResults,
    descGroupResults,
    anchorResults,
    keywordCounts,
    keywordOveruse,
    checks,
    pass: checks.every(([, ok]) => ok),
  };
}

(async () => {
  const results = [];
  for (const target of TARGETS) {
    const loaded = await loadTarget(target);
    results.push(checkTarget(target, loaded));
  }

  for (const result of results) {
    console.log(`\n[naver-calculator-seo] ${result.target.path} (${result.loaded.mode})`);
    console.log(`status=${result.loaded.status} canonical=${result.canonical || "-"}`);
    console.log(`title=${result.title}`);
    console.log(`description=${result.description}`);
    console.log(`h1=${result.h1Texts.length} faqJsonLd=${result.faqQuestions.length} visibleFaq=${result.visibleFaqQuestions.length}`);
    for (const [label, ok] of result.checks) {
      console.log(`${ok ? "PASS" : "FAIL"}\t${label}`);
    }
    console.log(
      `anchors=${result.anchorResults
        .filter((item) => item.found)
        .map((item) => item.keyword)
        .join(", ") || "-"}`
    );
    console.log(
      `keywordCounts=${result.keywordCounts.map((item) => `${item.keyword}:${item.count}`).join(", ")}`
    );
  }

  if (results.some((result) => !result.pass)) {
    process.exitCode = 1;
  }
})();
