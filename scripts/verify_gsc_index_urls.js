const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local'), quiet: true });
  require('dotenv').config({ path: path.join(process.cwd(), '.env.production'), quiet: true });
} catch {
  // dotenv is optional for remote-only checks.
}

const SITE_URL = process.env.GSC_BASE_URL || 'https://www.finmaphub.com';
const REPORT_PATH = path.join(process.cwd(), 'reports', 'gsc-index-url-audit.md');
const MAX_REDIRECTS = 6;

const URLS_TO_CHECK = [
  '/posts/compound-interest',
  '/posts/economics-inflation-basics',
  '/posts/usd-krw-weak-won-sector-map-kospi',
  '/posts/investingInfo/usdkrw-exchange-rate-and-kospi',
  '/en/posts/investingInfo/usdkrw-exchange-rate-and-kospi',
  '/en/posts/investingInfo/usd-krw-exchange-rate-kospi',
  '/posts/personalFinance/en/personal-finance-3pillars',
  '/en/en',
  '/en/en/category/personalFinance',
  '/en/en/category/investingInfo',
  '/category/tax?lang=ko',
  '/market/real-estate/apt/[aptKey]',
  '/en/market/real-estate/apt/[aptKey]',
  '/posts/investingInfo/tnx-basics',
  '/tools/dsr-ltv-calculator',
  '/posts/personalFinance/dca-vs-lump-sum-when-results-differ',
  '/posts/personalFinance/how-much-monthly-invest-for-100m',
  '/posts/personalFinance/is-dca-better-in-bear-market',
  '/posts/investingInfo/modern-6040-risk-budget',
  '/en/posts/economicInfo/inflation-rate-basics',
  '/en/posts/economicInfo/indicator-basics',
  '/en/tools/compound-interest',
];

if (process.env.GSC_APT_SAMPLE_KEY) {
  const key = encodeURIComponent(process.env.GSC_APT_SAMPLE_KEY);
  URLS_TO_CHECK.push(
    `/market/real-estate/apt/${key}?period=202501&band=all`,
    `/en/market/real-estate/apt/${key}?period=202501&band=all`
  );
}

async function addDbAptSampleUrls(urls) {
  if (process.env.GSC_APT_SAMPLE_KEY || process.env.GSC_INCLUDE_APT_SAMPLE !== '1') {
    return urls;
  }

  let conn;
  try {
    const mysql = require('mysql2/promise');
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'finmap_app',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ljw0209',
      charset: 'utf8mb4',
      connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 3000),
    });
    const [rows] = await conn.execute(`
      SELECT apt_key
      FROM re_trade_apt_stats_m
      WHERE pyeong_band = 'all'
        AND apt_key IS NOT NULL
        AND apt_key <> ''
        AND COALESCE(tx_count, 0) > 0
      ORDER BY deal_ym DESC
      LIMIT 1
    `);
    const sampleKey = String(rows?.[0]?.apt_key || '').trim();
    if (!sampleKey) return urls;

    const encodedKey = encodeURIComponent(sampleKey);
    urls.push(
      `/market/real-estate/apt/${encodedKey}?period=202501&band=all`,
      `/en/market/real-estate/apt/${encodedKey}?period=202501&band=all`
    );
  } catch (error) {
    console.warn(`[gsc-audit] apt sample lookup skipped: ${error.message}`);
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
  return urls;
}

function absoluteUrl(input) {
  return new URL(input, SITE_URL).toString();
}

function normalizeUrl(value) {
  try {
    const url = new URL(value, SITE_URL);
    url.hash = '';
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return url.toString();
  } catch {
    return String(value || '');
  }
}

function comparablePath(value) {
  try {
    const url = new URL(value, SITE_URL);
    url.hash = '';
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return String(value || '');
  }
}

function isCanonicalMatch(canonicalHref, finalUrl) {
  return Boolean(canonicalHref) && comparablePath(canonicalHref) === comparablePath(finalUrl);
}

function getAttr(tag, attr) {
  const re = new RegExp(`${attr}\\s*=\\s*(["'])(.*?)\\1`, 'i');
  const match = String(tag || '').match(re);
  return match ? match[2].trim() : '';
}

