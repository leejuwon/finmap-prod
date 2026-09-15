const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const TARGET = "pages/market/real-estate/magok-top100.js";
const EVIDENCE = path.join(ROOT, "reports/magok-top100-scope-evidence-2026-09-15.json");
const REPORT = path.join(ROOT, "reports/magok-top100-data-scope-fix-2026-09-15.md");
const PUBLIC_PROPS = path.join(ROOT, ".next/real-estate-p1-public-props.json");
const PRIOR_AUDIT = path.join(ROOT, "reports/naver-real-estate-dashboard-p1-evidence-2026-09-15.json");
const MAGOK = "마곡동";
const LAWD = "11500";
const NON_MAGOK_CHECK_DONGS = ["화곡동", "염창동", "내발산동", "등촌동", "가양동", "방화동", "공항동"];
const OTHER_LANDING_FILES = [
  "pages/market/real-estate/seoul-top100.js",
  "pages/market/real-estate/gangnam-top100.js",
  "pages/market/real-estate/gangnam3-top100.js",
  "pages/market/real-estate/mayongseong-top100.js",
  "pages/market/real-estate/songpa-top100.js",
  "pages/market/real-estate/songpa-gangnam-top100.js",
];
const PROTECTED_EXPERIMENT_PATHS = [
  "pages/tools/dsr-ltv-calculator.js",
  "pages/tools/home-buying-budget-calculator.js",
  "pages/tools/compound-calculator.js",
  "pages/tools/dca-calculator.js",
  "pages/tools/cagr-calculator.js",
  "pages/tools/fire-calculator.js",
  "pages/tools/goal-simulator.js",
  "_components/DsrLtvCalculator.js",
  "_components/MortgageLoanCalculator.js",
  "_components/CompoundForm.js",
  "_components/DcaForm.js",
  "_components/CagrForm.js",
  "_components/FireForm.js",
  "_components/GoalForm.js",
];
const beforeCondition = 'regionWhereSql: "s.lawd_cd  = ?",';
const afterCondition = 'regionWhereSql: "s.lawd_cd = ? AND s.dong_name = ?",';
const beforeParams = "regionParams: [REGION.lawd],";
const afterParams = "regionParams: [REGION.lawd, REGION.dongName],";
const read = (p) => fs.readFileSync(path.resolve(ROOT, p), "utf8");
const hash = (p) => crypto.createHash("sha256").update(fs.readFileSync(path.resolve(ROOT, p))).digest("hex");
const save = (data) => fs.writeFileSync(EVIDENCE, `${JSON.stringify(data, null, 2)}\n`);

function compactSql(sql) {
  return String(sql || "").replace(/\s+/g, " ").trim();
}

function assertReadOnlySql(sql) {
  const normalized = compactSql(sql);
  assert.match(normalized, /^(SELECT|SHOW)\b/i, "Only read-only SQL is allowed in this verification");
  assert.doesNotMatch(normalized, /\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|REPLACE)\b/i, "Write-capable SQL is forbidden");
}

async function queryReadOnly(pool, sql, params = []) {
  assertReadOnlySql(sql);
  const [rows] = await pool.query(sql, params);
  return JSON.parse(JSON.stringify(rows || []));
}

function loadEnvQuietly() {
  try {
    const dotenv = require("dotenv");
    for (const file of [".env.local", ".env.production", ".env"]) {
      const full = path.join(ROOT, file);
      if (fs.existsSync(full)) dotenv.config({ path: full, override: false, quiet: true });
    }
  } catch {}
}

function distribution(rows) {
  return rows.reduce((counts, row) => {
    const dong = row.apt_key.split("|")[2];
    counts[dong] = (counts[dong] || 0) + 1;
    return counts;
  }, {});
}

function rowsDistribution(rows) {
  return (rows || []).reduce((acc, row) => {
    const dong = String(row.apt_key || "").split("|")[2] || row.dong_name || "";
    if (!dong) return acc;
    acc[dong] = (acc[dong] || 0) + 1;
    return acc;
  }, {});
}

