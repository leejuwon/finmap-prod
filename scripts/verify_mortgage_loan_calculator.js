const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://www.finmaphub.com";
const REPORT_PATH = path.join(ROOT, "reports", "mortgage-loan-calculator-p1-2-audit.md");
const AMOUNT_TOLERANCE = 100;

const FILES = {
  core: "lib/calculators/mortgageLoan.js",
  component: "_components/MortgageLoanCalculator.js",
  page: "pages/tools/mortgage-loan-calculator.js",
  toolsIndex: "pages/tools/index.js",
  analytics: "utils/analytics.js",
  resultCta: "_components/ToolResultCta.js",
  backlinkKit: "_components/ToolBacklinkKit.js",
  linkChecker: "scripts/check_posts_links_local.js",
  sitemapConfig: "next-sitemap.config.js",
  seoSplit: "scripts/verify_seo_channel_split.js",
};

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function roundWon(value) {
  return Math.round(Number(value) || 0);
}

function money(value) {
  return `${roundWon(value).toLocaleString("ko-KR")}원`;
}

function checkClose(label, actual, expected, checks) {
  const delta = Math.abs(roundWon(actual) - roundWon(expected));
  const pass = delta <= AMOUNT_TOLERANCE;
  checks.push({
    label,
    pass,
    detail: `actual=${money(actual)}, expected=${money(expected)}, delta=${money(delta)}`,
  });
}

function addCheck(checks, label, pass, detail = "") {
  checks.push({ label, pass: Boolean(pass), detail });
}

function extractSitemapLocs(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return [];
  return Array.from(fs.readFileSync(abs, "utf8").matchAll(/<loc>([\s\S]*?)<\/loc>/g), (match) =>
    match[1].trim()
  );
}

function sitemapIncludes(pathname) {
  const loc = `${SITE}${pathname}`;
  const sitemapFiles = [
    "public/sitemap-0.xml",
    "public/sitemap-ko.xml",
    "public/sitemap-en.xml",
    "public/en/sitemap.xml",
  ];
  return sitemapFiles.some((file) => extractSitemapLocs(file).includes(loc));
}

function markdownTable(rows) {
  return rows
    .map((row) => `| ${row.map((cell) => String(cell).replace(/\|/g, "\\|")).join(" | ")} |`)
    .join("\n");
}

