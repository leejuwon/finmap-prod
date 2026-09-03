const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = process.cwd();
const SITE_URL = "https://www.finmaphub.com";
const COMPOUND_TOOL_SOURCE = path.join(ROOT, "pages", "tools", "compound-interest.js");
const SITEMAP_KO_PATH = path.join(ROOT, "public", "sitemap-ko.xml");

const CLUSTER_PATHS = [
  "/posts/personalFinance/simple-vs-compound",
  "/posts/personalFinance/annual-vs-monthly-compound",
  "/posts/personalFinance/monthly-dca-10-year-result",
  "/posts/personalFinance/how-much-per-month-for-100m",
  "/posts/personalFinance/goal-amount-fast-strategy",
];

const TARGETS = [
  {
    file: "content/posts/personalFinance/ko/compound-calculator-guide.md",
    path: "/posts/personalFinance/compound-calculator-guide",
    title: "복리 계산기 사용법: 월복리·연복리·적립식 결과 보는 법",
    datePublished: "2026-07-08",
    dateModified: "2026-07-08",
    intents: ["복리 계산기 사용법", "복리 계산 방법", "복리 계산 순서", "복리 계산기 결과 보는 법"],
    maxCompoundToolLinks: 2,
  },
  {
    file: "content/posts/personalFinance/ko/simple-vs-compound.md",
    path: "/posts/personalFinance/simple-vs-compound",
    title: "단리 vs 복리: 월 30만원 예시로 보는 장기 자산 차이",
    datePublished: "2025-11-15",
    dateModified: "2026-07-08",
    intents: ["단리 vs 복리", "단리 복리 차이", "단리와 복리"],
    maxCompoundToolLinks: 2,
  },
  {
    file: "content/posts/personalFinance/ko/annual-vs-monthly-compound.md",
    path: "/posts/personalFinance/annual-vs-monthly-compound",
    title: "연복리 vs 월복리: 목표 도달 기간은 얼마나 달라질까?",
    datePublished: "2025-11-23",
    dateModified: "2026-07-08",
    intents: ["연복리 월복리", "월복리 연복리 차이", "연복리와 월복리"],
    maxCompoundToolLinks: 2,
  },
  {
    file: "content/posts/personalFinance/ko/monthly-dca-10-year-result.md",
    path: "/posts/personalFinance/monthly-dca-10-year-result",
    title: "월 50만원 적립식 투자, 10년 후 얼마가 될까?",
    datePublished: "2026-05-21",
    dateModified: "2026-07-08",
    intents: ["적립식 복리 계산", "월 50만원 적립식 투자", "월 적립식 투자 10년"],
    maxCompoundToolLinks: 2,
  },
  {
    file: "content/posts/personalFinance/ko/how-much-per-month-for-100m.md",
    path: "/posts/personalFinance/how-much-per-month-for-100m",
    title: "1억 모으려면 월 얼마? 5년·10년·15년 필요 투자금",
    datePublished: "2025-11-20",
    dateModified: "2026-07-08",
    intents: ["1억 모으기 월 납입", "1억 만들기 복리", "목표금액 복리 계산"],
    maxCompoundToolLinks: 2,
  },
  {
    file: "content/posts/personalFinance/ko/goal-amount-fast-strategy.md",
    path: "/posts/personalFinance/goal-amount-fast-strategy",
    title: "목표 금액을 빠르게 모으는 법: 원금·수익률·기간의 균형",
    datePublished: "2025-11-19",
    dateModified: "2026-07-08",
    intents: ["목표금액 모으는 법", "복리로 목표금액", "목표금액 복리 계산"],
    maxCompoundToolLinks: 1,
  },
  {
    file: "content/posts/personalFinance/ko/what-is-cagr.md",
    path: "/posts/personalFinance/what-is-cagr",
    title: "CAGR이란 무엇인가? 단순 수익률과의 차이 이해하기",
    datePublished: "2025-11-26",
    dateModified: "2026-07-22",
    intents: ["CAGR 계산법", "CAGR 계산식", "연평균 수익률 계산"],
    maxCompoundToolLinks: 1,
  },
];

function readFile(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkDir(full));
    else files.push(full);
  }
  return files;
}

