const fs = require("fs");
const path = require("path");
const { DATE_STAMP, buildStep7Data, writeCsv } = require("./verify_naver_ko_full_site_final_step7");

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "reports");
const REPORT_JSON = path.join(REPORT_DIR, `naver-ko-final-monitoring-baseline-${DATE_STAMP}.json`);
const REPORT_CSV = path.join(REPORT_DIR, `naver-ko-final-monitoring-baseline-${DATE_STAMP}.csv`);

const COLUMNS = [
  "url",
  "category",
  "slug",
  "title",
  "description",
  "dateModified",
  "primaryQuery",
  "topicFamily",
  "role",
  "queryOwnershipStatus",
  "contextualInbound",
  "contextualOutbound",
  "coreUrl",
  "hubUrl",
  "marketFunnel",
  "toolFunnel",
  "hreflangStatus",
  "schemaStatus",
  "monitoringPriority",
  "naverRank",
  "naverImpressions",
  "naverClicks",
  "naverCtr",
];

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function main() {
  const step7 = buildStep7Data({ writeReports: false });
  const rows = step7.monitoringRows || [];
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(
    REPORT_JSON,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "Step 7 final current-state repository scan",
        postCount: rows.length,
        priorityCounts: countBy(rows, "monitoringPriority"),
        queryOwnershipCounts: countBy(rows, "queryOwnershipStatus"),
        externalNaverFields: "MANUAL_OR_EXTERNAL_BASELINE_REQUIRED",
        rows,
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  writeCsv(REPORT_CSV, rows, COLUMNS);

  console.log(
    JSON.stringify(
      {
        finalVerdict: rows.length === 80 ? "PASS_FINAL_MONITORING_BASELINE_GENERATED" : "FAIL_FINAL_MONITORING_BASELINE_POST_COUNT",
        postCount: rows.length,
        priorityCounts: countBy(rows, "monitoringPriority"),
        outputs: {
          json: path.relative(ROOT, REPORT_JSON).replace(/\\/g, "/"),
          csv: path.relative(ROOT, REPORT_CSV).replace(/\\/g, "/"),
        },
      },
      null,
      2
    )
  );

  if (rows.length !== 80) process.exitCode = 1;
}

main();