function buildReport({ checks, equalPayment, equalPrincipal }) {
  const passCount = checks.filter((item) => item.pass).length;
  const failCount = checks.length - passCount;
  const lines = [];

  lines.push("# Mortgage Loan Calculator P1-2 Audit");
  lines.push("");
  lines.push(`- Generated: ${new Date().toISOString()}`);
  lines.push(`- Overall: ${failCount === 0 ? "PASS" : "FAIL"} (${passCount}/${checks.length})`);
  lines.push("");
  lines.push("## Changed Files");
  lines.push("");
  Object.values(FILES).forEach((file) => lines.push(`- \`${file}\``));
  lines.push("- `reports/mortgage-loan-calculator-p1-2-audit.md`");
  lines.push("");
  lines.push("## New URLs");
  lines.push("");
  lines.push("- KO: `/tools/mortgage-loan-calculator`");
  lines.push("- EN: `/en/tools/mortgage-loan-calculator`");
  lines.push("");
  lines.push("## Calculation Formula");
  lines.push("");
  lines.push("- Equal payment: reused `calculateMonthlyPayment()` from `lib/calculators/dsrLtv.js`.");
  lines.push("- Equal principal: monthly principal = `loanAmount / months`; monthly interest = `remainingPrincipal * annualRate / 100 / 12`.");
  lines.push("- Bullet repayment: monthly interest only; principal is paid at maturity.");
  lines.push("- Rate sensitivity: same loan amount, term, repayment type, and grace period with annual rate `+1%p`.");
  lines.push("");
  lines.push("## Sample Results");
  lines.push("");
  lines.push("| Sample | Expected monthly | First month | Last month | Total interest | Total repayment | +1%p monthly | +1%p delta |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  lines.push(
    markdownTable([
      [
        "Equal payment, 3억, 4%, 30년",
        money(equalPayment.expectedMonthlyPayment),
        money(equalPayment.firstMonthPayment),
        money(equalPayment.lastMonthPayment),
        money(equalPayment.totalInterest),
        money(equalPayment.totalPayment),
        money(equalPayment.ratePlusOneMonthlyPayment),
        money(equalPayment.ratePlusOneDelta),
      ],
      [
        "Equal principal, 3억, 4%, 30년",
        money(equalPrincipal.expectedMonthlyPayment),
        money(equalPrincipal.firstMonthPayment),
        money(equalPrincipal.lastMonthPayment),
        money(equalPrincipal.totalInterest),
        money(equalPrincipal.totalPayment),
        money(equalPrincipal.ratePlusOneMonthlyPayment),
        money(equalPrincipal.ratePlusOneDelta),
      ],
    ])
  );
  lines.push("");
  lines.push("## Tool Hub Card Copy");
  lines.push("");
  lines.push("- Title: `주담대 원리금 계산기`");
  lines.push("- Description: `대출금액, 금리, 기간, 상환방식으로 주택담보대출 월상환액과 총이자를 계산합니다.`");
  lines.push("- Button: `월상환액 계산하기`");
  lines.push("- Badge: `주담대·월상환액`");
  lines.push("");
  lines.push("## Events");
  lines.push("");
  lines.push("- `mortgage_payment_calculate`");
  lines.push("- `tool_calculate`");
  lines.push("- `mortgage_payment_next_click`");
  lines.push("- Params: `source_tool=mortgageLoan`, `repayment_type`, `loan_amount_bucket`, `rate_bucket`, `term_years`, `has_result`");
  lines.push("");
  lines.push("## Internal Links");
  lines.push("");
  lines.push("- `/tools/dsr-ltv-calculator`");
  lines.push("- `/tools/home-buying-budget-calculator`");
  lines.push("- `/market/real-estate/seoul-top100`");
  lines.push("- `/market/real-estate/magok-top100`");
  lines.push("");
  lines.push("## Verification Results");
  lines.push("");
  lines.push("| Check | Result | Detail |");
  lines.push("| --- | --- | --- |");
  checks.forEach((check) => {
    lines.push(`| ${check.label} | ${check.pass ? "PASS" : "FAIL"} | ${check.detail || "-"} |`);
  });
  lines.push("");
  lines.push("## Remaining Risks");
  lines.push("");
  lines.push("- Actual lending terms still require financial-institution review and may differ by credit profile, income recognition, regulations, stress DSR, collateral value, and guarantee conditions.");
  lines.push("- The calculator does not automatically apply policy updates or bank-specific fee/rate rules.");
  lines.push("- 320px/390px layout is designed to put the input card near the first viewport, but final visual QA should still be done in a browser.");
  lines.push("");

  return lines.join("\n");
}

