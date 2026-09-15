// Capture once before edits; production saves public props; render checks the build without DB access.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const cheerio = require("cheerio");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://www.finmaphub.com";
const HUB = "/market/real-estate";
const EVIDENCE = path.join(ROOT, "reports/naver-real-estate-dashboard-p1-evidence-2026-09-15.json");
const FIXTURES = path.join(ROOT, ".next/real-estate-p1-public-props.json");
const TOP = ["seoul", "gangnam", "gangnam3", "magok", "mayongseong", "songpa", "songpa-gangnam"];
const GUIDES = ["seoul", "gyeonggi", "incheon"];
const ROUTES = [HUB, ...TOP.map((x) => `${HUB}/${x}-top100`), ...GUIDES.map((x) => `${HUB}/${x}-apartment-top100`)];
const OPERATIONS_COPY = /구글 검색 유입|검색어를 공략|\bSEO\b|고정 URL|검색 의도|검색 랜딩|(?:네이버|구글).*유입용|키워드 페이지|실거래 랜딩|랜딩페이지|fixed[- ]URL|search intent|keyword-focused|Google search|data pipeline/gi;
const args = process.argv.slice(2);
const option = (key, fallback) => args.find((a) => a.startsWith(`--${key}=`))?.slice(key.length + 3) || fallback;
const normalize = (s) => String(s || "").replace(/\s+/g, " ").trim();
const hash = (p) => fs.existsSync(path.join(ROOT, p)) ? crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, p))).digest("hex") : null;
const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
const save = (data) => fs.writeFileSync(EVIDENCE, `${JSON.stringify(data, null, 2)}\n`);

function protectedPaths() {
  return git("ls-files").split(/\r?\n/).filter((p) =>
    p.startsWith("pages/tools/") ||
    /^_components\/(DsrLtv|MortgageLoan|Compound|Dca|Cagr|ToolResultCta|SeoHead|ToolSeo|Header|Footer)/.test(p) ||
    /^lib\/compound/i.test(p) ||
    /^pages\/_app\.|^pages\/_document\.|^next\.config\.|^next-sitemap\.config\./.test(p) ||
    /^public\/(?:.*\/)?(?:sitemap[^/]*\.xml|robots\.txt)$/.test(p)
  ).sort();
}

function inspect(html, route, status = 200, headers = {}) {
  const $ = cheerio.load(html);
  const props = JSON.parse($("#__NEXT_DATA__").text() || "{}").props?.pageProps || {};
  const schemas = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const visit = (x) => {
        if (Array.isArray(x)) return x.forEach(visit);
        if (x?.["@type"]) schemas.push(x["@type"]);
        if (x?.["@graph"]) visit(x["@graph"]);
      };
      visit(JSON.parse($(el).text()));
    } catch { schemas.push("INVALID_JSON"); }
  });
  const result = {
    route, status,
    title: normalize($("title").text()),
    description: $('meta[name="description"]').attr("content") || "",
    ogTitle: $('meta[property="og:title"]').attr("content") || "",
    ogDescription: $('meta[property="og:description"]').attr("content") || "",
    canonical: $('link[rel="canonical"]').map((_, el) => $(el).attr("href")).get(),
    robots: [$('meta[name="robots"]').attr("content") || "", headers["x-robots-tag"] || ""],
    hreflang: $('link[hreflang]').map((_, el) => ({ lang: $(el).attr("hreflang"), href: $(el).attr("href") })).get(),
    h1: $("h1").map((_, el) => normalize($(el).text())).get(),
    headings: $("h2,h3").map((_, el) => normalize($(el).text())).get(),
    schemas, htmlBytes: Buffer.byteLength(html),
    dataPeriod: props.period || null, fromYm: props.fromYm || null, toYm: props.toYm || null,
  };
  $("script,style,noscript,template,header,footer,nav,[hidden],[aria-hidden='true']").remove();
  const body = $("main").length ? $("main") : $("body");
  const visible = normalize(body.text());
  result.visibleChars = visible.length;
  result.first500 = visible.slice(0, 500);
  result.operationsCopy = [...new Set(visible.match(OPERATIONS_COPY) || [])];
  result.links = body.find("a[href]").map((_, el) => {
    const u = new URL($(el).attr("href"), SITE);
    const localPath = u.pathname.replace(/^\/en(?=\/)/, "");
    return u.origin === SITE && (localPath.startsWith(HUB) || localPath.startsWith("/tools/"))
      ? { href: u.pathname + u.search, anchor: normalize($(el).text()) } : null;
  }).get().filter((x) => !x.href.includes("/apt/"));
  result.aptLinks = body.find('a[href*="/market/real-estate/apt/"]').length;
  const rows = Array.isArray(props.rows) ? props.rows : [];
  result.dataRows = rows.length;
  result.rowLocations = [...new Set(rows.map((r) => String(r.apt_key).split("|")[2]))];
  result.rowSample = rows.slice(0, 3).map((r) => ({ name: r.apt_name, priceWon: r.median_price, transactions: r.tx_count, latestDeal: r.latest_deal_date }));
  result.rowsVisible = rows.length > 0 && rows.every((r) =>
    visible.includes(String(r.apt_name)) &&
    visible.includes((Number(r.median_price) / 100000000).toFixed(3)) &&
    visible.includes(String(r.tx_count))
  ) && result.aptLinks >= rows.length;
  result.dataDateVisible = /^\d{6}$/.test(String(props.period)) && visible.includes(`${String(props.period).slice(0, 4)}-${String(props.period).slice(4)}`);
  result.dashboardRole = route.endsWith(HUB) && (/지역과 기간.*탐색|Explore.*compare/i.test(visible));
  return result;
}

