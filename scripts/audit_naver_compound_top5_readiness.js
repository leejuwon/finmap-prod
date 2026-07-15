const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const SITE_URL = "https://www.finmaphub.com";
const REPORT_PATH = path.join(
  process.cwd(),
  "reports",
  "naver-compound-calculator-top5-readiness.md"
);

const TOOL_PATH = "/tools/compound-interest";
const TOOL_URL = `${SITE_URL}${TOOL_PATH}`;

const TARGETS = [
  { type: "tool", path: TOOL_PATH, label: "복리 계산기" },
  { type: "post", path: "/posts/personalFinance/compound-calculator-guide", label: "브릿지 가이드" },
  { type: "post", path: "/posts/personalFinance/simple-vs-compound", label: "단리 vs 복리" },
  { type: "post", path: "/posts/personalFinance/annual-vs-monthly-compound", label: "연복리 vs 월복리" },
  { type: "post", path: "/posts/personalFinance/monthly-dca-10-year-result", label: "월 50만원 적립식" },
  { type: "post", path: "/posts/personalFinance/how-much-per-month-for-100m", label: "1억 월 납입" },
  { type: "post", path: "/posts/personalFinance/goal-amount-fast-strategy", label: "목표금액 빠르게" },
  { type: "post", path: "/posts/personalFinance/what-is-cagr", label: "CAGR 개념" },
];

const FAQ_INTENTS = [
  "복리 계산기",
  "월복리",
  "적립식",
  "세금",
  "수수료",
  "복리 계산 공식",
  "복리 이자 계산기",
];

const DESCRIPTION_TERMS = ["월복리", "적립식", "미래가치", "세금", "수수료"];
const ANCHOR_VARIANTS = [
  "복리 계산기",
  "월복리 계산기",
  "적립식 복리 계산기",
  "복리 계산 공식",
  "투자 복리 계산기",
];

const CLUSTER_POST_PATHS = TARGETS.filter((target) => target.type === "post").map((target) => target.path);
const RSS_CORE_PATHS = [
  "/posts/personalFinance/compound-calculator-guide",
  "/posts/personalFinance/simple-vs-compound",
  "/posts/personalFinance/annual-vs-monthly-compound",
  "/posts/personalFinance/monthly-dca-10-year-result",
];