function normalizeText(value) {
  return String(value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function mdEscape(value) {
  return normalizeText(value).replace(/\|/g, "\\|");
}

function stripText(markdown) {
  return normalizeText(
    String(markdown || "")
      .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, " $1 ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, " $1 ")
      .replace(/<[^>]+>/g, " ")
      .replace(/[>#*_`~|:-]+/g, " ")
  );
}

function normalizeHref(href) {
  const raw = String(href || "").trim();
  if (!raw) return "";
  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      if (url.hostname === "finmaphub.com" || url.hostname.endsWith(".finmaphub.com")) {
        return url.pathname.replace(/\/+$/, "") || "/";
      }
      return raw;
    }
  } catch {
    return raw;
  }
  return raw.split("#")[0].split("?")[0].replace(/\/+$/, "") || "/";
}

function extractLinks(markdown) {
  const links = [];
  let match;
  const mdPattern = /(!?)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  while ((match = mdPattern.exec(markdown))) {
    if (match[1] === "!") continue;
    links.push({ anchor: stripText(match[2]), href: match[3], path: normalizeHref(match[3]), index: match.index });
  }
  const htmlPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  while ((match = htmlPattern.exec(markdown))) {
    links.push({ anchor: stripText(match[2]), href: match[1], path: normalizeHref(match[1]), index: match.index });
  }
  return links;
}

function typeList(node) {
  const type = node && node["@type"];
  if (Array.isArray(type)) return type.map(String);
  return type ? [String(type)] : [];
}

function flattenJsonLd(node) {
  if (!node) return [];
  if (Array.isArray(node)) return node.flatMap(flattenJsonLd);
  if (node["@graph"]) return [node, ...flattenJsonLd(node["@graph"])];
  return [node];
}

function extractJsonLd(content) {
  const scripts = [];
  const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(content))) {
    try {
      scripts.push(...flattenJsonLd(JSON.parse(match[1].trim())));
    } catch (error) {
      scripts.push({ parseError: error.message });
    }
  }
  return scripts;
}

function hasNoindex(data) {
  return data.draft === true || data.noindex === true || /\bnoindex\b/i.test(String(data.robots || ""));
}

function normalizeDate(value, fallback) {
  const parsed = value ? new Date(value) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return fallback || new Date(0).toISOString();
}

