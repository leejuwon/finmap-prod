const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = process.cwd();
const PAGE_PATH = path.join(ROOT, "pages", "tools", "compound-interest.js");
const source = fs.readFileSync(PAGE_PATH, "utf8");

function countMatches(input, pattern) {
  return (input.match(pattern) || []).length;
}

function readSeoPair(field) {
  const pattern = new RegExp(
    `${field}:\\s*\\n\\s*locale === "ko"\\s*\\n\\s*\\? "([^"]+)"\\s*\\n\\s*: "([^"]+)"`
  );
  const match = source.match(pattern);
  return match ? { ko: match[1], en: match[2] } : null;
}

function readFaqCounts() {
  const start = source.indexOf("const faqItems = useMemo");
  const end = source.indexOf("const faqJsonLd = useMemo", start);
  if (start < 0 || end < 0) return null;

  const block = source.slice(start, end);
  const koStart = block.indexOf("? [");
  const enStart = block.indexOf("\n        : [", koStart);
  const enEnd = block.lastIndexOf("],");
  if (koStart < 0 || enStart < 0 || enEnd < 0) return null;

  return {
    ko: countMatches(block.slice(koStart, enStart), /\bq:\s*"/g),
    en: countMatches(block.slice(enStart, enEnd), /\bq:\s*"/g),
  };
}

function compoundLibrariesUnchanged() {
  try {
    execFileSync(
      "git",
      ["diff", "--quiet", "HEAD", "--", "lib/compoundCore.js", "lib/compound.js"],
      { cwd: ROOT, stdio: "ignore" }
    );
    return true;
  } catch {
    return false;
  }
}

const title = readSeoPair("title");
const desc = readSeoPair("desc");
const faqCounts = readFaqCounts();

const checks = [
  {
    name: "KO title excludes annual-compounding claim",
    pass: Boolean(title && !title.ko.includes("연복리")),
    detail: title?.ko,
  },
  {
    name: "KO title keeps monthly/recurring intent",
    pass: Boolean(title && (title.ko.includes("월복리") || title.ko.includes("적립식"))),
    detail: title?.ko,
  },
  {
    name: "KO description states monthly basis",
    pass: Boolean(desc && desc.ko.includes("월복리 기준")),
    detail: desc?.ko,
  },
  {
    name: "EN description removes selectable-frequency wording",
    pass: Boolean(desc && !desc.en.toLowerCase().includes("compound frequency")),
    detail: desc?.en,
  },
  {
    name: "EN description states monthly compounding",
    pass: Boolean(desc && desc.en.toLowerCase().includes("monthly compounding")),
    detail: desc?.en,
  },
  {
    name: "KO FAQ count is 20-24",
    pass: Boolean(faqCounts && faqCounts.ko >= 20 && faqCounts.ko <= 24),
    detail: faqCounts?.ko,
  },
  {
    name: "EN FAQ count is 5-8",
    pass: Boolean(faqCounts && faqCounts.en >= 5 && faqCounts.en <= 8),
    detail: faqCounts?.en,
  },
  {
    name: "FAQPage JSON-LD appears once",
    pass: countMatches(source, /"@type":\s*"FAQPage"/g) === 1,
    detail: countMatches(source, /"@type":\s*"FAQPage"/g),
  },
  {
    name: "FAQPage maps the shared faqItems source",
    pass: countMatches(source, /mainEntity:\s*faqItems\.map/g) === 1,
    detail: countMatches(source, /mainEntity:\s*faqItems\.map/g),
  },
  {
    name: "faqItems is used by JSON-LD and two exclusive UI branches",
    pass: countMatches(source, /faqItems\.map/g) === 3 && source.includes("!hasResult && ("),
    detail: countMatches(source, /faqItems\.map/g),
  },
  {
    name: "Page keeps one H1 source",
    pass: countMatches(source, /<h1\b/g) === 1,
    detail: countMatches(source, /<h1\b/g),
  },
  {
    name: "SeoHead keeps the compound route and locale",
    pass: source.includes('url="/tools/compound-interest"') && source.includes("locale={locale}"),
    detail: "/tools/compound-interest",
  },
  {
    name: "Body clarifies the verified monthly basis",
    pass: source.includes("현재 FinMap 복리 계산기는 검증된 월복리 기준으로 계산"),
    detail: "monthly basis copy",
  },
  {
    name: "Compound calculation libraries are unchanged",
    pass: compoundLibrariesUnchanged(),
    detail: "lib/compoundCore.js, lib/compound.js",
  },
];

console.log("Compound Phase 1-4 SEO/FAQ verification");
console.log("------------------------------------------");
for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "FAIL"}\t${check.name}\t${check.detail ?? ""}`);
}

const failed = checks.filter((check) => !check.pass);
if (failed.length) {
  console.error(`FAIL: ${failed.length} check(s) failed`);
  process.exit(1);
}

console.log(`FAQ counts: KO ${faqCounts.ko}, EN ${faqCounts.en}`);
console.log("All Phase 1-4 SEO/FAQ checks PASS");