function readFile(relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
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
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripTags(value) {
  return normalizeText(String(value || "").replace(/<[^>]+>/g, " "));
}

function postFileFromPath(sitePath) {
  const parts = sitePath.split("/").filter(Boolean);
  if (parts.length !== 3 || parts[0] !== "posts") return "";
  const [, category, slug] = parts;
  return path.join(process.cwd(), "content", "posts", category, "ko", `${slug}.md`);
}

function parsePost(sitePath) {
  const filePath = postFileFromPath(sitePath);
  if (!filePath || !fs.existsSync(filePath)) {
    return { exists: false, data: {}, content: "", filePath };
  }
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  return {
    exists: true,
    data: parsed.data || {},
    content: parsed.content || "",
    raw,
    filePath,
  };
}

function readSitemapLocs(relativePath) {
  const xml = readFile(relativePath);
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

function parseRobots() {
  const robots = readFile("public/robots.txt");
  const disallows = [];
  const sitemaps = [];
  for (const line of robots.split(/\r?\n/)) {
    const trimmed = line.trim();
    const disallow = trimmed.match(/^Disallow:\s*(\S+)/i);
    const sitemap = trimmed.match(/^Sitemap:\s*(\S+)/i);
    if (disallow) disallows.push(disallow[1]);
    if (sitemap) sitemaps.push(sitemap[1]);
  }
  return { robots, disallows, sitemaps };
}

function isBlockedByRobots(sitePath, disallows) {
  return disallows.some((rule) => {
    if (!rule || rule === "/") return rule === "/";
    return sitePath === rule || sitePath.startsWith(rule.endsWith("/") ? rule : `${rule}/`);
  });
}

function extractLinks(markdown) {
  const links = [];
  const mdLinkPattern = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match;
  while ((match = mdLinkPattern.exec(markdown))) {
    links.push({
      anchor: stripTags(match[1]),
      href: match[2],
      source: "markdown",
    });
  }

  const htmlLinkPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  while ((match = htmlLinkPattern.exec(markdown))) {
    links.push({
      anchor: stripTags(match[2]),
      href: match[1],
      source: "html",
    });
  }

  return links;
}

function isCompoundHref(href) {
  return String(href || "").includes("/tools/compound-interest");
}

function classifyAnchor(anchor) {
  const text = normalizeText(anchor);
  if (text === "복리 계산기") return "exact";
  if (ANCHOR_VARIANTS.some((variant) => text.includes(variant))) return "variant";
  if (/열기|바로|확인|보기|계산기로|도구|여기|자세히/.test(text)) return "generic";
  return "other";
}

function scanInternalLinks() {
  const roots = [
    path.join(process.cwd(), "content", "posts", "personalFinance", "ko"),
    path.join(process.cwd(), "content", "posts", "investingInfo", "ko"),
    path.join(process.cwd(), "content", "posts", "economicInfo", "ko"),
  ];

  const files = roots.flatMap((root) => walkDir(root)).filter((file) => file.endsWith(".md"));
  const allAnchors = [];
  const clusterRows = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = matter(raw);
    const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
    const parts = rel.split("/");
    const category = parts[2];
    const slug = path.basename(file, ".md");
    const sitePath = `/posts/${category}/${slug}`;
    const compoundLinks = extractLinks(parsed.content || raw).filter((link) => isCompoundHref(link.href));

    for (const link of compoundLinks) {
      allAnchors.push({
        file: rel,
        sitePath,
        anchor: link.anchor,
        href: link.href,
        className: classifyAnchor(link.anchor),
      });
    }

    if (CLUSTER_POST_PATHS.includes(sitePath)) {
      clusterRows.push({
        sitePath,
        file: rel,
        linkCount: compoundLinks.length,
        anchors: compoundLinks.map((link) => link.anchor),
      });
    }
  }

  const counts = allAnchors.reduce(
    (acc, item) => {
      acc[item.className] = (acc[item.className] || 0) + 1;
      return acc;
    },
    { exact: 0, variant: 0, generic: 0, other: 0 }
  );

  const variantCounts = ANCHOR_VARIANTS.map((variant) => ({
    variant,
    count: allAnchors.filter((item) => item.anchor.includes(variant)).length,
  }));

  return { allAnchors, counts, variantCounts, clusterRows };
}

function normalizeDate(value, fallback) {
  const parsed = value ? new Date(value) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return fallback || new Date(0).toISOString();
}

function getRssCandidateItems() {
  const root = path.join(process.cwd(), "content", "posts");
  return walkDir(root)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const rel = path.relative(root, file).replace(/\\/g, "/");
      const parts = rel.split("/");
      if (parts.length < 3 || parts[1] !== "ko") return null;
      const category = parts[0];
      const slug = path.basename(file, ".md");
      const raw = fs.readFileSync(file, "utf8");
      const parsed = matter(raw);
      const data = parsed.data || {};
      if (data.draft === true || data.noindex === true || String(data.robots || "").includes("noindex")) return null;
      const fallback = fs.statSync(file).mtime.toISOString();
      const modified = normalizeDate(data.dateModified || data.datePublished || data.date, fallback);
      return {
        path: `/posts/${category}/${slug}`,
        loc: `${SITE_URL}/posts/${category}/${slug}`,
        sortDate: modified,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
    .slice(0, 50);
}

function check(status, details) {
  return { status, details };
}

function statusIcon(status) {
  if (status === "PASS") return "PASS";
  if (status === "WARN") return "WARN";
  return "FAIL";
}

function table(rows) {
  return rows.join("\n");
}

function runAudit() {
  const pageSource = readFile("pages/tools/compound-interest.js");
  const formSource = readFile("_components/CompoundForm.js");
  const quickSource = readFile("_components/CompoundQuickComparePanel.js");
  const frequencySource = readFile("_components/CompoundFrequencyComparePanel.js");
  const contributionSource = readFile("_components/CompoundContributionScenarioPanel.js");
  const ctaSource = readFile("_components/ToolResultCta.js");
  const sitemapKoLocs = readSitemapLocs("public/sitemap-ko.xml");
  const sitemapMainLocs = readSitemapLocs("public/sitemap.xml");
  const sitemapZeroLocs = readSitemapLocs("public/sitemap-0.xml");
  const { disallows, sitemaps } = parseRobots();
  const linkScan = scanInternalLinks();
  const rssItems = getRssCandidateItems();
  const rssPaths = rssItems.map((item) => item.path);

  const titlePass = pageSource.includes("복리 계산기 |") && pageSource.includes("월복리·적립식");
  const descHits = DESCRIPTION_TERMS.filter((term) => pageSource.includes(term));
  const h1Pass = pageSource.includes('{locale === "ko" ? "복리 계산기"');
  const purposeIndex = pageSource.indexOf("월복리 기준 미래가치");
  const formIndex = pageSource.indexOf("<CompoundForm");
  const resultIndex = pageSource.indexOf("{hasResult &&");
  const faqHits = FAQ_INTENTS.filter((term) => pageSource.includes(term));

  const calculatorRows = [
    ["tool in sitemap-ko.xml", sitemapKoLocs.includes(TOOL_URL) ? check("PASS", TOOL_URL) : check("FAIL", "missing")],
    ["tool in main sitemap", sitemapMainLocs.includes(TOOL_URL) || sitemapZeroLocs.includes(TOOL_URL) ? check("PASS", "main sitemap source includes tool") : check("FAIL", "missing")],
    ["robots not blocking tool", !isBlockedByRobots(TOOL_PATH, disallows) ? check("PASS", "not blocked") : check("FAIL", "blocked")],
    ["canonical self source", pageSource.includes('url="/tools/compound-interest"') ? check("PASS", 'SeoHead url="/tools/compound-interest"') : check("FAIL", "SeoHead self URL not found")],
    ["noindex absent", !/noindex/i.test(pageSource) ? check("PASS", "no noindex marker in page source") : check("FAIL", "noindex marker found")],
    ["title includes 복리 계산기", titlePass ? check("PASS", "복리 계산기 | 월복리·적립식...") : check("WARN", "title phrase not found by source scan")],
    ["description intent terms", descHits.length >= 4 ? check("PASS", descHits.join(", ")) : check("WARN", `matched: ${descHits.join(", ") || "-"}`)],
    ["H1 includes 복리 계산기", h1Pass ? check("PASS", "H1 source contains 복리 계산기") : check("WARN", "H1 source marker not found")],
    ["top purpose copy before input", purposeIndex >= 0 && formIndex > purposeIndex ? check("PASS", "purpose copy appears before CompoundForm") : check("WARN", "purpose copy proximity needs manual review")],
    ["input form marker near top", formIndex >= 0 && resultIndex > formIndex && formSource.includes("compound-calculate") ? check("PASS", "CompoundForm + compound-calculate") : check("FAIL", "input form marker missing")],
    ["FAQ/intent coverage", faqHits.length === FAQ_INTENTS.length ? check("PASS", faqHits.join(", ")) : check("WARN", `matched ${faqHits.length}/${FAQ_INTENTS.length}: ${faqHits.join(", ")}`)],
    ["GA4 event strings maintained", [
      pageSource.includes("tool_calculate"),
      quickSource.includes("tool_quick_compare_view"),
      frequencySource.includes("tool_frequency_compare_view"),
      contributionSource.includes("tool_contribution_scenario_view"),
      ctaSource.includes("tool_result_cta_view"),
      ctaSource.includes("tool_result_cta_click"),
    ].every(Boolean) ? check("PASS", "calculate/quick/frequency/contribution/CTA events found") : check("FAIL", "one or more GA4 event strings missing")],
  ];

  const bridgePost = parsePost("/posts/personalFinance/compound-calculator-guide");
  const bridgeTop400 = normalizeText(bridgePost.content).slice(0, 400);
  const bridgeRows = [
    ["bridge post exists", bridgePost.exists ? check("PASS", "compound-calculator-guide.md") : check("FAIL", "missing")],
    ["bridge link in top 400 chars", bridgeTop400.includes("/tools/compound-interest") ? check("PASS", "tool link appears in first 400 normalized chars") : check("WARN", "tool link not found in first 400 chars")],
    ["bridge in sitemap-ko.xml", sitemapKoLocs.includes(`${SITE_URL}/posts/personalFinance/compound-calculator-guide`) ? check("PASS", "present") : check("FAIL", "missing")],
    ["bridge noindex absent", bridgePost.exists && bridgePost.data.noindex !== true && !String(bridgePost.data.robots || "").includes("noindex") ? check("PASS", "indexable frontmatter") : check("FAIL", "noindex/robots noindex found")],
  ];

  const targetRows = TARGETS.map((target) => {
    const url = `${SITE_URL}${target.path}`;
    const sitemap = sitemapKoLocs.includes(url) || sitemapMainLocs.includes(url) || sitemapZeroLocs.includes(url);
    const blocked = isBlockedByRobots(target.path, disallows);
    let exists = true;
    let noindex = false;
    if (target.type === "post") {
      const post = parsePost(target.path);
      exists = post.exists;
      noindex = post.data.noindex === true || String(post.data.robots || "").includes("noindex");
    }
    return {
      ...target,
      sitemap,
      blocked,
      exists,
      noindex,
    };
  });

  const rssRows = RSS_CORE_PATHS.map((sitePath) => ({
    sitePath,
    included: rssPaths.includes(sitePath),
  }));

  const criticalFailures = [
    ...calculatorRows,
    ...bridgeRows,
  ].filter(([, result]) => result.status === "FAIL");

  const clusterMissingLinks = linkScan.clusterRows.filter((row) => row.linkCount === 0);
  const warnRows = [
    ...calculatorRows,
    ...bridgeRows,
  ].filter(([, result]) => result.status === "WARN");

  const report = buildReport({
    calculatorRows,
    bridgeRows,
    targetRows,
    linkScan,
    rssRows,
    robotsSitemaps: sitemaps,
    criticalFailures,
    warnRows,
    clusterMissingLinks,
    rssItemCount: rssItems.length,
  });

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, report, "utf8");

  console.log("Naver compound top-5 readiness audit complete.");
  console.log(`Report: ${path.relative(process.cwd(), REPORT_PATH)}`);
  console.log(`Critical failures: ${criticalFailures.length}`);
  console.log(`Warnings: ${warnRows.length + clusterMissingLinks.length}`);
}

function buildReport({
  calculatorRows,
  bridgeRows,
  targetRows,
  linkScan,
  rssRows,
  robotsSitemaps,
  criticalFailures,
  warnRows,
  clusterMissingLinks,
  rssItemCount,
}) {
  const finalDecision = criticalFailures.length
    ? "FAIL - 기본 수집/색인/내부링크 회귀 확인 필요"
    : "PASS - 네이버 복리 계산기 5페이지 진입 준비 감사 완료";

  const targetTable = targetRows.map((row) => (
    `| ${row.path} | ${row.exists ? "PASS" : "FAIL"} | ${row.sitemap ? "PASS" : "FAIL"} | ${row.blocked ? "FAIL" : "PASS"} | ${row.noindex ? "FAIL" : "PASS"} |`
  ));

  const clusterTable = linkScan.clusterRows.map((row) => (
    `| ${row.sitePath} | ${row.linkCount ? "PASS" : "WARN"} | ${row.linkCount} | ${row.anchors.join(", ") || "-"} |`
  ));

  const anchorTable = linkScan.variantCounts.map((row) => (
    `| ${row.variant} | ${row.count} |`
  ));

  const rssTable = rssRows.map((row) => (
    `| ${row.sitePath} | ${row.included ? "PASS" : "WARN"} |`
  ));

  const gaps = [];
  if (warnRows.length) {
    gaps.push(...warnRows.map(([name, result]) => `- WARN: ${name} - ${result.details}`));
  }
  if (clusterMissingLinks.length) {
    gaps.push(...clusterMissingLinks.map((row) => `- WARN: ${row.sitePath}에서 /tools/compound-interest 내부링크가 확인되지 않음`));
  }
  if (!gaps.length) {
    gaps.push("- 핵심 수집/색인/내부링크 회귀는 확인되지 않음");
  }
  gaps.push("- 네이버 실제 5페이지 안 진입 여부는 Codex가 임의로 판단하지 않고 수동 SERP 체크 템플릿에 기록해야 함");

  return `# 네이버 복리 계산기 5페이지 진입 준비 감사

## 현재 목표

네이버에서 \`복리 계산기\`, \`월복리 계산기\`, \`적립식 복리 계산기\` 등 핵심 키워드가 5페이지 안에 진입할 수 있도록, 현재 FinMap 계산기/브릿지/내부링크/RSS/sitemap 준비 상태를 점검한다. 이번 감사는 코드와 기존 콘텐츠를 수정하지 않고 readiness와 외부 발행 초안만 정리한다.

## 현재 상태

- Google: 복리 계산 4페이지권 노출 확인
- GSC: /tools/compound-interest 최근 7일 노출 362 / 클릭 1
- Naver: 핵심 키워드 5페이지 안 진입 여부는 수동 확인 필요

## 네이버 5페이지 진입 조건

- 5페이지 밖/미노출: P0 개선 대상
- 4~5페이지: 후보 진입 초기, 내부링크와 외부 언급 강화
- 2~3페이지: 스니펫/외부링크 강화
- 1페이지: CTR 유지와 title/description 과잉 수정 방지

## 계산기 Readiness

| Check | Status | Detail |
| --- | --- | --- |
${calculatorRows.map(([name, result]) => `| ${name} | ${statusIcon(result.status)} | ${result.details} |`).join("\n")}

## 브릿지 콘텐츠 Readiness

| Check | Status | Detail |
| --- | --- | --- |
${bridgeRows.map(([name, result]) => `| ${name} | ${statusIcon(result.status)} | ${result.details} |`).join("\n")}

## 대상 URL 수집/색인 상태

| URL | File exists | Sitemap | Robots | Noindex |
| --- | --- | --- | --- | --- |
${targetTable.join("\n")}

## 내부링크/앵커 분포

| Anchor class | Count |
| --- | ---: |
| exact | ${linkScan.counts.exact || 0} |
| variant | ${linkScan.counts.variant || 0} |
| generic | ${linkScan.counts.generic || 0} |
| other | ${linkScan.counts.other || 0} |

| Anchor variant | Count |
| --- | ---: |
${anchorTable.join("\n")}

| Cluster URL | Link to calculator | Count | Anchors |
| --- | --- | ---: | --- |
${clusterTable.join("\n")}

## RSS / Sitemap / Robots

- \`sitemap-ko.xml\`: /tools/compound-interest 포함 확인
- \`robots.txt\`: 수집 차단 경로와 충돌 없음
- \`robots.txt\` sitemap 선언: ${robotsSitemaps.join(", ")}
- \`rss.xml\`: KO 최신 글 ${rssItemCount}개 후보 기준 점검

| RSS core path | Included in latest KO RSS candidates |
| --- | --- |
${rssTable.join("\n")}

## 발견 Gap

${gaps.join("\n")}

## 다음 작업 우선순위

| Priority | Action | Reason |
| --- | --- | --- |
| P0 | 네이버 수동 순위 체크 템플릿 작성 및 실제 순위 입력 | Codex는 네이버 SERP 결과를 임의 생성하지 않음 |
| P0 | 네이버 블로그/Tistory 외부 초안 별도 문장으로 발행 검토 | 계산기 키워드 외부 언급과 자연 링크 확보 |
| P1 | WARN 항목이 있으면 FAQ/앵커/브릿지 링크 위치를 별도 작업으로 검토 | 이번 작업은 감사/초안 생성만 수행 |
| P2 | 순위 2~3페이지 진입 후 스니펫/CTR 개선 여부 재점검 | title/description 과잉 수정 방지 |

## 외부 발행 주의사항

- 네이버 블로그와 Tistory에 같은 문장을 복사하지 않는다.
- 링크를 과도하게 넣지 않는다.
- 모든 앵커를 \`복리 계산기\`로 반복하지 않는다.
- 외부 글 자체가 독립적으로 가치 있어야 한다.
- \`1위 보장\`, \`수익 보장\` 같은 표현을 쓰지 않는다.
- 이미지는 선택 사항이지만 표나 계산 예시는 유용하다.

## 검증 결과

| Command | Result |
| --- | --- |
| node --check scripts\\audit_naver_compound_top5_readiness.js | PENDING |
| node scripts\\audit_naver_compound_top5_readiness.js | PENDING |
| npm.cmd run build | PENDING |
| node scripts\\verify_seo_channel_split.js --local-server | PENDING |
| node scripts\\verify_post_publish_urls.js --local-server ... | PENDING |
| git diff --check | PENDING |

## 최종 판정

${finalDecision}
`;
}

runAudit();