function rssCandidatePaths(limit = 50) {
  const postsRoot = path.join(ROOT, "content", "posts");
  return walkDir(postsRoot)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const rel = path.relative(postsRoot, file).replace(/\\/g, "/");
      const parts = rel.split("/");
      if (parts.length < 3 || parts[1] !== "ko") return null;
      const parsed = matter(readFile(file));
      if (hasNoindex(parsed.data || {})) return null;
      const fallback = fs.statSync(file).mtime.toISOString();
      return {
        path: `/posts/${parts[0]}/${path.basename(file, ".md")}`,
        sortDate: normalizeDate(parsed.data.dateModified || parsed.data.datePublished || parsed.data.date, fallback),
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
    .slice(0, limit)
    .map((item) => item.path);
}

function sitemapKoSet() {
  const xml = readFile(SITEMAP_KO_PATH);
  return new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
}

function h2Text(content) {
  return [...String(content || "").matchAll(/^##+\s+(.+)$/gm)].map((match) => stripText(match[1])).join(" ");
}

function intentHit(target, content) {
  const top500 = stripText(content).slice(0, 500);
  const headings = h2Text(content);
  const haystack = `${top500} ${headings}`;
  return target.intents.some((intent) => haystack.includes(intent));
}

function genericAnchors(links) {
  return links.filter((link) => /^(여기|보기|자세히|바로가기|확인|읽기|글 보기|더 보기)$/i.test(normalizeText(link.anchor)));
}

function auditPost(target, context) {
  const fullPath = path.join(ROOT, target.file);
  const raw = readFile(fullPath);
  const row = {
    path: target.path,
    result: "PASS",
    problems: [],
    clusterLinks: 0,
    compoundToolLinks: 0,
    brandCount: 0,
    intent: false,
    sitemap: false,
    rss: false,
    manualArticle: 0,
    faqPage: 0,
  };

  if (!raw) {
    row.problems.push("file missing");
    row.result = "FAIL";
    return row;
  }

  const parsed = matter(raw);
  const data = parsed.data || {};
  const content = parsed.content || "";
  const jsonLd = extractJsonLd(content);
  const links = extractLinks(content);
  const fullUrl = `${SITE_URL}${target.path}`;
  const articleNodes = jsonLd.filter((node) => {
    const types = typeList(node);
    return types.includes("Article") || types.includes("BlogPosting");
  });

  row.clusterLinks = links.filter((link) => CLUSTER_PATHS.includes(link.path) && link.path !== target.path).length;
  row.compoundToolLinks = links.filter((link) => link.path === "/tools/compound-interest").length;
  row.brandCount = (content.match(/FinMap/g) || []).length;
  row.intent = intentHit(target, content);
  row.sitemap = context.sitemapKo.has(fullUrl);
  row.rss = context.rssPaths.has(target.path);
  row.manualArticle = articleNodes.length;
  row.faqPage = jsonLd.filter((node) => typeList(node).includes("FAQPage")).length;

  if (data.title !== target.title) row.problems.push("frontmatter title changed");
  if (!data.description && !data.seoDescription) row.problems.push("frontmatter description missing");
  if (data.datePublished !== target.datePublished) row.problems.push("frontmatter datePublished changed");
  if (data.dateModified !== target.dateModified) row.problems.push("frontmatter dateModified changed");
  if (hasNoindex(data)) row.problems.push("draft/noindex found");
  if (articleNodes.length) row.problems.push("manual Article/BlogPosting found");
  if (!row.intent) row.problems.push("target intent missing in top500/H2");
  if (row.brandCount < 1 || row.brandCount > 3) row.problems.push(`FinMap brand count out of range: ${row.brandCount}`);
  if (!row.sitemap) row.problems.push("sitemap-ko missing");
  if (!row.rss) row.problems.push("RSS latest 50 missing");
  if (row.compoundToolLinks > target.maxCompoundToolLinks) row.problems.push(`compound tool links too many: ${row.compoundToolLinks}`);
  if (genericAnchors(links).length) row.problems.push("generic anchor found");
  if (target.path === "/posts/personalFinance/compound-calculator-guide" && row.clusterLinks < 3) {
    row.problems.push(`hub cluster links fewer than 3: ${row.clusterLinks}`);
  }

  row.result = row.problems.length ? "FAIL" : "PASS";
  return row;
}

function auditCalculator() {
  const source = readFile(COMPOUND_TOOL_SOURCE);
  const hrefMatches = source.match(/href=["']\/posts\/personalFinance\/compound-calculator-guide["']/g) || [];
  const forbiddenMarkers = [
    "복리 계산기 |",
    "복리 계산기 FAQ",
  ];
  return {
    hubLinkCount: hrefMatches.length,
    result: hrefMatches.length === 1 ? "PASS" : "FAIL",
    notes: hrefMatches.length === 1
      ? "KO 하단 관련 글 직접 링크 1개 확인"
      : `허브 링크 개수 확인 필요: ${hrefMatches.length}`,
    sourceMarkersPresent: forbiddenMarkers.every((marker) => source.includes(marker)),
  };
}

function renderRows(rows) {
  return rows
    .map((row) => (
      `| ${row.path} | ${row.intent ? "PASS" : "FAIL"} | ${row.brandCount} | ${row.clusterLinks} | ${row.compoundToolLinks} | ${row.manualArticle} | ${row.faqPage} | ${row.sitemap ? "PASS" : "FAIL"} | ${row.rss ? "PASS" : "FAIL"} | ${row.result} | ${mdEscape(row.problems.join("; ") || "OK")} |`
    ))
    .join("\n");
}

function run() {
  const context = {
    sitemapKo: sitemapKoSet(),
    rssPaths: new Set(rssCandidatePaths()),
  };
  const rows = TARGETS.map((target) => auditPost(target, context));
  const calculator = auditCalculator();
  const failures = rows.filter((row) => row.result !== "PASS");
  if (calculator.result !== "PASS") failures.push({ path: "/tools/compound-interest", problems: [calculator.notes] });

  console.log("# Compound Posts Independent Visibility Minimal Fix Verification");
  console.log("");
  console.log(`Calculator -> hub link: ${calculator.result} (${calculator.notes})`);
  console.log("");
  console.log("| Post | Intent top500/H2 | FinMap count | Cluster links | /tools/compound-interest links | Manual Article/BlogPosting | FAQPage | Sitemap | RSS | Result | Problems |");
  console.log("| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- |");
  console.log(renderRows(rows));
  console.log("");
  console.log(`Final: ${failures.length ? "FAIL" : "PASS"} (${failures.length} failing items)`);

  if (failures.length) process.exitCode = 1;
}

run();