function extractCanonical(html) {
  const links = String(html || '').match(/<link\b[^>]*>/gi) || [];
  for (const tag of links) {
    const rel = getAttr(tag, 'rel').toLowerCase();
    if (rel.split(/\s+/).includes('canonical')) {
      return getAttr(tag, 'href');
    }
  }
  return '';
}

function extractMeta(html, name) {
  const metas = String(html || '').match(/<meta\b[^>]*>/gi) || [];
  for (const tag of metas) {
    if (getAttr(tag, 'name').toLowerCase() === name.toLowerCase()) {
      return getAttr(tag, 'content');
    }
  }
  return '';
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(html) {
  const match = String(html || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtmlEntities(match[1]) : '';
}

async function fetchManual(url) {
  return fetch(url, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      'user-agent': 'Finmap-GSC-Audit/1.0 (+https://www.finmaphub.com)',
      accept: 'text/html,application/xhtml+xml',
    },
  });
}

async function inspectUrl(input) {
  let current = absoluteUrl(input);
  const redirectChain = [];
  let xFmRedirect = '';

  for (let i = 0; i < MAX_REDIRECTS; i += 1) {
    const response = await fetchManual(current);
    const status = response.status;
    const fmHeader = response.headers.get('x-fm-redirect') || '';
    if (fmHeader && !xFmRedirect) xFmRedirect = fmHeader;

    if (status >= 300 && status < 400) {
      const location = response.headers.get('location') || '';
      const nextUrl = location ? new URL(location, current).toString() : '';
      redirectChain.push({
        status,
        from: current,
        to: nextUrl,
        xFmRedirect: fmHeader,
      });
      if (!nextUrl) {
        return {
          input,
          statusCode: status,
          redirectChain,
          finalUrl: current,
          xFmRedirect,
          canonicalHref: '',
          metaRobots: '',
          metaGooglebot: '',
          xRobotsTag: '',
          title: '',
          judgment: 'CHECK_CANONICAL',
        };
      }
      current = nextUrl;
      continue;
    }

    const html = await response.text().catch(() => '');
    const xRobotsTag = response.headers.get('x-robots-tag') || '';
    const canonicalHref = extractCanonical(html);
    const metaRobots = extractMeta(html, 'robots');
    const metaGooglebot = extractMeta(html, 'googlebot');
    const title = extractTitle(html);
    const robotsText = `${metaRobots},${metaGooglebot},${xRobotsTag}`.toLowerCase();
    const finalUrl = current;
    const hasRedirect = redirectChain.length > 0;
    const hasNoindex = robotsText.includes('noindex');
    const canonicalMatches = isCanonicalMatch(canonicalHref, finalUrl);
    let judgment = 'CHECK_CONTENT';

    if (hasRedirect && status >= 400) {
      judgment = 'OK_REDIRECT_TO_404';
    } else if (hasRedirect && hasNoindex) {
      judgment = 'OK_REDIRECT_NOINDEX';
    } else if (hasRedirect && !canonicalMatches) {
      judgment = 'OK_REDIRECT_CANONICAL_MISMATCH';
    } else if (hasRedirect) {
      judgment = 'OK_REDIRECT_INDEXABLE';
    } else if (status === 404 || status >= 500) {
      judgment = 'FIX_404';
    } else if (status >= 400) {
      judgment = 'FIX_404';
    } else if (hasNoindex) {
      judgment = 'OK_NOINDEX';
    } else if (!canonicalMatches) {
      judgment = 'CHECK_CANONICAL';
    }

    return {
      input,
      statusCode: status,
      redirectChain,
      finalUrl,
      xFmRedirect,
      canonicalHref,
      metaRobots,
      metaGooglebot,
      xRobotsTag,
      title,
      judgment,
    };
  }

  return {
    input,
    statusCode: 0,
    redirectChain,
    finalUrl: current,
    xFmRedirect,
    canonicalHref: '',
    metaRobots: '',
    metaGooglebot: '',
    xRobotsTag: '',
    title: '',
    judgment: 'CHECK_CANONICAL',
  };
}