function markdownTable(headers, rows) {
  const safe = (v) => String(v == null ? "" : v).replace(/\|/g, "\\|");
  return [
    `| ${headers.map(safe).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...(rows || []).map((row) => `| ${row.map(safe).join(" | ")} |`),
  ].join("\n");
}

function extractLine(source, pattern) {
  return String(source || "").split(/\r?\n/).find((line) => line.includes(pattern))?.trim() || "";
}

function sourceGuardSummary(evidence) {
  const changedProtected = Object.entries(evidence.baseline.protectedHashes)
    .filter(([p, digest]) => hash(p) !== digest)
    .map(([p]) => p);
  const otherLandingChanged = OTHER_LANDING_FILES.filter((p) => evidence.baseline.protectedHashes[p] && hash(p) !== evidence.baseline.protectedHashes[p]);
  const protectedExperimentChanged = PROTECTED_EXPERIMENT_PATHS.filter((p) => fs.existsSync(path.join(ROOT, p)) && evidence.baseline.protectedHashes[p] && hash(p) !== evidence.baseline.protectedHashes[p]);
  return { changedProtected, otherLandingChanged, protectedExperimentChanged };
}

function capture() {
  assert.ok(!fs.existsSync(EVIDENCE), "Refusing to replace the task baseline");
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8" }).split("\0").filter(Boolean);
  const protectedFiles = tracked.filter((p) => p !== TARGET && (
    /^(pages|_components|lib|server\/crawler|ops)\//.test(p) ||
    /^(next[^/]*\.config\.js|proxy\.[jt]s|middleware\.[jt]s)$/.test(p) ||
    /^public\/(?:.*\/)?(?:sitemap[^/]*\.xml|robots\.txt)$/.test(p)
  ));
  const prior = JSON.parse(read(PRIOR_AUDIT));
  const props = JSON.parse(read(PUBLIC_PROPS))["/market/real-estate/magok-top100"];
  assert.ok(props?.rows?.length, "Public response fixture is required before editing");
  assert.ok(props.rows.some((r) => r.apt_key.split("|")[2] === MAGOK));
  save({
    baseline: {
      capturedAt: new Date().toISOString(), targetSource: read(TARGET),
      protectedHashes: Object.fromEntries(protectedFiles.map((p) => [p, hash(p)])),
    },
    publicFixture: {
      source: "https://www.finmaphub.com/market/real-estate/magok-top100",
      observedAt: prior.production.checkedAt, props,
      note: "Pre-fix Gangseo Top100 public props, capped at 100; not the complete monthly DB table.",
    },
    databaseValidation: { status: "EXTERNAL_DB_VALIDATION_GAP", reason: "Local read-only schema query failed with ECONNREFUSED; repository DDL, ingestion/aggregation source, and public apt_key values verified." },
  });
  console.log(`Captured ${protectedFiles.length} protected file hashes and ${props.rows.length} public rows.`);
}

async function compile(source, imports = {}) {
  const { transform, loadBindings } = require("next/dist/build/swc");
  await loadBindings();
  const { code } = await transform(source, {
    filename: "magok-scope-verification.jsx",
    jsc: { parser: { syntax: "ecmascript", jsx: true }, target: "es2020", transform: { react: { runtime: "automatic" } } },
    module: { type: "commonjs" },
  });
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: (name) => {
      if (Object.hasOwn(imports, name)) return imports[name];
      if (name === "react/jsx-runtime") return require(name);
      throw new Error(`Unexpected test import: ${name}`);
    },
  }, { timeout: 5000 });
  return module.exports;
}

async function compilePage(source, imports = {}) {
  const defaultName = String(source).match(/export default function\s+([A-Za-z0-9_]+)/)?.[1] || "MagokTop100Page";
  const cjsSource = String(source)
    .replace(
      /import RealEstateTop100Landing from "\.\.\/\.\.\/\.\.\/_components\/RealEstateTop100Landing";/,
      'const RealEstateTop100Landing = require("../../../_components/RealEstateTop100Landing").default || require("../../../_components/RealEstateTop100Landing");'
    )
    .replace(
      /import \{ jsonSafe \} from "\.\.\/\.\.\/\.\.\/lib\/jsonSafe";/,
      'const { jsonSafe } = require("../../../lib/jsonSafe");'
    )
    .replace(
      /import \{ calcRangeFromLatestYm, fetchTop100Rows \} from "\.\.\/\.\.\/\.\.\/lib\/reTop100Landing";/,
      'const { calcRangeFromLatestYm, fetchTop100Rows } = require("../../../lib/reTop100Landing");'
    )
    .replace(/export default function\s+([A-Za-z0-9_]+)/, "function $1")
    .replace(/export async function getServerSideProps/, "async function __verifyGetServerSideProps");
  return compile(`${cjsSource}\nmodule.exports.default = ${defaultName};\nmodule.exports.getServerSideProps = __verifyGetServerSideProps;\n`, imports);
}

async function compileMagokPageWithPool(pool) {
  const helper = await compile(read("lib/reTop100Landing.js"));
  return compilePage(read(TARGET), {
    "../../../lib/reTop100Landing": helper,
    "../../../lib/jsonSafe": await compile(read("lib/jsonSafe.js")),
    "../../../lib/db": { pool },
    "../../../_components/RealEstateTop100Landing": { default: (props) => ({ props }) },
  });
}

function assertMagokOnly(label, rows) {
  const d = rowsDistribution(rows);
  const nonMagok = Object.keys(d).filter((dong) => dong !== MAGOK);
  assert.ok((rows || []).length > 0, `${label}: returned rows must be > 0`);
  assert.deepEqual(nonMagok, [], `${label}: non-Magok rows returned`);
  for (const dong of NON_MAGOK_CHECK_DONGS) assert.equal(d[dong] || 0, 0, `${label}: ${dong} must not be returned`);
  return { label, rows: rows.length, distinctDongCount: Object.keys(d).length, distribution: d, nonMagokRows: 0 };
}

async function runPageGssp(page, query = {}, locale = "ko") {
  const result = await page.getServerSideProps({
    query: { nocache: "1", ...query },
    locale,
    res: { setHeader() {} },
  });
  return JSON.parse(JSON.stringify(result.props));
}

async function verifyLiveDb(evidence) {
  loadEnvQuietly();
  process.env.DB_BOOT_CHECK = "false";
  const { pool } = require("../lib/db");
  const capturedQueries = [];
  const readPool = {
    query: async (sql, params = []) => {
      assertReadOnlySql(sql);
      capturedQueries.push({ sql: compactSql(sql), params: JSON.parse(JSON.stringify(params || [])) });
      return pool.query(sql, params);
    },
  };

  try {
    const db = {};
    db.checkedAt = new Date().toISOString();
    db.schemaColumns = await queryReadOnly(readPool, `
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN ('re_trade_apt_stats_m', 're_trade_apt_stats_y', 're_trade_apt')
        AND COLUMN_NAME IN ('deal_ym', 'deal_y', 'pyeong_band', 'lawd_cd', 'dong_name', 'apt_key', 'apt_name', 'tx_count', 'median_price')
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `);

    db.tables = await queryReadOnly(readPool, `
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN ('re_trade_deal_ym', 're_trade_apt_stats_m', 're_trade_apt_stats_y', 're_trade_apt')
      ORDER BY TABLE_NAME
    `);
    const tableSet = new Set(db.tables.map((r) => r.TABLE_NAME));
    assert.ok(tableSet.has("re_trade_deal_ym"), "re_trade_deal_ym table is required");
    assert.ok(tableSet.has("re_trade_apt_stats_m"), "re_trade_apt_stats_m table is required");

    const latestRows = await queryReadOnly(readPool, `SELECT MAX(deal_ym) AS max_ym FROM re_trade_deal_ym`);
    db.latestYm = String(latestRows?.[0]?.max_ym || "").trim();
    assert.match(db.latestYm, /^\d{6}$/, "latestYm must be YYYYMM");

    db.distinctGangseoDongs = await queryReadOnly(readPool, `
      SELECT
        dong_name,
        COUNT(*) AS row_count,
        COUNT(DISTINCT apt_key) AS apt_count,
        COUNT(DISTINCT deal_ym) AS month_count,
        MAX(deal_ym) AS latest_ym,
        SUM(tx_count) AS tx_count
      FROM re_trade_apt_stats_m
      WHERE lawd_cd = ?
        AND pyeong_band = 'all'
      GROUP BY dong_name
      ORDER BY dong_name
    `, [LAWD]);

    const gangseoDongNames = db.distinctGangseoDongs.map((r) => r.dong_name);
    assert.ok(gangseoDongNames.includes(MAGOK), "Gangseo stats must include Magok-dong");
    assert.ok(NON_MAGOK_CHECK_DONGS.some((dong) => gangseoDongNames.includes(dong)), "Gangseo stats should contain non-Magok dongs for scope contrast");

    db.magokExistence = (await queryReadOnly(readPool, `
      SELECT
        COUNT(*) AS row_count,
        COUNT(DISTINCT apt_key) AS apt_count,
        COUNT(DISTINCT deal_ym) AS month_count,
        MAX(deal_ym) AS latest_ym,
        SUM(tx_count) AS tx_count
      FROM re_trade_apt_stats_m
      WHERE lawd_cd = ?
        AND dong_name = ?
        AND pyeong_band = 'all'
    `, [LAWD, MAGOK]))[0];
    assert.ok(Number(db.magokExistence.row_count) > 0, "Magok rows must exist in re_trade_apt_stats_m");

    db.latestMonthMagok = (await queryReadOnly(readPool, `
      SELECT
        deal_ym,
        COUNT(*) AS row_count,
        COUNT(DISTINCT apt_key) AS apt_count,
        SUM(tx_count) AS tx_count,
        COUNT(DISTINCT dong_name) AS distinct_dong_count
      FROM re_trade_apt_stats_m
      WHERE lawd_cd = ?
        AND dong_name = ?
        AND pyeong_band = 'all'
        AND deal_ym = ?
      GROUP BY deal_ym
    `, [LAWD, MAGOK, db.latestYm]))[0] || null;
    assert.ok(db.latestMonthMagok && Number(db.latestMonthMagok.row_count) > 0, "Latest month Magok rows must exist");
    assert.equal(Number(db.latestMonthMagok.distinct_dong_count), 1, "Latest month Magok rows must have exactly one dong_name");

    if (tableSet.has("re_trade_apt_stats_y")) {
      db.statsYMagok = (await queryReadOnly(readPool, `
        SELECT
          COUNT(*) AS row_count,
          COUNT(DISTINCT apt_key) AS apt_count,
          MAX(deal_y) AS latest_y,
          SUM(tx_count) AS tx_count
        FROM re_trade_apt_stats_y
        WHERE lawd_cd = ?
          AND dong_name = ?
          AND pyeong_band = 'all'
      `, [LAWD, MAGOK]))[0];
    }

    if (tableSet.has("re_trade_apt")) {
      db.rawTradeDongSample = await queryReadOnly(readPool, `
        SELECT
          dong_name,
          COUNT(*) AS row_count,
          COUNT(DISTINCT apt_name) AS apt_count,
          MAX(deal_ym) AS latest_ym
        FROM re_trade_apt
        WHERE lawd_cd = ?
        GROUP BY dong_name
        ORDER BY dong_name
      `, [LAWD]);
    }

    const page = await compileMagokPageWithPool(readPool);
    const pm = await runPageGssp(page, {}, "ko");
    const m3 = await runPageGssp(page, { range: "m3" }, "ko");
    const en = await runPageGssp(page, {}, "en");
    const matrix = [assertMagokOnly("pm/all", pm.rows), assertMagokOnly("m3/all", m3.rows), assertMagokOnly("en/pm/all", en.rows)];

    const bandCandidates = await queryReadOnly(readPool, `
      SELECT
        pyeong_band,
        COUNT(*) AS row_count,
        COUNT(DISTINCT apt_key) AS apt_count
      FROM re_trade_apt_stats_m
      WHERE lawd_cd = ?
        AND dong_name = ?
        AND deal_ym BETWEEN ? AND ?
        AND pyeong_band <> 'all'
      GROUP BY pyeong_band
      HAVING row_count > 0
      ORDER BY row_count DESC, pyeong_band
      LIMIT 1
    `, [LAWD, MAGOK, pm.fromYm, pm.toYm]);
    if (bandCandidates[0]?.pyeong_band) {
      const bandProps = await runPageGssp(page, { band: bandCandidates[0].pyeong_band }, "ko");
      matrix.push(assertMagokOnly(`pm/band=${bandCandidates[0].pyeong_band}`, bandProps.rows));
      db.bandRegression = { selectedBand: bandCandidates[0].pyeong_band, rows: bandProps.rows.length };
    } else {
      db.bandRegression = { selectedBand: null, skipped: "No non-all pyeong_band rows for latest Magok range" };
    }

    const latestTopRows = pm.rows || [];
    db.pageVerification = {
      period: pm.period,
      fromYm: pm.fromYm,
      toYm: pm.toYm,
      rows: latestTopRows.length,
      distribution: rowsDistribution(latestTopRows),
      nonMagokRows: Object.entries(rowsDistribution(latestTopRows)).filter(([dong]) => dong !== MAGOK).reduce((sum, [, count]) => sum + count, 0),
      explicitNonMagokDongsAbsent: NON_MAGOK_CHECK_DONGS.every((dong) => !(rowsDistribution(latestTopRows)[dong] > 0)),
      rowLimit: latestTopRows.length <= 100,
      rangeBandMatrix: matrix,
    };
    assert.equal(db.pageVerification.nonMagokRows, 0, "Page result must not include non-Magok rows");
    assert.ok(db.pageVerification.rowLimit, "Page result must respect Top100 limit");

    const topQuery = capturedQueries.find((q) => q.sql.includes("FROM re_trade_apt_stats_m s") && q.sql.includes("LIMIT ?"));
    assert.ok(topQuery, "Expected to capture Top100 SQL");
    assert.match(topQuery.sql, /s\.lawd_cd = \? AND s\.dong_name = \?/);
    assert.match(topQuery.sql, /s1\.lawd_cd = \? AND s1\.dong_name = \?/);
    assert.ok(!topQuery.sql.includes(MAGOK), "Dong value must be parameter-bound");
    db.capturedTop100Query = { sql: topQuery.sql, params: topQuery.params };

    const guards = sourceGuardSummary(evidence);
    assert.deepEqual(guards.otherLandingChanged, [], "Other Top100 landing files changed");
    assert.deepEqual(guards.protectedExperimentChanged, [], "Protected experiment/calculator files changed");
    db.guards = guards;

    evidence.databaseValidation = { status: "PASS", ...db };
    evidence.finalVerdict = "PASS_MAGOK_SCOPE_FIXED";
    save(evidence);
    return evidence;
  } catch (error) {
    evidence.databaseValidation = {
      status: "BLOCKED_DB_VALIDATION_REQUIRED",
      checkedAt: new Date().toISOString(),
      error: error.message,
    };
    evidence.finalVerdict = "BLOCKED_DB_VALIDATION_REQUIRED";
    save(evidence);
    throw error;
  } finally {
    await pool.end().catch(() => {});
  }
}

function writeReport(evidence) {
  const current = read(TARGET);
  const original = evidence.baseline?.targetSource || "";
  const db = evidence.databaseValidation || {};
  const verification = evidence.verification || {};
  const guards = db.guards || sourceGuardSummary(evidence);
  const distinctRows = (db.distinctGangseoDongs || []).map((r) => [
    r.dong_name,
    r.row_count,
    r.apt_count,
    r.month_count,
    r.latest_ym,
    r.tx_count,
  ]);
  const matrixRows = (db.pageVerification?.rangeBandMatrix || []).map((r) => [
    r.label,
    r.rows,
    r.distinctDongCount,
    JSON.stringify(r.distribution),
    r.nonMagokRows,
  ]);
  const finalVerdict = evidence.finalVerdict || (db.status === "PASS" ? "PASS_MAGOK_SCOPE_FIXED" : "BLOCKED_DB_VALIDATION_REQUIRED");
  const report = `# Magok Top100 Data Scope Fix - 2026-09-15

## 1. Final Verdict

${finalVerdict}

## 2. Previous Root Cause

\`/market/real-estate/magok-top100\` used only \`s.lawd_cd = ?\`, so the Top100 query selected all Gangseo-gu rows. The intended page scope is Gangseo-gu Magok-dong.

## 3. DB Schema Verification

- Main source table: \`re_trade_apt_stats_m\`
- Verified columns include \`lawd_cd\`, \`dong_name\`, \`apt_key\`, \`deal_ym\`, \`pyeong_band\`, \`tx_count\`, and \`median_price\`.
- Live DB validation status: \`${db.status || "UNKNOWN"}\`

## 4. Distinct Gangseo Dong Values

${distinctRows.length ? markdownTable(["dong_name", "rows", "apt_count", "months", "latest_ym", "tx_count"], distinctRows) : "- Not available"}

## 5. Magok Data Existence

\`\`\`json
${JSON.stringify(db.magokExistence || null, null, 2)}
\`\`\`

## 6. Before SQL

\`\`\`js
${extractLine(original, "regionWhereSql") || beforeCondition}
${extractLine(original, "regionParams") || beforeParams}
\`\`\`

## 7. After SQL

\`\`\`js
${extractLine(current, "regionWhereSql")}
${extractLine(current, "regionParams")}
\`\`\`

## 8. Parameter Binding

- \`REGION.dongName = "마곡동"\`
- Captured SQL uses placeholders for both \`s.lawd_cd\` and \`s.dong_name\`.
- Captured params:

\`\`\`json
${JSON.stringify(db.capturedTop100Query?.params || verification.params || [], null, 2)}
\`\`\`

## 9. Latest Month Verification

\`\`\`json
${JSON.stringify({ latestYm: db.latestYm, latestMonthMagok: db.latestMonthMagok, page: db.pageVerification ? { period: db.pageVerification.period, fromYm: db.pageVerification.fromYm, toYm: db.pageVerification.toYm } : null }, null, 2)}
\`\`\`

## 10. Range / Area Verification

${matrixRows.length ? markdownTable(["case", "rows", "distinct_dongs", "distribution", "non_magok"], matrixRows) : "- Not available"}

## 11. Returned Dong Distribution

\`\`\`json
${JSON.stringify(db.pageVerification?.distribution || verification.publicSampleAfter || {}, null, 2)}
\`\`\`

## 12. Magok Row Count

- Returned rows: ${db.pageVerification?.rows ?? verification.afterRows ?? "unknown"}
- Non-Magok rows: ${db.pageVerification?.nonMagokRows ?? verification.nonMagokRows ?? "unknown"}
- Top100 limit respected: ${db.pageVerification?.rowLimit === true ? "yes" : "unknown"}

## 13. Other Landing Integrity

- Other landing files changed: ${guards.otherLandingChanged?.length ? guards.otherLandingChanged.join(", ") : "none"}
- Protected hashed files changed: ${guards.changedProtected?.length ? guards.changedProtected.join(", ") : "none"}

## 14. Files Changed

- \`pages/market/real-estate/magok-top100.js\`: scope condition changed from Gangseo-gu only to Gangseo-gu + Magok-dong.
- \`scripts/verify_magok_top100_scope.js\`: added live DB validation and report generation.
- \`reports/magok-top100-scope-evidence-2026-09-15.json\`: validation evidence.
- \`reports/magok-top100-data-scope-fix-2026-09-15.md\`: this report.

## 15. Protected Experiment Integrity

- Protected calculator/search experiment files changed: ${guards.protectedExperimentChanged?.length ? guards.protectedExperimentChanged.join(", ") : "none"}

## 16. Build / SSR Verification

- Source/fixture verification: ${verification.result || "pending"}
- Live DB SSR getServerSideProps verification: ${db.status === "PASS" ? "PASS" : "pending/blocked"}
- \`npm.cmd run build\`: pending
- \`node scripts/verify_naver_real_estate_dashboard_p1.js\`: pending
- \`git diff --check\`: pending

## 17. Remaining Risks

- The Top100 page intentionally shows fewer than 100 rows if Magok-dong has fewer eligible rows for the selected range/band.
- This fix does not alter other real-estate landing pages, calculators, canonical URLs, hreflang, sitemap, robots, or redirects.
`;
  fs.writeFileSync(REPORT, report);
}

async function verify() {
  const evidence = JSON.parse(read(EVIDENCE));
  const current = read(TARGET);
  const original = evidence.baseline.targetSource;
  assert.ok(original.includes(beforeCondition) && original.includes(beforeParams));
  assert.equal(current.replace(/\r\n/g, "\n"), original.replace(/\r\n/g, "\n").replace(beforeCondition, afterCondition).replace(beforeParams, afterParams), "Only the two scope lines may change, including all title/H1/FAQ/CTA text");
  const changed = Object.entries(evidence.baseline.protectedHashes).filter(([p, digest]) => hash(p) !== digest).map(([p]) => p);
  assert.deepEqual(changed, [], "Protected pages, shared helpers, calculators, SEO, or crawler files changed");
  const ddl = read("server/crawler/scripts/re_build_apt_stats.js");
  assert.match(ddl, /CREATE TABLE IF NOT EXISTS re_trade_apt_stats_m/);
  assert.match(ddl, /dong_name VARCHAR\(60\) NOT NULL/);
  assert.ok(ddl.includes("CONCAT(lawd_cd,'|',gu_name,'|',dong_name,'|',apt_name) AS apt_key"));

  // SQLite runs the real SELECT in memory; it does not certify live MySQL schema or data completeness.
  const { DatabaseSync } = require("node:sqlite");
  const db = new DatabaseSync(":memory:");
  try {
    db.exec("CREATE TABLE re_trade_deal_ym (deal_ym TEXT)");
    const props = evidence.publicFixture.props;
    db.prepare("INSERT INTO re_trade_deal_ym VALUES (?)").run(props.period);
    const columns = ["deal_ym", "pyeong_band", "lawd_cd", "dong_name", "apt_key", "sigungu_name", "apt_name", "tx_count", "median_price", "avg_price", "max_price", "sum_price", "latest_deal_date", "latest_deal_amount_man", "latest_area_m2", "build_year"];
    for (const name of columns) assert.ok(ddl.includes(name), `Unverified fixture column: ${name}`);
    const textColumns = new Set(columns.slice(0, 7).concat("latest_deal_date"));
    db.exec(`CREATE TABLE re_trade_apt_stats_m (${columns.map((c) => `${c} ${textColumns.has(c) ? "TEXT" : "REAL"}`).join(", ")})`);
    const insert = db.prepare(`INSERT INTO re_trade_apt_stats_m (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`);
    function seed(row, changes = {}) {
      const [lawd, , dong] = row.apt_key.split("|");
      const record = { ...row, deal_ym: props.period, pyeong_band: "all", lawd_cd: lawd, dong_name: dong, ...changes };
      insert.run(...columns.map((c) => record[c] ?? null));
    }
    props.rows.forEach((r) => seed(r));
    const calls = [];
    const pool = { query: async (sql, params = []) => {
      assert.match(sql, /^\s*SELECT\b/i, "Only read-only application queries are allowed");
      calls.push({ sql, params });
      return [db.prepare(sql).all(...params)];
    } };
    const helper = await compile(read("lib/reTop100Landing.js"));
    const imports = {
      "../../../lib/reTop100Landing": helper,
      "../../../lib/jsonSafe": await compile(read("lib/jsonSafe.js")),
      "../../../lib/db": { pool },
      "../../../_components/RealEstateTop100Landing": { default: () => null },
    };
    const oldPage = await compilePage(original, imports);
    const page = await compilePage(current, imports);
    async function run(mod, query = {}, locale = "ko") {
      const result = await mod.getServerSideProps({ query: { nocache: "1", ...query }, locale, res: { setHeader() {} } });
      return JSON.parse(JSON.stringify(result.props));
    }
    const before = await run(oldPage);
    const after = await run(page);
    assert.equal(before.rows.length, props.rows.length);
    const expectedKeys = props.rows.filter((r) => r.apt_key.split("|")[0] === "11500" && r.apt_key.split("|")[2] === MAGOK).map((r) => r.apt_key).sort();
    function assertScope(rows) {
      assert.ok(rows.length <= 100);
      assert.ok(rows.every((r) => r.apt_key.split("|")[0] === "11500" && r.apt_key.split("|")[2] === MAGOK));
      for (let i = 1; i < rows.length; i++) assert.ok(rows[i - 1].median_price >= rows[i].median_price, "Ranking order changed");
    }
    assert.ok(after.rows.length > 0 && after.rows.length < 100);
    assertScope(after.rows);
    assert.deepEqual(after.rows.map((r) => r.apt_key).sort(), expectedKeys);
    assert.deepEqual(distribution(after.rows), { [MAGOK]: after.rows.length });
    const queryCall = calls.at(-1);
    assert.match(queryCall.sql, /s\.lawd_cd = \? AND s\.dong_name = \?/);
    assert.match(queryCall.sql, /s1\.lawd_cd = \? AND s1\.dong_name = \?/);
    assert.deepEqual(Array.from(queryCall.params), [props.period, props.period, "all", "11500", MAGOK, props.period, props.period, "all", "11500", MAGOK, "all", 100]);
    assert.ok(!queryCall.sql.includes(MAGOK), "Dong value must be bound, not interpolated");
    assert.equal(JSON.stringify(page.default(after).props.text), JSON.stringify(oldPage.default(before).props.text));
    const en = await run(page, {}, "en");
    assert.deepEqual(en.rows.map((r) => r.apt_key), after.rows.map((r) => r.apt_key));

    // Synthetic bands/months test scope propagation; these are not market observations.
    for (const band of ["10", "20", "30", "40", "50"]) props.rows.forEach((r) => seed(r, { pyeong_band: band }));
    const ranges = ["pm", "m3", "m6", "y1", "ytd"];
    const matrix = [];
    for (const range of ranges) for (const band of ["all", "10", "20", "30", "40", "50"]) {
      const result = await run(page, { range, band });
      assert.equal(result.rows.length, after.rows.length);
      assertScope(result.rows);
      matrix.push({ range, band, rows: result.rows.length, nonMagok: 0 });
    }
    const olderMonth = helper.ymAdd(props.period, -1);
    const sample = props.rows.find((r) => r.apt_key === expectedKeys[0]);
    seed(sample, { deal_ym: olderMonth, tx_count: 2, latest_deal_date: `${olderMonth.slice(0, 4)}-${olderMonth.slice(4)}-01` });
    const multiMonth = await run(page, { range: "m3" });
    const merged = multiMonth.rows.find((r) => r.apt_key === sample.apt_key);
    assert.equal(merged.tx_count, Number(sample.tx_count) + 2);
    assert.equal(merged.latest_deal_date, sample.latest_deal_date);
    assertScope(multiMonth.rows);

    for (let i = 0; i < 110; i++) seed(sample, { apt_key: `11500||화곡동|scope-test-${i}`, dong_name: "화곡동", apt_name: `scope-test-${i}`, median_price: 99999999999 });
    const belowDistrictLimit = "11500||마곡동|scope-test-low-price";
    seed(sample, { apt_key: belowDistrictLimit, apt_name: "scope-test-low-price", median_price: 1 });
    const limited = await run(page);
    assertScope(limited.rows);
    assert.ok(limited.rows.some((r) => r.apt_key === belowDistrictLimit), "Dong filter must precede LIMIT, not filter a district Top100 result afterward");
    db.prepare("DELETE FROM re_trade_apt_stats_m WHERE dong_name = ?").run(MAGOK);
    const empty = await run(page);
    assert.equal(empty.rows.length, 0, "Must not fill an empty Magok ranking with other dongs");

    evidence.verification = {
      checkedAt: new Date().toISOString(), result: "PASS_MAGOK_SCOPE_FIXED",
      mode: "Actual page getServerSideProps and shared query helper transpiled by Next SWC; real SQL executed on in-memory SQLite public/synthetic fixtures. Live MySQL not tested.",
      protectedFiles: Object.keys(evidence.baseline.protectedHashes).length, changedProtected: changed,
      sourceDelta: "Only regionWhereSql and regionParams changed",
      publicSampleBefore: distribution(before.rows), publicSampleAfter: distribution(after.rows),
      afterRows: after.rows.length, returnedDongDistinct: 1, nonMagokRows: 0,
      sampleNote: "11 rows is the filtered public sample count, not a prediction of the complete post-deployment query result.",
      sql: queryCall.sql, params: Array.from(queryCall.params), matrix,
      englishScope: "PASS", multiMonthLatestJoin: "PASS", filterBeforeLimit: "PASS", emptyScope: "PASS",
    };
    save(evidence);
    console.log(JSON.stringify({ result: evidence.verification.result, before: distribution(before.rows), after: distribution(after.rows), rangeBandCases: matrix.length, protectedFiles: evidence.verification.protectedFiles, changedProtected: changed, englishScope: "PASS", multiMonthLatestJoin: "PASS", filterBeforeLimit: "PASS", emptyScope: "PASS", database: evidence.databaseValidation.status }, null, 2));
    return evidence;
  } finally { db.close(); }
}

async function main() {
  if (process.argv.includes("--capture-baseline")) {
    capture();
    return;
  }
  let evidence = await verify();
  if (!process.argv.includes("--fixture-only")) {
    evidence = await verifyLiveDb(evidence);
    writeReport(evidence);
    console.log(JSON.stringify({
      result: evidence.finalVerdict,
      liveDb: evidence.databaseValidation.status,
      latestYm: evidence.databaseValidation.latestYm,
      returnedRows: evidence.databaseValidation.pageVerification?.rows,
      returnedDongDistribution: evidence.databaseValidation.pageVerification?.distribution,
      report: path.relative(ROOT, REPORT),
    }, null, 2));
  }
}

Promise.resolve().then(main).catch((error) => {
  try {
    if (fs.existsSync(EVIDENCE)) writeReport(JSON.parse(fs.readFileSync(EVIDENCE, "utf8")));
  } catch {}
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
