// pages/rss.xml.js
import fs from "fs";
import path from "path";

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

function cdata(s = "") {
  return `<![CDATA[${String(s).replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function slugToTitleFromUrl(loc) {
  try {
    const u = new URL(loc);
    const parts = u.pathname.split("/").filter(Boolean);
    const slug = parts[parts.length - 1] || "FinMap";
    // slug -> "gold-geopolitics-real-rates" => "Gold geopolitics real rates"
    const t = decodeURIComponent(slug).replace(/[-_]+/g, " ").trim();
    return t.length ? t : "FinMap";
  } catch {
    return "FinMap";
  }
}

function buildRss({ siteUrl, items }) {
  const now = new Date().toUTCString();

  const itemXml = (items || [])
    .map((p) => {
      const link = p.loc || `${siteUrl}${p.path || "/"}`;
      const pubDate = new Date(p.date || Date.now()).toUTCString();
      const title = p.title || slugToTitleFromUrl(link);

      return `
<item>
  <title>${escapeXml(title)}</title>
  <link>${escapeXml(link)}</link>
  <guid>${escapeXml(link)}</guid>
  <pubDate>${escapeXml(pubDate)}</pubDate>
  <description>${cdata(p.description || "")}</description>
</item>`.trim();
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml("FinMap")}</title>
  <link>${escapeXml(siteUrl + "/")}</link>
  <description>${escapeXml("FinMap latest posts")}</description>
  <lastBuildDate>${escapeXml(now)}</lastBuildDate>
  ${itemXml}
</channel>
</rss>`;
}

/**
 * ✅ next-sitemap이 빌드 후 public/sitemap-0.xml을 생성하므로
 * 그 파일에서 /posts/ URL만 뽑아 RSS 아이템으로 사용
 */
function readFileIfExists(p) {
  try {
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
  } catch (e) {
    console.error("[rss.xml] readFile error:", p, e);
  }
  return null;
}

function parseSitemapUrlset(xml) {
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
  return blocks
    .map((b) => {
      const loc = (b.match(/<loc>([\s\S]*?)<\/loc>/) || [])[1]?.trim();
      const lastmod = (b.match(/<lastmod>([\s\S]*?)<\/lastmod>/) || [])[1]?.trim();
      return { loc, lastmod };
    })
    .filter((x) => x.loc);
}

async function getLatestPostsForRss({ siteUrl, limit = 30 }) {
  const cwd = process.cwd();
  const sitemap0 = path.join(cwd, "public", "sitemap-0.xml");
  const sitemapIndex = path.join(cwd, "public", "sitemap.xml");

  let xml = readFileIfExists(sitemap0);

  // sitemap-0.xml이 없으면 sitemap.xml(인덱스)에서 첫 sitemap loc를 읽어보는 fallback
  if (!xml) {
    const idx = readFileIfExists(sitemapIndex);
    if (idx) {
      const loc = (idx.match(/<loc>([^<]*sitemap-0\.xml)<\/loc>/) || [])[1];
      if (loc) {
        // 로컬 파일로 다시 시도
        xml = readFileIfExists(path.join(cwd, "public", "sitemap-0.xml"));
      }
    }
  }

  if (!xml) {
    console.error("[rss.xml] sitemap file not found (public/sitemap-0.xml)");
    return [];
  }

  const urls = parseSitemapUrlset(xml);

  const posts = urls
    .filter(({ loc }) => loc.startsWith(siteUrl) && loc.includes("/posts/"))
    .map(({ loc, lastmod }) => ({
      loc,
      date: lastmod || null,
      title: slugToTitleFromUrl(loc),
      description: "",
    }))
    .sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    })
    .slice(0, limit);

  return posts;
}

export async function getServerSideProps({ res }) {
  const siteUrl = "https://www.finmaphub.com";

  try {
    const items = await getLatestPostsForRss({ siteUrl, limit: 30 });
    const xml = buildRss({ siteUrl, items });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
    );
    res.end(xml);
  } catch (e) {
    console.error("[rss.xml] fatal error:", e);

    // 그래도 500 대신 빈 RSS라도 200으로 반환(로봇/검증 실패 방지)
    const xml = buildRss({ siteUrl, items: [] });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.end(xml);
  }

  return { props: {} };
}