function formatChain(chain) {
  if (!chain.length) return '-';
  return chain
    .map((hop) => `${hop.status} ${new URL(hop.from).pathname}${new URL(hop.from).search} -> ${new URL(hop.to).pathname}${new URL(hop.to).search}`)
    .join('<br>');
}

function mdEscape(value) {
  return String(value || '-').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function buildReport(results) {
  const lines = [];
  lines.push('# GSC Index URL Audit');
  lines.push('');
  lines.push(`- Base URL: ${SITE_URL}`);
  lines.push(`- Checked at: ${new Date().toISOString()}`);
  const aptSampleMode = process.env.GSC_APT_SAMPLE_KEY
    ? 'included via GSC_APT_SAMPLE_KEY'
    : process.env.GSC_INCLUDE_APT_SAMPLE === '1'
      ? 'included via DB sample lookup'
      : 'skipped (set GSC_APT_SAMPLE_KEY or GSC_INCLUDE_APT_SAMPLE=1)';
  lines.push(`- Optional apt detail noindex samples: ${aptSampleMode}`);
  lines.push('');
  lines.push('| Input URL | Status | Redirect chain | Final URL | x-fm-redirect | Canonical | Meta Robots | Meta Googlebot | X-Robots-Tag | Title | Judgment |');
  lines.push('| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const item of results) {
    lines.push([
      mdEscape(item.input),
      item.statusCode,
      mdEscape(formatChain(item.redirectChain)),
      mdEscape(item.finalUrl),
      mdEscape(item.xFmRedirect),
      mdEscape(item.canonicalHref),
      mdEscape(item.metaRobots),
      mdEscape(item.metaGooglebot),
      mdEscape(item.xRobotsTag),
      mdEscape(item.title),
      mdEscape(item.judgment),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }
  lines.push('');
  lines.push('## Judgment Guide');
  lines.push('');
  lines.push('- `OK_REDIRECT_INDEXABLE`: legacy URL redirects to a live indexable destination with matching canonical.');
  lines.push('- `OK_REDIRECT_NOINDEX`: legacy URL redirects to a live destination that intentionally carries noindex.');
  lines.push('- `OK_REDIRECT_CANONICAL_MISMATCH`: legacy URL redirects, but the final canonical is missing or differs from the final URL path.');
  lines.push('- `OK_REDIRECT_TO_404`: legacy URL redirects, but the final destination still returns an error.');
  lines.push('- `OK_NOINDEX`: page intentionally carries noindex,follow.');
  lines.push('- `FIX_404`: URL still returns a 4xx/5xx-like failure and needs mapping or removal.');
  lines.push('- `CHECK_CANONICAL`: canonical is missing or differs from the final URL; review whether it is intentional.');
  lines.push('- `CHECK_CONTENT`: live indexable page; review content depth and internal links before requesting indexing.');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const results = [];
  const urlsToCheck = await addDbAptSampleUrls([...URLS_TO_CHECK]);
  for (const input of urlsToCheck) {
    try {
      const result = await inspectUrl(input);
      results.push(result);
      console.log(`${result.judgment}\t${result.statusCode}\t${input}\t=>\t${result.finalUrl}`);
    } catch (error) {
      const result = {
        input,
        statusCode: 0,
        redirectChain: [],
        finalUrl: absoluteUrl(input),
        xFmRedirect: '',
        canonicalHref: '',
        metaRobots: '',
        metaGooglebot: '',
        xRobotsTag: '',
        title: '',
        judgment: 'FIX_404',
      };
      results.push(result);
      console.log(`FIX_404\t0\t${input}\t=>\t${error.message}`);
    }
  }
  fs.writeFileSync(REPORT_PATH, buildReport(results), 'utf8');
  console.log(`\nWrote ${REPORT_PATH}`);

  const fix404Count = results.filter((item) => item.judgment === 'FIX_404').length;
  if (fix404Count) {
    console.log(`FIX_404 candidates: ${fix404Count} (see report for details)`);
  }
}

main();
