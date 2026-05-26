// pages/rss.xml.js
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const SITE_URL = "https://www.finmaphub.com";
const RSS_ITEM_LIMIT = 50;
const RSS_MIN_ITEM_COUNT = 30;
const RSS_MAX_BYTES = 10 * 1024 * 1024;

export default function Rss() {
  return null;
}

function escapeXml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeHtmlAttr(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function cdata(s = "") {
  return `<![CDATA[${String(s).replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkDir(full));
    else out.push(full);
  }
  return out;
}

function normalizeDate(value, fallbackDate) {
  const raw = String(value || "").trim();
  const parsed = raw ? new Date(raw) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return fallbackDate || new Date().toISOString();
}

function firstText(...values) {
  for (const value of values) {
    if (Array.isArray(value)) {
      const joined = value.filter(Boolean).join(" ").trim();
      if (joined) return joined;
      continue;
    }
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}

function normalizeSitePath(pathname) {
  let p = String(pathname || "/").replace(/\/{2,}/g, "/");
  if (p === "/ko") p = "/";
  else if (p.startsWith("/ko/")) p = p.replace(/^\/ko/, "") || "/";
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p || "/";
}

function normalizeSiteUrl(rawUrl) {
  const raw = String(rawUrl || "").trim();
  if (
    !raw ||
    raw.startsWith("#") ||
    /^(mailto|tel|javascript|data):/i.test(raw)
  ) {
    return "";
  }

  try {
    const parsed = new URL(raw, SITE_URL);
    if (parsed.origin !== SITE_URL) return "";
    const normalizedPath = normalizeSitePath(parsed.pathname);
    return `${SITE_URL}${normalizedPath}${parsed.search || ""}${parsed.hash || ""}`;
  } catch {
    return "";
  }
}

function normalizeSrcset(rawSrcset) {
  const parts = String(rawSrcset || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [url, ...descriptor] = part.split(/\s+/);
      const normalized = normalizeSiteUrl(url);
      if (!normalized) return "";
      return [normalized, ...descriptor].join(" ");
    })
    .filter(Boolean);
  return parts.join(", ");
}

function normalizeContentHtml(html) {
  let out = String(html || "");

  out = out
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object\b[\s\S]*?<\/object>/gi, "")
    .replace(/<embed\b[\s\S]*?>/gi, "");

  out = out.replace(/<pre><code[\s\S]*?application\/ld\+json[\s\S]*?<\/code><\/pre>/gi, "");

  out = out.replace(/\s(href|src|poster|action)=(["'])([^"']*)\2/gi, (_m, attr, quote, value) => {
    const normalized = normalizeSiteUrl(value);
    return normalized ? ` ${attr}=${quote}${escapeHtmlAttr(normalized)}${quote}` : "";
  });

  out = out.replace(/\s(srcset)=(["'])([^"']*)\2/gi, (_m, attr, quote, value) => {
    const normalized = normalizeSrcset(value);
    return normalized ? ` ${attr}=${quote}${escapeHtmlAttr(normalized)}${quote}` : "";
  });

  out = out.replace(/https?:\/\/(?!www\.finmaphub\.com)[^\s<]+/gi, "");

  return out;
}

function renderMarkdownToHtml(markdown) {
  const html = marked.parse(String(markdown || ""), {
    async: false,
    mangle: false,
    headerIds: false,
  });
  return normalizeContentHtml(html);
}

function getLatestKoPostsFromContent({ limit = RSS_ITEM_LIMIT }) {
  const postsRoot = path.join(process.cwd(), "content", "posts");
  const mdFiles = walkDir(postsRoot).filter((file) => file.endsWith(".md"));

  return mdFiles
    .map((fullPath) => {
      const rel = path.relative(postsRoot, fullPath).replace(/\\/g, "/");
      const parts = rel.split("/");
      if (parts.length < 3) return null;

      const category = parts[0];
      const lang = parts[1];
      const filename = parts[parts.length - 1];
      const fileSlug = filename.replace(/\.md$/, "");
      if (!category || lang !== "ko" || !fileSlug) return null;

      let raw = "";
      let data = {};
      let content = "";
      let fallbackDate = new Date().toISOString();
      try {
        raw = fs.readFileSync(fullPath, "utf8");
        const parsed = matter(raw);
        data = parsed.data || {};
        content = parsed.content || "";
        fallbackDate = fs.statSync(fullPath).mtime.toISOString();
      } catch {
        return null;
      }

      if (data.draft === true || data.noindex === true || String(data.robots || "").includes("noindex")) {
        return null;
      }

      const slug = String(data.slug || fileSlug).trim();
      const linkPath = `/posts/${category}/${slug}`;
      const loc = `${SITE_URL}${linkPath}`;
      const published = normalizeDate(data.datePublished || data.date, fallbackDate);
      const modified = normalizeDate(data.dateModified || data.datePublished || data.date, fallbackDate);
      const title = firstText(data.title, data.seoTitle, slug);
      const description = firstText(data.description, data.seoDescription, data.summary);
      const contentHtml = renderMarkdownToHtml(content);

      return {
        loc,
        published,
        modified,
        sortDate: modified || published,
        title,
        description,
        contentHtml,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
    .slice(0, limit);
}

function buildRss({ siteUrl, items }) {
  const now = new Date().toUTCString();
  const latestDate = items?.[0]?.sortDate ? new Date(items[0].sortDate).toUTCString() : now;

  const itemXml = (items || [])
    .map((p) => {
      const pubDate = new Date(p.published || p.sortDate || Date.now()).toUTCString();
      const title = p.title || "FinMap";
      const description = p.description || "";
      const contentEncoded = p.contentHtml
        ? `\n  <content:encoded>${cdata(p.contentHtml)}</content:encoded>`
        : "";

      return `
<item>
  <title>${escapeXml(title)}</title>
  <link>${escapeXml(p.loc)}</link>
  <guid isPermaLink="true">${escapeXml(p.loc)}</guid>
  <pubDate>${escapeXml(pubDate)}</pubDate>
  <description>${cdata(description)}</description>${contentEncoded}
</item>`.trim();
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml("FinMap 최신 한국어 글")}</title>
  <link>${escapeXml(siteUrl + "/")}</link>
  <atom:link href="${escapeXml(siteUrl + "/rss.xml")}" rel="self" type="application/rss+xml" />
  <description>${escapeXml("FinMap 경제, 재테크, 투자, 부동산 대시보드 활용 글 모음")}</description>
  <language>ko-KR</language>
  <lastBuildDate>${escapeXml(now)}</lastBuildDate>
  <pubDate>${escapeXml(latestDate)}</pubDate>
  ${itemXml}
</channel>
</rss>`;
}

function byteLength(s) {
  return Buffer.byteLength(String(s || ""), "utf8");
}

function buildSizeLimitedRss({ siteUrl, items }) {
  let nextItems = items.slice(0, RSS_ITEM_LIMIT);
  let xml = buildRss({ siteUrl, items: nextItems });

  while (byteLength(xml) > RSS_MAX_BYTES && nextItems.length > RSS_MIN_ITEM_COUNT) {
    nextItems = nextItems.slice(0, -1);
    xml = buildRss({ siteUrl, items: nextItems });
  }

  let stripIndex = nextItems.length - 1;
  while (byteLength(xml) > RSS_MAX_BYTES && stripIndex >= 0) {
    nextItems = nextItems.map((item, idx) => (
      idx === stripIndex ? { ...item, contentHtml: "" } : item
    ));
    stripIndex -= 1;
    xml = buildRss({ siteUrl, items: nextItems });
  }

  return { xml, items: nextItems, strippedContentCount: nextItems.filter((x) => !x.contentHtml).length };
}

export async function getServerSideProps({ res }) {
  try {
    const items = getLatestKoPostsFromContent({ limit: RSS_ITEM_LIMIT });
    const { xml } = buildSizeLimitedRss({ siteUrl: SITE_URL, items });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
    );
    res.end(xml);
  } catch (e) {
    console.error("[rss.xml] fatal error:", e);

    const xml = buildRss({ siteUrl: SITE_URL, items: [] });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.end(xml);
  }

  return { props: {} };
}
