// pages/rss.xml.js
export default function Rss() {
  return null;
}

function escapeXml(s = "") {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(s = "") {
  // CDATA 종료 시퀀스 방지
  return `<![CDATA[${String(s).replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

function buildRss({ siteUrl, items }) {
  const now = new Date().toUTCString();

  const itemXml = items.map((p) => {
    const link = `${siteUrl}${p.path}`;           // p.path: "/posts/..." 처럼 절대경로
    const pubDate = new Date(p.date).toUTCString();
    return `
      <item>
        <title>${escapeXml(p.title)}</title>
        <link>${escapeXml(link)}</link>
        <guid>${escapeXml(link)}</guid>
        <pubDate>${escapeXml(pubDate)}</pubDate>
        <description>${cdata(p.html || p.description || "")}</description>
      </item>
    `.trim();
  }).join("\n");

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

export async function getServerSideProps({ res }) {
  const siteUrl = "https://www.finmaphub.com";

  // ✅ 여기만 당신 프로젝트에 맞게:
  // sitemap 만들 때 쓰는 "글 목록" 데이터를 그대로 재사용하면 가장 쉬움
  const posts = await getLatestPostsForRss(); // [{ title, path, date, html? }, ...]
  const items = posts.slice(0, 30);          // 최근 30개 정도 추천

  const xml = buildRss({ siteUrl, items });

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.write(xml);
  res.end();

  return { props: {} };
}