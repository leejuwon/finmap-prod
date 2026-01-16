// server/crawler/lib/vendors/yahooFinance.js
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

function tryCreateFileCookieJar() {
  // Enable by setting: YF_COOKIE_JAR=file
  const mode = String(process.env.YF_COOKIE_JAR || '').toLowerCase();
  if (mode !== 'file') return null;

  try {
    const { FileCookieStore } = require('tough-cookie-file-store');
    const { ExtendedCookieJar } = require('yahoo-finance2/lib/cookieJar');

    const cookiePath =
      process.env.YF_COOKIE_PATH || path.join(os.homedir(), '.yf2-cookies.json');

    try { fs.mkdirSync(path.dirname(cookiePath), { recursive: true }); } catch (_) {}

    const cookieJar = new ExtendedCookieJar(new FileCookieStore(cookiePath));
    return { cookieJar, cookiePath };
  } catch (e) {
    console.warn(
      '[yahooFinance] File cookie jar requested but not available. Falling back to memory jar.',
      e && e.message ? e.message : e
    );
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getHttpStatus(err) {
  return (
    err?.statusCode ||
    err?.status ||
    err?.response?.status ||
    err?.cause?.statusCode ||
    err?.cause?.status ||
    null
  );
}

function isCrumb429(err) {
  const status = getHttpStatus(err);
  const msg = String(err?.message || '');
  return status === 429 || /Failed to get crumb/i.test(msg) || /Too Many Requests/i.test(msg);
}

function backoffMs(attempt) {
  const base = Math.min(60_000, 2_000 * Math.pow(2, attempt)); // 2s,4s,8s...
  const jitter = Math.floor(Math.random() * 500);
  return base + jitter;
}

function createClient() {
  const YahooFinance = require('yahoo-finance2').default;

  const jarInfo = tryCreateFileCookieJar();
  const yahooFinance = new YahooFinance(jarInfo ? { cookieJar: jarInfo.cookieJar } : undefined);

  // notices
  try {
    yahooFinance.suppressNotices(['ripHistorical', 'yahooSurvey', 'yahooCookie', 'experimental']);
  } catch (_) {}

  // global config (concurrency + UA + fetchOptions)
  try {
    const userAgent =
      process.env.YF_USER_AGENT ||
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

    yahooFinance.setGlobalConfig({
      queue: { concurrency: Number(process.env.YF_CONCURRENCY || 2) },
      validation: { logErrors: false },
      fetchOptions: {
        headers: {
          'user-agent': userAgent,
          'accept-language': 'en-US,en;q=0.9',
        },
      },
    });
  } catch (_) {}

  // Optional crumb clear helper
  let getCrumbClear = null;
  try {
    ({ getCrumbClear } = require('yahoo-finance2/lib/getCrumb'));
  } catch (_) {}

  async function withCrumb429Retry(opName, fn) {
    const maxAttempts = Number(process.env.YF_429_MAX_ATTEMPTS || 6);
    let lastErr;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        if (!isCrumb429(err)) throw err;

        // 한번만 clear
        if (attempt === 0 && getCrumbClear && jarInfo?.cookieJar) {
          try { await getCrumbClear(jarInfo.cookieJar); } catch (_) {}
        }

        const wait = backoffMs(attempt);
        if (process.env.YF_DEBUG_RETRY === '1') {
          console.warn(`[yahooFinance] ${opName}: crumb 429 -> retry ${attempt + 1}/${maxAttempts} in ${wait}ms`);
        }
        await sleep(wait);
      }
    }
    throw lastErr;
  }

  // Wrap only methods you actually use (콜사이트 수정 0)
  const METHODS_TO_WRAP = ['quote', 'chart', 'quoteSummary', 'search', 'historical', 'trendingSymbols'];
  for (const method of METHODS_TO_WRAP) {
    if (typeof yahooFinance[method] !== 'function') continue;
    const orig = yahooFinance[method].bind(yahooFinance);
    yahooFinance[method] = (...args) => withCrumb429Retry(method, () => orig(...args));
  }

  if (jarInfo?.cookiePath) {
    console.log('[yahooFinance] Using file cookie jar:', jarInfo.cookiePath);
  }

  return yahooFinance;
}

module.exports = createClient();
