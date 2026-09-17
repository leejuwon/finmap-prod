const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DATE_STAMP = "2026-09-17";
const REPORT_JSON = path.join(ROOT, "reports", `naver-ko-technical-seo-batch-g-${DATE_STAMP}.json`);

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function main() {
  if (!fs.existsSync(REPORT_JSON)) throw new Error(`Missing Batch G report: ${rel(REPORT_JSON)}`);
  const report = JSON.parse(fs.readFileSync(REPORT_JSON, "utf8"));
  const full = report.fullSiteHreflang || {};
  const structured = report.structuredData || {};
  const after = structured.afterState || {};
  const dca = report.dcaHub || {};
  const preservation = report.preservation || {};

  const validation = {
    finalVerdictPass: String(report.finalVerdict || "").startsWith("PASS_TECHNICAL_SEO_BATCH_G"),
    hreflangClean:
      full.brokenAlternateTargets === 0 &&
      full.missingReciprocalIssues === 0 &&
      full.canonicalMismatches === 0 &&
      full.duplicateHreflangEntries === 0 &&
      full.invalidLanguageCodes === 0,
    structuredDataClean:
      structured.renderedConflicting === 0 &&
      structured.manualRequired === 0 &&
      after.conflictingArticleLikeNodes === 0 &&
      after.jsonLdParseErrors === 0,
    dcaHubClean:
      dca.canonicalSelf === true &&
      dca.koSitemapIncluded === true &&
      dca.fakeEnUrlPresent === false &&
      dca.brokenHreflang === false,
    preservationClean:
      preservation.titleChanges === 0 &&
      preservation.descriptionChanges === 0 &&
      preservation.h1H2Changes === 0 &&
      preservation.faqVisibleTextChanges === 0 &&
      preservation.internalLinkArchitectureChanges === 0 &&
      preservation.slugChanges === 0 &&
      preservation.redirectChanges === 0 &&
      preservation.dateModifiedEditorialChanges === 0,
  };
  validation.pass = Object.values(validation).every(Boolean);

  console.log(JSON.stringify({
    finalVerdict: validation.pass ? "PASS_TECHNICAL_SEO_BATCH_G_VERIFICATION" : "FAIL_TECHNICAL_SEO_BATCH_G_VERIFICATION",
    sourceReport: rel(REPORT_JSON),
    batchGFinalVerdict: report.finalVerdict,
    validation,
    keyMetrics: {
      hreflangFixed: report.hreflang?.fixed,
      structuredDataCleaned: structured.actuallyCleaned,
      renderedConflicting: structured.renderedConflicting,
      brokenAlternateTargets: full.brokenAlternateTargets,
      fakeEnDcaHub: dca.fakeEnUrlPresent,
    },
  }, null, 2));

  if (!validation.pass) process.exitCode = 1;
}

main();