async function renderPublicProps(route, props) {
  // Render the built page with public response props; this does not test the DB query.
  const { IncomingMessage, ServerResponse } = require("http");
  const { Socket } = require("net");
  const pathname = route.replace(/^\/en(?=\/)/, "");
  const mod = require(path.join(ROOT, `.next/server/pages${pathname}.js`));
  const req = new IncomingMessage(new Socket());
  req.url = route;
  req.method = "GET";
  const res = new ServerResponse(req);
  const result = await mod.routeModule.render(req, res, {
    page: pathname, query: {},
    sharedContext: { buildId: fs.readFileSync(path.join(ROOT, ".next/BUILD_ID"), "utf8").trim() },
    renderContext: { isFallback: false },
    renderOpts: {
      Component: mod.default, ComponentMod: mod, page: pathname,
      getServerSideProps: async () => ({ props }),
      buildManifest: require(path.join(ROOT, ".next/build-manifest.json")),
      reactLoadableManifest: require(path.join(ROOT, ".next/react-loadable-manifest.json")),
      images: require("next/dist/shared/lib/image-config").imageConfigDefault,
      supportsDynamicResponse: false, basePath: "", assetPrefix: "", experimental: {},
      locale: route.startsWith("/en/") ? "en" : "ko", locales: ["ko", "en"], defaultLocale: "ko",
      distDir: path.join(ROOT, ".next"), resolvedUrl: route, resolvedAsPath: route,
    },
  });
  const html = await result.toUnchunkedString(true);
  const file = path.join(ROOT, `.next/real-estate-p1-rendered${route}.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  return html;
}

function filesUnder(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? filesUnder(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

function anchorInventory(pages) {
  const counts = {};
  const add = (source, href, anchor, placement) => {
    const u = new URL(href, SITE);
    if (u.origin !== SITE || !ROUTES.includes(u.pathname)) return;
    const label = normalize(anchor);
    if (!label) return;
    const key = JSON.stringify([u.pathname, label, placement]);
    const item = counts[key] ||= { target: u.pathname, anchor: label, placement, count: 0, sourcePages: [] };
    item.count++;
    if (!item.sourcePages.includes(source)) item.sourcePages.push(source);
  };
  const staticRoot = path.join(ROOT, ".next/server/pages/ko");
  let staticPages = 0;
  for (const file of filesUnder(staticRoot).filter((p) => p.endsWith(".html"))) {
    const source = `/${path.relative(staticRoot, file).replace(/\\/g, "/").replace(/\.html$/, "").replace(/^index$/, "")}`;
    const $ = cheerio.load(fs.readFileSync(file, "utf8"));
    staticPages++;
    $("a[href]").each((_, el) => add(source, $(el).attr("href"), $(el).text(), $(el).closest("header,footer,nav").length ? "navigation" : "body"));
  }
  for (const p of pages.filter((p) => !p.route.startsWith("/en/") && p.dataRows > 0)) {
    for (const a of p.links) add(p.route, a.href, a.anchor, "body");
  }
  return { method: "One built KO HTML per route plus fetched KO SSR Top100 body anchors; query variants collapsed by target pathname; excludes EN and unrendered dynamic routes.", staticPages, distribution: Object.values(counts).sort((a, b) => a.target.localeCompare(b.target) || b.count - a.count) };
}

async function browserAudit(evidence) {
  const http = require("http");
  const puppeteer = require("puppeteer-core");
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
    let file;
    if (pathname.startsWith("/_next/static/")) file = path.join(ROOT, ".next", pathname.slice(7));
    else if (ROUTES.includes(pathname)) {
      file = path.join(ROOT, `.next/real-estate-p1-rendered${pathname}.html`);
      if (!fs.existsSync(file)) file = path.join(ROOT, `.next/server/pages/ko${pathname}.html`);
    }
    if (!file) {
      const asset = pathname === "/_next/image" ? new URL(req.url, "http://localhost").searchParams.get("url") : pathname;
      if (asset?.startsWith("/")) {
        const publicRoot = path.join(ROOT, "public");
        const candidate = path.resolve(publicRoot, `.${asset}`);
        if (candidate.startsWith(`${publicRoot}${path.sep}`) && /\.(png|jpg|jpeg|webp|svg|ico)$/.test(candidate)) file = candidate;
      }
    }
    if (!file || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    const types = { ".css": "text/css", ".html": "text/html; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
    res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
    res.end(fs.readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  let browser;
  const observations = [];
  try {
    browser = await puppeteer.launch({ executablePath: option("browser-exe", "C:/Program Files/Google/Chrome/Application/chrome.exe"), headless: true });
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage();
      await page.setViewport(viewport);
      await page.setJavaScriptEnabled(false);
      for (const route of [HUB, `${HUB}/seoul-top100`, `${HUB}/seoul-apartment-top100`]) {
        await page.goto(`http://127.0.0.1:${server.address().port}${route}`, { waitUntil: "networkidle0", timeout: 20000 });
        const geometry = await page.evaluate(() => {
          const rect = (el) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
          };
          const cssLoaded = [...document.styleSheets].some((s) => { try { return s.href?.includes("/_next/static/css/") && s.cssRules.length > 0; } catch { return false; } });
          return { cssLoaded, viewportWidth: innerWidth, scrollWidth: document.documentElement.scrollWidth, h1: rect(document.querySelector("h1")), firstFilter: rect(document.querySelector("main select")), firstApartment: rect(document.querySelector('main a[href*="/apt/"]')) };
        });
        const screenshot = `reports/naver-real-estate-p1-2026-09-15-screenshots/${viewport.width}-${route.split("/").pop()}.png`;
        fs.mkdirSync(path.dirname(path.join(ROOT, screenshot)), { recursive: true });
        await page.screenshot({ path: path.join(ROOT, screenshot) });
        observations.push({ route, viewport, ...geometry, screenshot });
      }
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
  evidence.browser = { checkedAt: new Date().toISOString(), mode: "JavaScript disabled; actual build CSS and static/rendered HTML; SSR pages use public props, not local DB", observations };
  save(evidence);
  console.log(JSON.stringify(evidence.browser, null, 2));
  if (observations.some((x) => !x.cssLoaded || x.scrollWidth > x.viewportWidth)) process.exitCode = 1;
}

