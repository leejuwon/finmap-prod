// scripts/check_posts_links_local.js
// Local link checker for content/posts markdown files.
// Validates internal links against blog-contents.md registry (published routes).
//
// Usage:
// node scripts/check_posts_links_local.js --registry=blog-contents.md --dir=content/posts --ext=md,mdx --out=reports/posts.linkcheck.json
//
// Optional:
// --domain=https://www.finmaphub.com  (treat absolute URLs on this domain as internal)
// --only_published=true              (default true) only check posts whose self URL exists in registry

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const { URL } = require("url");

// ✅ Tool routes are real pages but usually not listed in blog-contents.md (post registry)
// Add new tools here if you create them.
const KNOWN_TOOL_SLUGS = new Set([
  "compound-interest",
  "dca-calculator",
  "cagr-calculator",
  "goal-simulator",
  "fire-calculator",
  "dsr-ltv-calculator",
  "home-buying-budget-calculator",
]);


function arg(name, fallback) {
  const hit = process.argv.find((x) => x.indexOf(`--${name}=`) === 0);
  return hit ? hit.split("=").slice(1).join("=") : fallback;
}

function ensureAbs(p) {
  return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

function readText(p) {
  return fs.readFileSync(p, "utf8");
}

function normalizePath(p) {
  if (!p) return p;
   // strip hash/query for existence checks
  const base = String(p).split("#")[0].split("?")[0];
  let out = base.replace(/\/{2,}/g, "/");
  if (out.length > 1 && out.endsWith("/")) out = out.slice(0, -1);
  return out;
}

function isToolRoute(norm) {
  return norm === "/tools" || norm === "/en/tools" || /^\/(en\/)?tools\/[^\/]+$/.test(norm);
}
function toolSlug(norm) {
  const m = norm.match(/^\/(en\/)?tools\/([^\/]+)$/);
  return m ? m[2] : null;
}
function isMarketRoute(norm) {
  return norm === "/market" || norm === "/en/market" || norm.startsWith("/market/") || norm.startsWith("/en/market/");
}


function parseRegistryUrls(registryMd) {
  // blog-contents.md expected to have lines like: url: /posts/...
  const set = new Set();
  const re = /^\s*url:\s*(\/\S+)\s*$/gim;
  let m;
  while ((m = re.exec(registryMd)) !== null) {
    set.add(normalizePath(m[1]));
  }

  // allow some static routes
  [
    "/", "/en",
    "/tools", "/en/tools",
    "/market", "/en/market",
    "/terms", "/en/terms",
    "/privacy", "/en/privacy",
    "/disclaimer", "/en/disclaimer",
    "/contact", "/en/contact",
    "/about", "/en/about",
    "/robots.txt",
    "/sitemap-pages", "/en/sitemap-pages",
  ].forEach((r) => set.add(normalizePath(r)));

  return set;
}

function extractLinksFromMarkdown(md) {
  const links = [];

  // HTML anchors
  const aRe = /<a\s+[^>]*href=["']([^"']+)["']/gi;
  let m;
  while ((m = aRe.exec(md)) !== null) links.push((m[1] || "").trim());

  // Markdown links (ignore images)
  const mdRe = /\[[^\]]+\]\(([^)]+)\)/g;
  while ((m = mdRe.exec(md)) !== null) {
    const idx = m.index;
    const prev = idx > 0 ? md[idx - 1] : "";
    if (prev === "!") continue; // image
    links.push((m[1] || "").trim());
  }

  return links.filter(Boolean);
}

