// scripts/check_page_links.js
// Usage:
// node scripts/check_page_links.js "https://www.finmaphub.com/en/posts/economicInfo/fx-basics" --base=https://www.finmaphub.com --lang=en
//
// Output:
// - broken: 4xx/5xx
// - redirects: 301/302 with final URL
// - suspicious: /en/.../ko/... , ?lang= , cross-lang, etc

const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

function argValue(name, fallback = null) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
}

function isInternal(u, baseOrigin) {
  try {
    return new URL(u).origin === baseOrigin;
  } catch {
    return false;
  }
}

function normalizeUrl(u) {
  // Keep query (sometimes intentional), but remove trailing "#" only.
  return u.replace(/#$/, "");
}

async function fetchHtml(pageUrl) {
  const res = await axios.get(pageUrl, {
    timeout: 15000,
    headers: { "User-Agent": "FinMapLinkChecker/1.0" },
    validateStatus: () => true,
  });
  if (res.status < 200 || res.status >= 400) {
    throw new Error(`Failed to fetch page: ${res.status} ${pageUrl}`);
  }
  return res.data;
}

function extractLinks(html, pageUrl, baseOrigin) {
  const $ = cheerio.load(html);
  const links = new Set();

  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") || "").trim();
    if (!href) return;
    if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;

    // Resolve relative -> absolute
    const abs = new URL(href, pageUrl).toString();
    // Only track internal links (same origin)
    if (isInternal(abs, baseOrigin)) links.add(normalizeUrl(abs));
  });

  return [...links];
}

async function headThenGet(url) {
  // Some servers block HEAD; fallback to GET
  const common = {
    timeout: 15000,
    maxRedirects: 0, // we want to see redirect status & location
    headers: { "User-Agent": "FinMapLinkChecker/1.0" },
    validateStatus: () => true,
  };

  let res = await axios.head(url, common);
  if (res.status === 405 || res.status === 403) {
    res = await axios.get(url, common);
  }
  return res;
}

async function checkOne(url) {
  const res = await headThenGet(url);
  const status = res.status;
  const location = res.headers?.location;
  return { url, status, location };
}

function suspiciousFlags(u, expectedLang) {
  const flags = [];
  const path = new URL(u).pathname;

  if (path.includes("/en/posts/") && path.includes("/ko/")) flags.push("BAD_PATH:/en/.../ko/ mixed");
  if (path.includes("/posts/") && path.includes("/en/")) flags.push("BAD_PATH:/posts/.../en/ mixed");

  const qs = new URL(u).searchParams;
  if ([...qs.keys()].includes("lang")) flags.push("QUERY:?lang= present");

  if (expectedLang) {
    const isEn = path.startsWith("/en/");
    const shouldBeEn = expectedLang === "en";
    if (shouldBeEn && !isEn) flags.push("CROSS_LANG: expected /en/ link");
    if (!shouldBeEn && isEn) flags.push("CROSS_LANG: expected non-/en/ link");
  }

  return flags;
}

(async () => {
  const pageUrl = process.argv[2];
  if (!pageUrl) {
    console.error("Usage: node scripts/check_page_links.js <pageUrl> --base=https://www.finmaphub.com --lang=en|ko");
    process.exit(1);
  }

  const base = argValue("base", new URL(pageUrl).origin);
  const expectedLang = argValue("lang", null); // "en" or "ko"
  const baseOrigin = new URL(base).origin;

  console.log(`\n[1] Fetch page: ${pageUrl}`);
  console.log(`[2] Base origin: ${baseOrigin}`);
  if (expectedLang) console.log(`[3] Expected lang: ${expectedLang}`);

  const html = await fetchHtml(pageUrl);
  const links = extractLinks(html, pageUrl, baseOrigin);

  console.log(`\nFound internal links: ${links.length}\n`);

  // Concurrency (simple)
  const concurrency = Number(argValue("concurrency", "10"));
  const queue = [...links];

  const results = [];
  async function worker() {
    while (queue.length) {
      const u = queue.shift();
      const r = await checkOne(u).catch((e) => ({ url: u, status: 0, location: null, error: e.message }));
      results.push(r);
      process.stdout.write(".");
    }
  }

  const workers = Array.from({ length: Math.max(1, concurrency) }, worker);
  await Promise.all(workers);
  process.stdout.write("\n");

  const broken = [];
  const redirects = [];
  const ok = [];
  const suspicious = [];

  for (const r of results) {
    const flags = suspiciousFlags(r.url, expectedLang);
    if (flags.length) suspicious.push({ ...r, flags });

    if (r.status >= 300 && r.status < 400) redirects.push(r);
    else if (r.status >= 200 && r.status < 300) ok.push(r);
    else broken.push(r);
  }

  const printList = (title, arr, mapper) => {
    console.log(`\n=== ${title} (${arr.length}) ===`);
    for (const x of arr.sort((a, b) => (a.status || 0) - (b.status || 0))) {
      console.log(mapper(x));
    }
  };

  printList("BROKEN (need fix)", broken, (r) => `- [${r.status}] ${r.url}${r.error ? `  (${r.error})` : ""}`);
  printList("REDIRECTS (check canonical/links)", redirects, (r) => `- [${r.status}] ${r.url}  ->  ${r.location || "(no location header)"}`);
  printList("SUSPICIOUS (lang/path/query)", suspicious, (r) => `- [${r.status}] ${r.url}  | ${r.flags.join(", ")}`);

  console.log(`\nOK: ${ok.length} | Redirect: ${redirects.length} | Broken: ${broken.length} | Suspicious: ${suspicious.length}\n`);
})();