async function main() {
  if (args.includes("--capture-baseline")) {
    if (fs.existsSync(EVIDENCE)) throw new Error("Baseline already exists; refusing to replace the task starting point.");
    const files = protectedPaths();
    save({ baseline: { capturedAt: new Date().toISOString(), head: git("rev-parse", "HEAD"), dirty: git("status", "--short"), hashes: Object.fromEntries(files.map((p) => [p, hash(p)])) } });
    console.log(`Captured baseline: ${files.length} protected files (including existing worktree changes).`);
    return;
  }
  if (!fs.existsSync(EVIDENCE)) throw new Error("Capture a baseline before editing: --capture-baseline");
  const evidence = JSON.parse(fs.readFileSync(EVIDENCE, "utf8"));
  if (args.includes("--browser")) { await browserAudit(evidence); return; }
  const phase = option("phase", "render");
  if (!["local", "production", "render"].includes(phase)) throw new Error("phase must be local, production, or render");
  const base = option("base-url", phase === "production" ? SITE : "http://127.0.0.1:8013");
  const fixtures = fs.existsSync(FIXTURES) ? JSON.parse(fs.readFileSync(FIXTURES, "utf8")) : {};
  const routes = [...ROUTES, ...[HUB, ...TOP.map((x) => `${HUB}/${x}-top100`)].map((r) => `/en${r}`)];
  const pages = [];
  const failures = [];
  for (const route of routes) {
    try {
      const isTop = TOP.some((x) => route.endsWith(`/${x}-top100`));
      let html, status, headers = {};
      if (phase === "render") {
        if (isTop) {
          if (!fixtures[route]) throw new Error("Missing public props; run production phase first.");
          html = await renderPublicProps(route, fixtures[route]);
        } else {
          const locale = route.startsWith("/en/") ? "en" : "ko";
          html = fs.readFileSync(path.join(ROOT, `.next/server/pages/${locale}${route.replace(/^\/en(?=\/)/, "")}.html`), "utf8");
        }
        status = null;
      } else {
        const res = await fetch(`${base}${route}`, { signal: AbortSignal.timeout(20000), redirect: "manual" });
        html = await res.text();
        status = res.status;
        headers = Object.fromEntries(res.headers);
      }
      if (phase === "production" && status === 200 && isTop) fixtures[route] = JSON.parse(cheerio.load(html)("#__NEXT_DATA__").text()).props.pageProps;
      const page = inspect(html, route, status, headers);
      page.renderMode = phase === "render" ? (isTop ? "built component with public props; DB bypassed" : "built static HTML") : "live HTTP";
      pages.push(page);
      const checks = {
        ...(phase === "render" ? { renderOk: !!html } : { http200: page.status === 200 }),
        h1One: page.h1.length === 1,
        selfCanonical: page.canonical.length === 1 && page.canonical[0] === SITE + route,
        indexable: !page.robots.some((x) => /noindex|none/i.test(x)),
        metadata: !!page.title && !!page.description && !!page.ogTitle && !!page.ogDescription,
        mainText: page.visibleChars > 300,
        validSchema: !page.schemas.includes("INVALID_JSON"),
      };
      if (isTop) Object.assign(checks, { ssrData: page.rowsVisible, dataDate: page.dataDateVisible, dashboardCta: page.links.some((a) => a.href.split("?")[0].replace(/^\/en(?=\/)/, "") === HUB) });
      if (phase !== "production") {
        checks.visibleCopy = page.operationsCopy.length === 0;
        if (route.endsWith(HUB)) checks.dashboardRole = page.dashboardRole;
        const before = evidence.production?.pages.find((p) => p.route === route);
        const calculatorAnchors = (p) => p.links.filter((a) => /^\/(en\/)?tools\//.test(a.href));
        if (before?.links) checks.calculatorLinksUnchanged = JSON.stringify(calculatorAnchors(before)) === JSON.stringify(calculatorAnchors(page));
      }
      page.checks = checks;
      const bad = Object.entries(checks).filter(([, pass]) => !pass).map(([name]) => name);
      if (bad.length) failures.push(`${route}: ${bad.join(", ")}`);
      console.log(`${bad.length ? "FAIL" : "PASS"} ${route}: ${phase === "render" ? "rendered" : `HTTP ${page.status}`}, H1 ${page.h1.length}, data rows ${page.dataRows}, visible ${page.visibleChars}`);
    } catch (error) {
      const reason = `${error.name}${error.cause?.code ? ` (${error.cause.code})` : ""}`;
      failures.push(`${route}: ${reason}`);
      pages.push({ route, error: reason });
      console.log(`FAIL ${route}: ${reason}`);
    }
  }
  const titles = pages.map((p) => p.title).filter(Boolean);
  if (new Set(titles).size !== titles.length) failures.push("Duplicate titles in audited routes");
  const changedProtected = Object.entries(evidence.baseline.hashes).filter(([p, value]) => hash(p) !== value).map(([p]) => p);
  if (changedProtected.length) failures.push(`Protected changes after baseline: ${changedProtected.join(", ")}`);
  const sitemapText = filesUnder(path.join(ROOT, "public")).filter((p) => /sitemap.*\.xml$/.test(p)).map((p) => fs.readFileSync(p, "utf8")).join("\n");
  const missingSitemap = routes.filter((r) => !sitemapText.includes(`<loc>${SITE}${r}</loc>`));
  if (missingSitemap.length) failures.push(`Missing sitemap URLs: ${missingSitemap.join(", ")}`);
  evidence[phase] = { checkedAt: new Date().toISOString(), base, pages, changedProtected, missingSitemap, failures };
  if (phase === "production") fs.writeFileSync(FIXTURES, JSON.stringify(fixtures));
  if (phase === "local" || phase === "render") evidence.anchors = anchorInventory(pages);
  save(evidence);
  console.log(JSON.stringify({ phase, routes: pages.length, protectedFiles: Object.keys(evidence.baseline.hashes).length, changedProtected, missingSitemap, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