function toInternalPath(raw, domain) {
  if (!raw) return null;
  // Fix patterns like "\/posts\/..." that appear in some markdown
  const href = raw.trim().replace(/\\\//g, "/");

  if (
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:")
  ) return null;

  // absolute internal URL -> path
  if (domain && (href.startsWith(domain) || href.startsWith(domain.replace(/^https:/, "http:")))) {
    try {
      const u = new URL(href);
      // keep query for flags (we'll normalize later for existence)
      return (u.pathname || "/") + (u.search || "") + (u.hash || "");
    } catch {
      return null;
    }
  }

  // keep query for flags (we'll normalize later for existence)
  if (href.startsWith("/")) return href;

  // relative link
  if (!href.startsWith("http://") && !href.startsWith("https://")) {
    return { relative: true, value: href };
  }

  return null; // external
}

function parseFrontmatterBasics(md) {
  // Minimal YAML frontmatter parsing (lang, postCategory, slug)
  if (!md.startsWith("---")) return null;
  const end = md.indexOf("\n---", 3);
  if (end === -1) return null;

  const fm = md.slice(3, end).trim();
  const pick = (key) => {
    const re = new RegExp(`^\\s*${key}:\\s*["']?([^"'\n]+)["']?\\s*$`, "mi");
    const m = re.exec(fm);
    return m ? m[1].trim() : null;
  };

  return { lang: pick("lang"), postCategory: pick("postCategory"), slug: pick("slug") };
}

function expectedUrlFromFrontmatter(meta) {
  if (!meta || !meta.lang || !meta.postCategory || !meta.slug) return null;
  const base = meta.lang === "en" ? "/en/posts" : "/posts";
  return normalizePath(`${base}/${meta.postCategory}/${meta.slug}`);
}

function flagsForPath(fullPath, normalized, expectedLang) {
  const flags = [];
  
  // query duplication signals
  if (/\blang=/.test(String(fullPath))) flags.push("QUERY:?lang= present");

  // Only flag if the *route root* is wrong
  // (Avoid false positives where "/en/posts/..." contains "/posts/" as a substring)
  if (normalized.startsWith("/en/posts/") && normalized.includes("/ko/")) {
    flags.push("BAD_PATH:/en/posts/.../ko/ mixed");
  }
  if (normalized.startsWith("/posts/") && normalized.includes("/en/")) {
    flags.push("BAD_PATH:/posts/.../en/ mixed");
  }

  if (expectedLang) {
    const isEn = normalized.startsWith("/en/");
    if (expectedLang === "en" && !isEn) flags.push("CROSS_LANG: expected /en/ link");
    if (expectedLang === "ko" && isEn) flags.push("CROSS_LANG: expected non-/en/ link");
  }
  return flags;
}

function listFiles(dirAbs, extsCsv) {
  const exts = (extsCsv || "md,mdx").split(",").map((s) => s.trim()).filter(Boolean);
  const files = [];
  exts.forEach((ext) => {
    const found = glob.sync(`**/*.${ext}`, { cwd: dirAbs, nodir: true });
    found.forEach((f) => files.push(path.join(dirAbs, f)));
  });
  return files;
}

(function main() {
  const registryPath = arg("registry", null);
  const dirArg = arg("dir", null);
  const exts = arg("ext", "md,mdx");
  const domain = arg("domain", "https://www.finmaphub.com");
  const outPath = arg("out", null);
  const onlyPublished = (arg("only_published", "true") || "true").toLowerCase() === "true";

  if (!registryPath || !dirArg) {
    console.error("Usage: node scripts/check_posts_links_local.js --registry=blog-contents.md --dir=content/posts --ext=md,mdx --out=reports/posts.linkcheck.json");
    process.exit(1);
  }

  const registryAbs = ensureAbs(registryPath);
  const dirAbs = ensureAbs(dirArg);

  const registryMd = readText(registryAbs);
  const knownRoutes = parseRegistryUrls(registryMd);

  const files = listFiles(dirAbs, exts);

  const report = {
    checkedFiles: files.length,
    checkedPublishedFiles: 0,
    broken: [],       // internal path not found in registry
    suspicious: [],   // bad patterns, cross-lang, relative links
    selfUrlMissing: [], // post exists in repo but not in blog-contents registry
    summary: {},
  };

  files.forEach((file) => {
    const md = readText(file);
    const meta = parseFrontmatterBasics(md) || {};
    const selfUrl = expectedUrlFromFrontmatter(meta);

    const isPublished = selfUrl ? knownRoutes.has(selfUrl) : false;

    if (selfUrl && !isPublished) {
      report.selfUrlMissing.push({
        file: path.relative(process.cwd(), file),
        selfUrl,
        meta,
      });
    }

    if (onlyPublished && !isPublished) return;
    report.checkedPublishedFiles += 1;

    const expectedLang = meta.lang || null;
    const rawLinks = extractLinksFromMarkdown(md);

    const seen = new Set();
    rawLinks.forEach((raw) => {
      const internal = toInternalPath(raw, domain);
      if (!internal) return;

      if (typeof internal === "object" && internal.relative) {
        report.suspicious.push({
          file: path.relative(process.cwd(), file),
          raw,
          normalized: internal.value,
          flags: ["RELATIVE_LINK: prefer absolute /... routes"],
        });
        return;
      }

      const normalized = normalizePath(internal); // existence check key    
      if (seen.has(normalized)) return;
      seen.add(normalized);

      // flags should see original (query 포함) + normalized(쿼리 제거)
      const flags = flagsForPath(internal, normalized, expectedLang);
      if (flags.length) {
        report.suspicious.push({
          file: path.relative(process.cwd(), file),
          raw,
          normalized,
          flags,
        });
      }

      // ✅ tools/market are valid internal routes even if not listed in blog-contents.md
      if (isToolRoute(normalized)) {
        const slug = toolSlug(normalized);
        if (slug && !KNOWN_TOOL_SLUGS.has(slug)) {
          report.broken.push({
            file: path.relative(process.cwd(), file),
            raw,
            normalized,
            reason: "UNKNOWN_TOOL_SLUG (tools 경로 오타 가능)",
          });
        }
        return;
      }
      if (isMarketRoute(normalized)) {
        return;
      }

      if (!knownRoutes.has(normalized)) {
        report.broken.push({
          file: path.relative(process.cwd(), file),
          raw,
          normalized,
          reason: "NOT_IN_BLOG_CONTENTS (운영 등록 목록에 없음)",
        });
      }
    });
  });

  report.summary = {
    filesTotal: report.checkedFiles,
    filesPublishedChecked: report.checkedPublishedFiles,
    brokenCount: report.broken.length,
    suspiciousCount: report.suspicious.length,
    selfUrlMissingCount: report.selfUrlMissing.length,
  };

  console.log("\n=== Local Posts Link Check ===");
  console.log("Files total:", report.summary.filesTotal);
  console.log("Published files checked:", report.summary.filesPublishedChecked);
  console.log("Broken:", report.summary.brokenCount);
  console.log("Suspicious:", report.summary.suspiciousCount);
  console.log("Self URL missing in registry:", report.summary.selfUrlMissingCount);

  if (report.summary.brokenCount) {
    console.log("\n--- BROKEN (fix needed) ---");
    report.broken.slice(0, 200).forEach((x) => {
      console.log(`- ${x.normalized} | ${x.file}`);
    });
    if (report.broken.length > 200) console.log(`... and ${report.broken.length - 200} more`);
  }

  if (report.summary.suspiciousCount) {
    console.log("\n--- SUSPICIOUS (review) ---");
    report.suspicious.slice(0, 200).forEach((x) => {
      console.log(`- ${x.normalized} | ${x.file} | ${x.flags.join(", ")}`);
    });
    if (report.suspicious.length > 200) console.log(`... and ${report.suspicious.length - 200} more`);
  }

  if (outPath) {
    const outAbs = ensureAbs(outPath);
    const outDir = path.dirname(outAbs);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outAbs, JSON.stringify(report, null, 2), "utf8");
    console.log("\nSaved:", outAbs);
  }

  // CI에서 깨진 링크 있으면 실패로 처리하고 싶으면 아래 주석 해제:
  // process.exit(report.summary.brokenCount ? 2 : 0);
})();
