const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const TARGET = "pages/market/real-estate/magok-top100.js";
const EVIDENCE = path.join(ROOT, "reports/magok-top100-scope-evidence-2026-09-15.json");
const PUBLIC_PROPS = path.join(ROOT, ".next/real-estate-p1-public-props.json");
const PRIOR_AUDIT = path.join(ROOT, "reports/naver-real-estate-dashboard-p1-evidence-2026-09-15.json");
const MAGOK = "마곡동";
const beforeCondition = 'regionWhereSql: "s.lawd_cd  = ?",';
const afterCondition = 'regionWhereSql: "s.lawd_cd = ? AND s.dong_name = ?",';
const beforeParams = "regionParams: [REGION.lawd],";
const afterParams = "regionParams: [REGION.lawd, REGION.dongName],";
const read = (p) => fs.readFileSync(path.resolve(ROOT, p), "utf8");
const hash = (p) => crypto.createHash("sha256").update(fs.readFileSync(path.resolve(ROOT, p))).digest("hex");
const save = (data) => fs.writeFileSync(EVIDENCE, `${JSON.stringify(data, null, 2)}\n`);

function distribution(rows) {
  return rows.reduce((counts, row) => {
    const dong = row.apt_key.split("|")[2];
    counts[dong] = (counts[dong] || 0) + 1;
    return counts;
  }, {});
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
    const oldPage = await compile(original, imports);
    const page = await compile(current, imports);
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
  } finally { db.close(); }
}

Promise.resolve().then(() => process.argv.includes("--capture-baseline") ? capture() : verify()).catch((error) => { console.error(error.message); process.exitCode = 1; });