async function main() {
  const checks = [];
  const modulePath = path.join(ROOT, "lib", "calculators", "mortgageLoan.js");
  const { calculateMortgageLoan, MORTGAGE_REPAYMENT_TYPES } = await import(pathToFileURL(modulePath).href);

  const equalPayment = calculateMortgageLoan({
    loanAmount: 300000000,
    annualRate: 4,
    termYears: 30,
    repaymentType: MORTGAGE_REPAYMENT_TYPES.EQUAL_PAYMENT,
  });
  const equalPrincipal = calculateMortgageLoan({
    loanAmount: 300000000,
    annualRate: 4,
    termYears: 30,
    repaymentType: MORTGAGE_REPAYMENT_TYPES.EQUAL_PRINCIPAL,
  });

  checkClose("equal payment monthly", equalPayment.expectedMonthlyPayment, 1432246, checks);
  checkClose("equal payment total interest", equalPayment.totalInterest, 215608519, checks);
  checkClose("equal principal first month", equalPrincipal.firstMonthPayment, 1833333, checks);
  checkClose("equal principal last month", equalPrincipal.lastMonthPayment, 836111, checks);
  checkClose("equal principal total interest", equalPrincipal.totalInterest, 180500000, checks);
  checkClose("rate +1pp sensitivity", equalPayment.ratePlusOneDelta, 178219, checks);

  const core = read(FILES.core);
  const component = read(FILES.component);
  const page = read(FILES.page);
  const toolsIndex = read(FILES.toolsIndex);
  const analytics = read(FILES.analytics);
  const resultCta = read(FILES.resultCta);
  const backlinkKit = read(FILES.backlinkKit);
  const linkChecker = read(FILES.linkChecker);
  const sitemapConfig = read(FILES.sitemapConfig);
  const seoSplit = read(FILES.seoSplit);

  addCheck(checks, "core reuses DSR/LTV monthly payment", core.includes("calculateMonthlyPayment"));
  addCheck(checks, "page route exists", exists(FILES.page), FILES.page);
  addCheck(checks, "SEO title/H1/description", page.includes("주담대 원리금 계산기 - 아파트 담보대출 월상환액 계산") && page.includes("주담대 원리금 계산기: 아파트 담보대출 월상환액 계산") && page.includes("대출금액, 금리, 대출기간, 상환방식을 입력해"));
  addCheck(checks, "WebApplication JSON-LD", page.includes('"@type": "WebApplication"'));
  addCheck(checks, "BreadcrumbList JSON-LD", page.includes('"@type": "BreadcrumbList"'));
  addCheck(checks, "tool hub card", toolsIndex.includes("/tools/mortgage-loan-calculator") && toolsIndex.includes("주담대 원리금 계산기") && toolsIndex.includes("월상환액 계산하기") && toolsIndex.includes("주담대·월상환액"));
  addCheck(checks, "analytics path mapping", analytics.includes("/tools/mortgage-loan-calculator") && analytics.includes("mortgageLoan"));
  addCheck(checks, "ToolResultCta mortgageLoan config", resultCta.includes("mortgageLoan") && resultCta.includes("/tools/mortgage-loan-calculator"));
  addCheck(checks, "ToolBacklinkKit mortgageLoan config", backlinkKit.includes("mortgageLoan") && backlinkKit.includes("주담대 원리금 계산기") && backlinkKit.includes("아파트 담보대출 계산기"));
  addCheck(checks, "known tool slug", linkChecker.includes('"mortgage-loan-calculator"'));
  addCheck(checks, "sitemap config KO/EN", sitemapConfig.includes("'/tools/mortgage-loan-calculator'") && sitemapConfig.includes('"/en/tools/mortgage-loan-calculator"'));
  addCheck(checks, "SEO split samples", seoSplit.includes("/tools/mortgage-loan-calculator") && seoSplit.includes("/en/tools/mortgage-loan-calculator"));
  addCheck(checks, "events and params", component.includes("mortgage_payment_calculate") && component.includes("tool_calculate") && component.includes('SOURCE_TOOL = "mortgageLoan"') && component.includes("repayment_type") && component.includes("loan_amount_bucket") && component.includes("rate_bucket") && component.includes("term_years") && component.includes("has_result"));
  addCheck(checks, "result internal links", component.includes("/tools/dsr-ltv-calculator") && component.includes("/tools/home-buying-budget-calculator") && component.includes("/market/real-estate/seoul-top100") && component.includes("/market/real-estate/magok-top100"));
  addCheck(checks, "generated KO sitemap includes page", sitemapIncludes("/tools/mortgage-loan-calculator"));
  addCheck(checks, "generated EN sitemap includes page", sitemapIncludes("/en/tools/mortgage-loan-calculator"));

  checks.forEach((check) => {
    console.log(`${check.pass ? "PASS" : "FAIL"}\t${check.label}\t${check.detail || ""}`);
  });

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, buildReport({ checks, equalPayment, equalPrincipal }), "utf8");
  console.log(`Report written: ${path.relative(ROOT, REPORT_PATH)}`);

  if (checks.some((check) => !check.pass)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
