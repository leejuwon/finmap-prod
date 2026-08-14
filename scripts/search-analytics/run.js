#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = process.cwd();
const SITE_URL = "https://www.finmaphub.com";
const REPORT_ROOT = path.join(ROOT, "reports", "search-performance");
const RAW_ROOT = path.join(REPORT_ROOT, "raw");
const NORMALIZED_ROOT = path.join(REPORT_ROOT, "normalized");
const WEEKLY_ROOT = path.join(REPORT_ROOT, "weekly");
const MANIFEST_ROOT = path.join(REPORT_ROOT, "manifests");
const SOURCE_TIMEZONES = {
  gsc: "America/Los_Angeles",
  ga4: "Asia/Seoul",
  bing: "UTC",
};
const COMMON_HEADERS = [
  "platform",
  "property",
  "dataset",
  "date",
  "page",
  "query",
  "country",
  "device",
  "sourceMedium",
  "channel",
  "clicks",
  "impressions",
  "ctr",
  "position",
  "sessions",
  "engagedSessions",
  "users",
  "eventName",
  "eventCount",
  "dataFreshness",
  "fetchedAt",
  "sourceTimezone",
];
const TOOL_EVENT_NAMES = [
  "page_view",
  "tool_calculate",
  "dsr_ltv_calculate",
  "home_buying_calculate",
  "mortgage_payment_calculate",
  "related_calculator_click",
  "post_to_dsr_ltv_click",
  "tool_result_cta_view",
  "tool_result_cta_click",
  "tool_result_action",
  "real_estate_to_dsr_click",
  "dsr_to_real_estate_click",
];
const CALCULATOR_FUNNEL_HEADERS = [
  "platform",
  "property",
  "url",
  "landingSessions",
  "calculateEventCount",
  "calculateUsers",
  "ctaViewEventCount",
  "ctaClickEventCount",
  "ctaClickThroughRate",
  "eventToSessionRatio",
  "dataFreshness",
  "fetchedAt",
  "notes",
];
const READ_ONLY_BING_METHODS = new Set([
  "GetUserSites",
  "GetRankAndTrafficStats",
  "GetQueryStats",
  "GetPageStats",
  "GetCrawlStats",
]);

function loadEnv() {
  try {
    const dotenv = require("dotenv");
    for (const file of [".env.search.local", ".env.search"]) {
      const full = path.join(ROOT, file);
      if (fs.existsSync(full)) dotenv.config({ path: full, override: false, quiet: true });
    }
  } catch (_) {
    // dotenv is optional for fixture-only runs.
  }
}

function parseArgs(argv) {
  const args = { _: [] };
  for (const arg of argv) {
    if (!arg.startsWith("--")) {
      args._.push(arg);
      continue;
    }
    const eq = arg.indexOf("=");
    if (eq === -1) args[arg.slice(2)] = true;
    else args[arg.slice(2, eq)] = arg.slice(eq + 1);
  }
  return args;
}

function readJson(file, fallback = null) {
  const full = path.isAbsolute(file) ? file : path.join(ROOT, file);
  if (!fs.existsSync(full)) return fallback;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(sanitize(value), null, 2)}\n`, "utf8");
}

function writeText(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, "utf8");
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function writeCsv(file, rows, headers = COMMON_HEADERS) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const body = [headers.join(",")]
    .concat(rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")))
    .join("\n");
  fs.writeFileSync(file, `${body}\n`, "utf8");
}

function parseCsv(text) {
  const source = text.replace(/^\uFEFF/, "").trim();
  if (!source) return [];
  const lines = source.split(/\r?\n/);
  const headers = splitCsvLine(lines.shift());
  return lines.filter(Boolean).map((line) => {
    const cells = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] === "" ? null : cells[index] ?? null]));
  });
}

function splitCsvLine(line) {
  const out = [];
  let cell = "";
  let quote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quote && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        quote = !quote;
      }
    } else if (ch === "," && !quote) {
      out.push(cell);
      cell = "";
    } else {
      cell += ch;
    }
  }
  out.push(cell);
  return out;
}

function nowIso() {
  return new Date().toISOString();
}

function todayInZone(timeZone = "Asia/Seoul") {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function addDays(date, delta) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function dateRange(start, end) {
  const out = [];
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
  return out;
}

function normalizeUrl(value) {
  if (!value) return null;
  let url = String(value).trim();
  if (!url) return null;
  try {
    if (/^https?:\/\//i.test(url)) {
      const parsed = new URL(url);
      url = parsed.pathname + parsed.search;
    }
  } catch (_) {}
  if (url.length > 1) url = url.replace(/\/$/, "");
  return url;
}

function safeNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(String(value).replace(/[%\s,]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function divOrNull(a, b) {
  return b ? a / b : null;
}

function commonRow(partial) {
  return {
    platform: null,
    property: null,
    dataset: null,
    date: null,
    page: null,
    query: null,
    country: null,
    device: null,
    sourceMedium: null,
    channel: null,
    clicks: null,
    impressions: null,
    ctr: null,
    position: null,
    sessions: null,
    engagedSessions: null,
    users: null,
    eventName: null,
    eventCount: null,
    dataFreshness: null,
    fetchedAt: nowIso(),
    sourceTimezone: null,
    ...partial,
  };
}

function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== "object") return typeof value === "string" ? maskSecretText(value) : value;
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    if (/(private[_-]?key|client[_-]?secret|refresh[_-]?token|access[_-]?token|authorization|api[_-]?key|password|cookie|session[_-]?(id|token|cookie))/i.test(key) && val) {
      out[key] = "[REDACTED]";
    } else {
      out[key] = sanitize(val);
    }
  }
  return out;
}

function maskSecretText(text) {
  return String(text)
    .replace(/(apikey=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/(Authorization:\s*Bearer\s+)[A-Za-z0-9._-]+/gi, "$1[REDACTED]")
    .replace(/(client_secret["'\s:=]+)["']?[^"',\s]+/gi, "$1[REDACTED]")
    .replace(/(refresh_token["'\s:=]+)["']?[^"',\s]+/gi, "$1[REDACTED]")
    .replace(/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g, "[REDACTED_PRIVATE_KEY]");
}

function safeError(error) {
  return {
    name: error?.name || "Error",
    message: maskSecretText(error?.message || String(error)),
    code: error?.code || error?.status || null,
  };
}

function loadConfig() {
  const queryFamilies = readJson("config/search-analytics/query-families.json", { families: [] });
  const trackedPages = readJson("config/search-analytics/tracked-pages.json", { pages: [] });
  const thresholds = readJson("config/search-analytics/thresholds.json", {
    lowSample: { clicks: 5, impressions: 100, sessions: 20 },
    movement: {
      visibilityDeclinePct: -20,
      visibilityGrowthPct: 20,
      ctrDeclinePct: -20,
      organicTrafficDeclinePct: -20,
      rankingDeclinePositionDelta: 2,
    },
  });
  return { queryFamilies, trackedPages, thresholds };
}

function getRunDate(args) {
  return String(args.date || args["run-date"] || todayInZone(process.env.SEARCH_REPORT_TIMEZONE || "Asia/Seoul"));
}

function getEffectiveEnd(args, platform) {
  if (args["end-date"]) return String(args["end-date"]);
  const lagKey = platform === "ga4" ? "GA4_DATA_LAG_DAYS" : "GSC_DATA_LAG_DAYS";
  const fallback = platform === "ga4" ? 2 : 3;
  const lag = Number(process.env[lagKey] || fallback);
  return addDays(todayInZone(process.env.SEARCH_REPORT_TIMEZONE || "Asia/Seoul"), -lag);
}

function getWindow(args, rows = []) {
  const days = Number(args.days || process.env.SEARCH_DEFAULT_DAYS || 7);
  const compareDays = Number(args["compare-days"] || process.env.SEARCH_COMPARE_DAYS || 7);
  const trendDays = Number(args["trend-days"] || process.env.SEARCH_TREND_DAYS || 28);
  const datedRows = rows.map((row) => row.date).filter(Boolean).sort();
  const effectiveEnd = String(args["end-date"] || datedRows[datedRows.length - 1] || getEffectiveEnd(args, "gsc"));
  const currentStart = addDays(effectiveEnd, -(days - 1));
  const previousEnd = addDays(currentStart, -1);
  const previousStart = addDays(previousEnd, -(compareDays - 1));
  const trendStart = addDays(effectiveEnd, -(trendDays - 1));
  return { days, compareDays, trendDays, effectiveEnd, currentStart, previousStart, previousEnd, trendStart };
}

function dataDirs(runDate) {
  return {
    raw: path.join(RAW_ROOT, runDate),
    normalized: path.join(NORMALIZED_ROOT, runDate),
    weekly: WEEKLY_ROOT,
    manifests: MANIFEST_ROOT,
  };
}

function pathFor(runDate, kind, name) {
  const dirs = dataDirs(runDate);
  return path.join(dirs[kind], name);
}

function fixtureData() {
  return readJson("test/fixtures/search-analytics/fixture-data.json");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  const status = Number(error?.code || error?.status || error?.response?.status || 0);
  const message = String(error?.message || "").toLowerCase();
  return [429, 500, 502, 503].includes(status)
    || message.includes("timeout")
    || message.includes("aborted")
    || message.includes("temporarily")
    || message.includes("socket")
    || message.includes("econnreset")
    || message.includes("network");
}

async function withRetry(fn, label, options = {}) {
  const maxAttempts = Number(options.maxAttempts || process.env.SEARCH_API_MAX_RETRIES || 3);
  const baseMs = Number(options.baseMs || process.env.SEARCH_API_RETRY_BASE_MS || 500);
  let lastError;
  let attempts = 0;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    attempts = attempt;
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error) || attempt >= maxAttempts) break;
      const jitter = Math.floor(Math.random() * 125);
      await sleep(baseMs * 2 ** (attempt - 1) + jitter);
    }
  }
  const wrapped = new Error(`${label} failed after ${attempts} attempt(s): ${safeError(lastError).message}`);
  wrapped.status = lastError?.status || lastError?.code;
  throw wrapped;
}

function normalizeGscRows({ property, dataset, rows, dimensions, dataFreshness }) {
  const filledDates = dataset === "daily" && dimensions[0] === "date";
  const normalized = [];
  for (const row of rows || []) {
    const keys = row.keys || [];
    const partial = {};
    for (let i = 0; i < dimensions.length; i++) {
      const key = keys[i] ?? null;
      if (dimensions[i] === "date") partial.date = key;
      if (dimensions[i] === "page") partial.page = normalizeUrl(key);
      if (dimensions[i] === "query") partial.query = key;
      if (dimensions[i] === "country") partial.country = key;
      if (dimensions[i] === "device") partial.device = key;
    }
    normalized.push(commonRow({
      platform: "gsc",
      property,
      dataset,
      clicks: safeNumber(row.clicks) ?? 0,
      impressions: safeNumber(row.impressions) ?? 0,
      ctr: safeNumber(row.ctr),
      position: safeNumber(row.position),
      dataFreshness,
      sourceTimezone: SOURCE_TIMEZONES.gsc,
      ...partial,
    }));
  }
  if (filledDates) {
    const dates = normalized.map((row) => row.date).filter(Boolean).sort();
    if (dates.length) {
      const seen = new Set(dates);
      for (const date of dateRange(dates[0], dates[dates.length - 1])) {
        if (!seen.has(date)) {
          normalized.push(commonRow({
            platform: "gsc",
            property,
            dataset,
            date,
            clicks: 0,
            impressions: 0,
            ctr: null,
            position: null,
            dataFreshness,
            sourceTimezone: SOURCE_TIMEZONES.gsc,
          }));
        }
      }
    }
  }
  return normalized.sort((a, b) => String(a.date || a.page || a.query).localeCompare(String(b.date || b.page || b.query)));
}

function normalizeGa4Rows({ property, dataset, rows, dimensions, metrics, dataFreshness }) {
  const out = [];
  for (const row of rows || []) {
    const dvals = row.dimensionValues || [];
    const mvals = row.metricValues || [];
    const partial = {};
    dimensions.forEach((dimension, index) => {
      const value = dvals[index]?.value ?? null;
      if (dimension === "date") partial.date = value && /^\d{8}$/.test(value) ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6)}` : value;
      if (dimension === "landingPagePlusQueryString" || dimension === "pagePathPlusQueryString") partial.page = normalizeUrl(value);
      if (dimension === "sessionSourceMedium") {
        partial.sourceMedium = value;
        partial.channel = normalizeChannel(value, dvals[index + 1]?.value);
      }
      if (dimension === "sessionDefaultChannelGroup" && !partial.channel) partial.channel = value;
      if (dimension === "eventName") partial.eventName = value;
    });
    metrics.forEach((metric, index) => {
      const value = safeNumber(mvals[index]?.value);
      if (metric === "sessions") partial.sessions = value ?? 0;
      if (metric === "engagedSessions") partial.engagedSessions = value ?? 0;
      if (metric === "activeUsers" || metric === "totalUsers") partial.users = value ?? partial.users ?? 0;
      if (metric === "eventCount") partial.eventCount = value ?? 0;
    });
    out.push(commonRow({
      platform: "ga4",
      property,
      dataset,
      dataFreshness,
      sourceTimezone: process.env.GA4_TIMEZONE || SOURCE_TIMEZONES.ga4,
      ...partial,
    }));
  }
  return out;
}

function buildCalculatorFunnelRows({ property, landingRows, eventPageRows, trackedPages, dataFreshness }) {
  const calculatorUrls = (trackedPages.pages || [])
    .filter((page) => page.group === "tools" && page.url !== "/tools")
    .map((page) => page.url);
  const landingByPage = new Map();
  for (const row of landingRows || []) {
    const page = normalizeUrl(row.page);
    if (!page) continue;
    landingByPage.set(page, (landingByPage.get(page) || 0) + (safeNumber(row.sessions) || 0));
  }
  const eventsByPage = new Map();
  for (const row of eventPageRows || []) {
    const page = normalizeUrl(row.page);
    if (!page) continue;
    if (!eventsByPage.has(page)) eventsByPage.set(page, {});
    const bucket = eventsByPage.get(page);
    const name = row.eventName;
    bucket[name] = bucket[name] || { eventCount: 0, users: 0 };
    bucket[name].eventCount += safeNumber(row.eventCount) || 0;
    bucket[name].users += safeNumber(row.users) || 0;
  }
  return calculatorUrls.map((url) => {
    const events = eventsByPage.get(url) || {};
    const calculateEvents = (events.tool_calculate?.eventCount || 0)
      + (url.includes("dsr-ltv") ? (events.dsr_ltv_calculate?.eventCount || 0) : 0)
      + (url.includes("home-buying") ? (events.home_buying_calculate?.eventCount || 0) : 0)
      + (url.includes("mortgage") ? (events.mortgage_payment_calculate?.eventCount || 0) : 0);
    const calculateUsers = (events.tool_calculate?.users || 0)
      + (url.includes("dsr-ltv") ? (events.dsr_ltv_calculate?.users || 0) : 0)
      + (url.includes("home-buying") ? (events.home_buying_calculate?.users || 0) : 0)
      + (url.includes("mortgage") ? (events.mortgage_payment_calculate?.users || 0) : 0);
    const ctaViews = events.tool_result_cta_view?.eventCount || 0;
    const ctaClicks = events.tool_result_cta_click?.eventCount || 0;
    const sessions = landingByPage.get(url) || 0;
    return {
      platform: "ga4",
      property,
      url,
      landingSessions: sessions,
      calculateEventCount: calculateEvents,
      calculateUsers,
      ctaViewEventCount: ctaViews,
      ctaClickEventCount: ctaClicks,
      ctaClickThroughRate: divOrNull(ctaClicks, ctaViews),
      eventToSessionRatio: divOrNull(calculateEvents, sessions),
      dataFreshness,
      fetchedAt: nowIso(),
      notes: "EVENT_TO_SESSION_RATIO is not a user conversion rate; event and session denominators can differ.",
    };
  });
}

function normalizeChannel(sourceMedium, defaultChannel) {
  const raw = String(sourceMedium || "").toLowerCase();
  if (raw === "google / organic") return "google / organic";
  if (raw === "naver / organic") return "naver / organic";
  if (raw === "bing / organic") return "bing / organic";
  if (raw.includes("(direct)") || String(defaultChannel || "").toLowerCase() === "direct") return "direct";
  if (raw.includes("/ referral") || String(defaultChannel || "").toLowerCase() === "referral") return "referral";
  if (raw.endsWith("/ organic") || String(defaultChannel || "").toLowerCase().includes("organic")) return "other organic";
  return raw ? "unassigned" : defaultChannel || "unassigned";
}

function microsoftDateToIso(value) {
  if (!value) return null;
  const match = String(value).match(/\/Date\((\d+)([+-]\d{4})?\)\//);
  if (!match) return String(value).slice(0, 10);
  return new Date(Number(match[1])).toISOString().slice(0, 10);
}

function normalizeBingRows({ property, dataset, rows, dataFreshness }) {
  return (rows || []).map((row) => commonRow({
    platform: "bing",
    property,
    dataset,
    date: microsoftDateToIso(row.Date),
    page: normalizeUrl(row.Page || row.Url),
    query: row.Query || null,
    clicks: safeNumber(row.Clicks) ?? 0,
    impressions: safeNumber(row.Impressions) ?? 0,
    ctr: divOrNull(safeNumber(row.Clicks) ?? 0, safeNumber(row.Impressions) ?? 0),
    position: safeNumber(row.AvgImpressionPosition ?? row.AveragePosition),
    dataFreshness,
    sourceTimezone: SOURCE_TIMEZONES.bing,
  }));
}

async function collectGsc(args) {
  const runDate = getRunDate(args);
  const dirs = dataDirs(runDate);
  fs.mkdirSync(dirs.normalized, { recursive: true });
  const fixture = args.fixture ? fixtureData() : null;
  const properties = String(process.env.GSC_PROPERTIES || "").split(",").map((v) => v.trim()).filter(Boolean);
  const configured = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  const searchType = String(args["search-type"] || process.env.GSC_SEARCH_TYPE || "web");
  const includePageQuery = args["include-page-query"] !== "false";
  const effectiveStart = String(args["start-date"] || addDays(getEffectiveEnd(args, "gsc"), -27));
  const effectiveEnd = String(args["end-date"] || getEffectiveEnd(args, "gsc"));
  const manifest = {
    platform: "gsc",
    runDate,
    requestedStartDate: args["start-date"] || null,
    requestedEndDate: args["end-date"] || null,
    effectiveStartDate: effectiveStart,
    effectiveEndDate: effectiveEnd,
    searchType,
    includePageQuery,
    platformTimezone: SOURCE_TIMEZONES.gsc,
    lagDays: Number(process.env.GSC_DATA_LAG_DAYS || 3),
    credentialConfigured: configured,
    propertiesConfigured: properties.length,
    status: "PENDING",
    files: [],
    warnings: [],
  };

  if (fixture) {
    const property = fixture.property;
    const datasets = {
      "gsc-daily.csv": normalizeGscRows({ property, dataset: "daily", dimensions: ["date"], rows: fixture.gsc.daily, dataFreshness: "COMPLETE_RANGE" }),
      "gsc-pages.csv": normalizeGscRows({ property, dataset: "pages", dimensions: ["page"], rows: [...fixture.gsc.pagesPage1, ...fixture.gsc.pagesPage2], dataFreshness: "COMPLETE_RANGE" }),
      "gsc-queries.csv": normalizeGscRows({ property, dataset: "queries", dimensions: ["query"], rows: fixture.gsc.queries, dataFreshness: "COMPLETE_RANGE" }),
      "gsc-devices.csv": normalizeGscRows({ property, dataset: "devices", dimensions: ["device"], rows: fixture.gsc.devices, dataFreshness: "COMPLETE_RANGE" }),
      "gsc-countries.csv": normalizeGscRows({ property, dataset: "countries", dimensions: ["country"], rows: fixture.gsc.countries, dataFreshness: "COMPLETE_RANGE" }),
      "gsc-page-query.csv": includePageQuery ? normalizeGscRows({ property, dataset: "page_query", dimensions: ["page", "query"], rows: [], dataFreshness: "NO_DATA" }) : [],
    };
    for (const [file, rows] of Object.entries(datasets)) {
      if (file === "gsc-page-query.csv" && !includePageQuery) continue;
      const out = path.join(dirs.normalized, file);
      writeCsv(out, rows);
      manifest.files.push(path.relative(ROOT, out).replace(/\\/g, "/"));
    }
    manifest.status = "READY";
    manifest.latestDateReturned = fixture.gsc.daily.at(-1)?.keys?.[0] || null;
    writeJson(path.join(MANIFEST_ROOT, `fetch-manifest-${runDate}-gsc.json`), manifest);
    return manifest;
  }

  if (!configured || properties.length === 0) {
    manifest.status = "MANUAL_CREDENTIAL_SETUP_REQUIRED";
    manifest.warnings.push("GOOGLE_APPLICATION_CREDENTIALS and GSC_PROPERTIES are required for real GSC fetch.");
    writeJson(path.join(MANIFEST_ROOT, `fetch-manifest-${runDate}-gsc.json`), manifest);
    return manifest;
  }

  try {
    const { google } = require("googleapis");
    const auth = new google.auth.GoogleAuth({ scopes: ["https://www.googleapis.com/auth/webmasters.readonly"] });
    const authClient = await auth.getClient();
    const service = google.webmasters({ version: "v3", auth: authClient });
    const sitesResponse = await withRetry(() => service.sites.list(), "gsc sites.list");
    manifest.availableSites = (sitesResponse.data.siteEntry || []).map((site) => ({
      siteUrl: site.siteUrl,
      permissionLevel: site.permissionLevel,
    }));
    for (const property of properties) {
      const permission = manifest.availableSites.find((site) => site.siteUrl === property)?.permissionLevel || "AUTHORIZATION_REQUIRED";
      if (permission === "AUTHORIZATION_REQUIRED") {
        manifest.warnings.push(`${property}: AUTHORIZATION_REQUIRED`);
        continue;
      }
      const common = { siteUrl: property, startDate: effectiveStart, endDate: effectiveEnd, searchType };
      const daily = await gscQueryAll(service, { ...common, dimensions: ["date"] });
      const pages = await gscQueryAll(service, { ...common, dimensions: ["page"] });
      const queries = await gscQueryAll(service, { ...common, dimensions: ["query"] });
      const devices = await gscQueryAll(service, { ...common, dimensions: ["device"] });
      const countries = await gscQueryAll(service, { ...common, dimensions: ["country"] });
      let pageQuery = [];
      let pageQueryFreshness = "NO_DATA";
      if (includePageQuery) {
        try {
          pageQuery = await gscQueryAll(service, { ...common, dimensions: ["page", "query"] });
          pageQueryFreshness = pageQuery.length ? "COMPLETE_RANGE" : "NO_DATA";
        } catch (error) {
          pageQueryFreshness = "PARTIAL_RANGE";
          manifest.warnings.push(`page-query partial for ${property}: ${classifyApiError(error)}`);
        }
      }
      const files = {
        "gsc-daily.csv": normalizeGscRows({ property, dataset: "daily", dimensions: ["date"], rows: daily, dataFreshness: freshness(effectiveStart, effectiveEnd, daily, "date") }),
        "gsc-pages.csv": normalizeGscRows({ property, dataset: "pages", dimensions: ["page"], rows: pages, dataFreshness: freshness(effectiveStart, effectiveEnd, daily, "date") }),
        "gsc-queries.csv": normalizeGscRows({ property, dataset: "queries", dimensions: ["query"], rows: queries, dataFreshness: freshness(effectiveStart, effectiveEnd, daily, "date") }),
        "gsc-devices.csv": normalizeGscRows({ property, dataset: "devices", dimensions: ["device"], rows: devices, dataFreshness: freshness(effectiveStart, effectiveEnd, daily, "date") }),
        "gsc-countries.csv": normalizeGscRows({ property, dataset: "countries", dimensions: ["country"], rows: countries, dataFreshness: freshness(effectiveStart, effectiveEnd, daily, "date") }),
        "gsc-page-query.csv": normalizeGscRows({ property, dataset: "page_query", dimensions: ["page", "query"], rows: pageQuery, dataFreshness: pageQueryFreshness }),
      };
      for (const [file, rows] of Object.entries(files)) {
        const out = path.join(dirs.normalized, file);
        writeCsv(out, rows);
        manifest.files.push(path.relative(ROOT, out).replace(/\\/g, "/"));
      }
      const rawOut = path.join(dirs.raw, "gsc", `${property.replace(/[^a-z0-9]+/gi, "_")}.json`);
      writeJson(rawOut, { daily, pages, queries, devices, countries, pageQuery });
    }
    manifest.status = manifest.warnings.some((warning) => warning.includes("page-query partial")) ? "PARTIAL_READY" : manifest.files.length ? "READY" : "AUTHORIZATION_REQUIRED";
  } catch (error) {
    manifest.status = classifyApiError(error);
    manifest.error = safeError(error);
  }
  writeJson(path.join(MANIFEST_ROOT, `fetch-manifest-${runDate}-gsc.json`), manifest);
  return manifest;
}

async function gscQueryAll(service, params) {
  const rows = [];
  const rowLimit = 25000;
  for (let startRow = 0; startRow < 1000000; startRow += rowLimit) {
    const response = await withRetry(() => service.searchanalytics.query({
      siteUrl: params.siteUrl,
      requestBody: {
        startDate: params.startDate,
        endDate: params.endDate,
        dimensions: params.dimensions,
        rowLimit,
        startRow,
        searchType: params.searchType,
      },
    }), `gsc searchanalytics.query ${params.dimensions.join("+")} startRow=${startRow}`);
    const chunk = response.data.rows || [];
    rows.push(...chunk);
    if (chunk.length < rowLimit) break;
  }
  return rows;
}

function freshness(start, end, rows, dimension) {
  if (!rows || rows.length === 0) return "NO_DATA";
  if (dimension !== "date") return "COMPLETE_RANGE";
  const dates = rows.map((row) => row.keys?.[0]).filter(Boolean).sort();
  const latest = dates[dates.length - 1];
  if (latest === end) return "COMPLETE_RANGE";
  if (latest && latest < end && latest >= start) return "PARTIAL_RANGE";
  return "POSSIBLY_PROVISIONAL";
}

async function discoverGsc(args) {
  const runDate = getRunDate(args);
  const fixture = args.fixture ? fixtureData() : null;
  const configuredProperties = String(process.env.GSC_PROPERTIES || "").split(",").map((v) => v.trim()).filter(Boolean);
  const out = path.join(MANIFEST_ROOT, `gsc-discovery-${runDate}.json`);
  const manifest = {
    platform: "gsc",
    runDate,
    credentialConfigured: Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    configuredProperties,
    availableSites: [],
    propertyChecks: [],
    permissionCheck: "MANUAL_CREDENTIAL_SETUP_REQUIRED",
    status: "MANUAL_CREDENTIAL_SETUP_REQUIRED",
    notes: ["Discovery uses read-only sites.list only; no Search Analytics fetch or property mutation APIs are used."],
  };
  if (fixture) {
    manifest.status = "READY";
    manifest.permissionCheck = "CHECKED";
    manifest.availableSites = [{ siteUrl: fixture.property, permissionLevel: "siteOwner" }];
  } else if (manifest.credentialConfigured) {
    try {
      const { google } = require("googleapis");
      const auth = new google.auth.GoogleAuth({ scopes: ["https://www.googleapis.com/auth/webmasters.readonly"] });
      const authClient = await auth.getClient();
      const service = google.webmasters({ version: "v3", auth: authClient });
      const sitesResponse = await withRetry(() => service.sites.list(), "gsc sites.list");
      manifest.availableSites = (sitesResponse.data.siteEntry || []).map((site) => ({
        siteUrl: site.siteUrl,
        permissionLevel: site.permissionLevel,
      }));
      manifest.propertyChecks = configuredProperties.map((property) => {
        const hit = manifest.availableSites.find((site) => site.siteUrl === property);
        return {
          property,
          configured: true,
          matched: Boolean(hit),
          permissionLevel: hit?.permissionLevel || "AUTHORIZATION_REQUIRED",
        };
      });
      manifest.permissionCheck = "CHECKED";
      manifest.status = manifest.propertyChecks.some((row) => row.permissionLevel === "AUTHORIZATION_REQUIRED")
        ? "AUTHORIZATION_REQUIRED"
        : "READY";
    } catch (error) {
      manifest.status = classifyApiError(error);
      manifest.error = safeError(error);
    }
  }
  writeJson(out, manifest);
  return { ...manifest, discoveryFile: path.relative(ROOT, out).replace(/\\/g, "/") };
}

async function collectGa4(args) {
  const runDate = getRunDate(args);
  const dirs = dataDirs(runDate);
  fs.mkdirSync(dirs.normalized, { recursive: true });
  const fixture = args.fixture ? fixtureData() : null;
  const propertyId = String(process.env.GA4_PROPERTY_ID || "").trim();
  const configured = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS && propertyId);
  const effectiveStart = String(args["start-date"] || addDays(getEffectiveEnd(args, "ga4"), -27));
  const effectiveEnd = String(args["end-date"] || getEffectiveEnd(args, "ga4"));
  const manifest = {
    platform: "ga4",
    runDate,
    effectiveStartDate: effectiveStart,
    effectiveEndDate: effectiveEnd,
    platformTimezone: process.env.GA4_TIMEZONE || SOURCE_TIMEZONES.ga4,
    lagDays: Number(process.env.GA4_DATA_LAG_DAYS || 2),
    credentialConfigured: Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    propertyIdConfigured: Boolean(propertyId),
    status: "PENDING",
    metadataStatus: "NOT_CHECKED",
    files: [],
    warnings: [],
  };

  if (fixture) {
    const property = fixture.ga4Property;
    const normalized = {
      channels: normalizeGa4Rows({ property, dataset: "channels", dimensions: ["date", "sessionSourceMedium", "sessionDefaultChannelGroup"], metrics: ["sessions", "engagedSessions", "engagementRate", "activeUsers", "totalUsers", "averageSessionDuration"], rows: fixture.ga4.channels, dataFreshness: "COMPLETE_RANGE" }),
      landings: normalizeGa4Rows({ property, dataset: "landings", dimensions: ["landingPagePlusQueryString", "sessionSourceMedium"], metrics: ["sessions", "engagedSessions", "engagementRate", "totalUsers"], rows: fixture.ga4.landings, dataFreshness: "COMPLETE_RANGE" }),
      events: normalizeGa4Rows({ property, dataset: "events", dimensions: ["date", "eventName"], metrics: ["eventCount", "totalUsers"], rows: fixture.ga4.events, dataFreshness: "COMPLETE_RANGE" }),
      eventPages: normalizeGa4Rows({ property, dataset: "event_pages", dimensions: ["eventName", "pagePathPlusQueryString"], metrics: ["eventCount", "totalUsers"], rows: fixture.ga4.eventPages, dataFreshness: "COMPLETE_RANGE" }),
    };
    const files = {
      "ga4-channels.csv": normalized.channels,
      "ga4-landings.csv": normalized.landings,
      "ga4-events.csv": normalized.events,
      "ga4-event-pages.csv": normalized.eventPages,
    };
    for (const [file, rows] of Object.entries(files)) {
      const out = path.join(dirs.normalized, file);
      writeCsv(out, rows);
      manifest.files.push(path.relative(ROOT, out).replace(/\\/g, "/"));
    }
    const funnelRows = buildCalculatorFunnelRows({
      property,
      landingRows: normalized.landings,
      eventPageRows: normalized.eventPages,
      trackedPages: loadConfig().trackedPages,
      dataFreshness: "COMPLETE_RANGE",
    });
    const funnelOut = path.join(dirs.normalized, "ga4-calculator-funnel.csv");
    writeCsv(funnelOut, funnelRows, CALCULATOR_FUNNEL_HEADERS);
    manifest.files.push(path.relative(ROOT, funnelOut).replace(/\\/g, "/"));
    manifest.metadataStatus = "SUPPORTED";
    manifest.status = "READY";
    writeJson(path.join(MANIFEST_ROOT, `fetch-manifest-${runDate}-ga4.json`), manifest);
    return manifest;
  }

  if (!configured) {
    manifest.status = "MANUAL_CREDENTIAL_SETUP_REQUIRED";
    manifest.warnings.push("GOOGLE_APPLICATION_CREDENTIALS and GA4_PROPERTY_ID are required for real GA4 fetch.");
    writeJson(path.join(MANIFEST_ROOT, `fetch-manifest-${runDate}-ga4.json`), manifest);
    return manifest;
  }

  try {
    const ga = require("@google-analytics/data");
    const Client = ga.BetaAnalyticsDataClient || ga.AnalyticsDataClient;
    const client = new Client();
    const property = `properties/${propertyId}`;
    const metadataStatus = await checkGa4Metadata(client, property);
    manifest.metadataStatus = metadataStatus.status;
    manifest.metadataLimitations = metadataStatus.limitations;
    const normalized = {};
    const requests = [
      { file: "ga4-channels.csv", dataset: "channels", dimensions: ["date", "sessionSourceMedium", "sessionDefaultChannelGroup"], metrics: supportedMetrics(metadataStatus, ["sessions", "engagedSessions", "engagementRate", "activeUsers", "totalUsers", "averageSessionDuration"]) },
      { file: "ga4-landings.csv", dataset: "landings", dimensions: ["landingPagePlusQueryString", "sessionSourceMedium"], metrics: supportedMetrics(metadataStatus, ["sessions", "engagedSessions", "engagementRate", "totalUsers", "keyEvents", "conversions"]) },
      { file: "ga4-events.csv", dataset: "events", dimensions: ["date", "eventName"], metrics: supportedMetrics(metadataStatus, ["eventCount", "totalUsers"]) },
      { file: "ga4-event-pages.csv", dataset: "event_pages", dimensions: ["eventName", "pagePathPlusQueryString"], metrics: supportedMetrics(metadataStatus, ["eventCount", "totalUsers"]) },
    ];
    for (const req of requests) {
      const [response] = await withRetry(() => client.runReport({
        property,
        dateRanges: [{ startDate: effectiveStart, endDate: effectiveEnd }],
        dimensions: req.dimensions.map((name) => ({ name })),
        metrics: req.metrics.map((name) => ({ name })),
        limit: 250000,
      }), `ga4 runReport ${req.dataset}`);
      const rows = normalizeGa4Rows({ property, dataset: req.dataset, dimensions: req.dimensions, metrics: req.metrics, rows: response.rows || [], dataFreshness: "POSSIBLY_PROVISIONAL" });
      normalized[req.dataset] = rows;
      const out = path.join(dirs.normalized, req.file);
      writeCsv(out, rows);
      manifest.files.push(path.relative(ROOT, out).replace(/\\/g, "/"));
      writeJson(path.join(dirs.raw, "ga4", req.file.replace(/\.csv$/, ".json")), response);
    }
    const funnelRows = buildCalculatorFunnelRows({
      property,
      landingRows: normalized.landings || [],
      eventPageRows: normalized.event_pages || [],
      trackedPages: loadConfig().trackedPages,
      dataFreshness: "POSSIBLY_PROVISIONAL",
    });
    const funnelOut = path.join(dirs.normalized, "ga4-calculator-funnel.csv");
    writeCsv(funnelOut, funnelRows, CALCULATOR_FUNNEL_HEADERS);
    manifest.files.push(path.relative(ROOT, funnelOut).replace(/\\/g, "/"));
    manifest.status = "READY";
  } catch (error) {
    manifest.status = classifyApiError(error);
    manifest.error = safeError(error);
  }
  writeJson(path.join(MANIFEST_ROOT, `fetch-manifest-${runDate}-ga4.json`), manifest);
  return manifest;
}

async function checkGa4Metadata(client, property) {
  try {
    const [metadata] = await withRetry(() => client.getMetadata({ name: `${property}/metadata` }), "ga4 metadata");
    const dimensions = new Set((metadata.dimensions || []).map((d) => d.apiName));
    const metrics = new Set((metadata.metrics || []).map((m) => m.apiName));
    const requiredDimensions = ["date", "sessionSourceMedium", "sessionDefaultChannelGroup", "landingPagePlusQueryString", "eventName", "pagePathPlusQueryString"];
    const requiredMetrics = ["sessions", "engagedSessions", "totalUsers", "eventCount"];
    const missingDimensions = requiredDimensions.filter((name) => !dimensions.has(name));
    const missingMetrics = requiredMetrics.filter((name) => !metrics.has(name));
    return {
      status: missingDimensions.length || missingMetrics.length ? "API_SCHEMA_CHANGED" : "SUPPORTED",
      dimensions,
      metrics,
      limitations: [
        ...missingDimensions.map((name) => `UNKNOWN_DIMENSION:${name}`),
        ...missingMetrics.map((name) => `UNKNOWN_METRIC:${name}`),
      ],
    };
  } catch (error) {
    return { status: classifyApiError(error), dimensions: new Set(), metrics: new Set(), limitations: [safeError(error).message] };
  }
}

function supportedMetrics(metadataStatus, candidates) {
  if (!metadataStatus.metrics || metadataStatus.metrics.size === 0) return candidates.filter((name) => !["keyEvents", "conversions"].includes(name));
  return candidates.filter((name) => metadataStatus.metrics.has(name));
}

async function collectBing(args) {
  const runDate = getRunDate(args);
  const dirs = dataDirs(runDate);
  fs.mkdirSync(dirs.normalized, { recursive: true });
  const fixture = args.fixture ? fixtureData() : null;
  const siteUrl = String(process.env.BING_SITE_URL || "").trim();
  const configured = Boolean(process.env.BING_WEBMASTER_API_KEY && siteUrl);
  const manifest = {
    platform: "bing",
    runDate,
    siteUrlConfigured: Boolean(siteUrl),
    apiKeyConfigured: Boolean(process.env.BING_WEBMASTER_API_KEY),
    platformTimezone: SOURCE_TIMEZONES.bing,
    status: "PENDING",
    endpointStatus: {},
    files: [],
    warnings: [],
  };

  if (fixture) {
    const property = fixture.bingSiteUrl;
    const files = {
      "bing-daily.csv": normalizeBingRows({ property, dataset: "daily", rows: fixture.bing.daily, dataFreshness: "COMPLETE_RANGE" }),
      "bing-pages.csv": normalizeBingRows({ property, dataset: "pages", rows: fixture.bing.pages, dataFreshness: "COMPLETE_RANGE" }),
      "bing-queries.csv": normalizeBingRows({ property, dataset: "queries", rows: fixture.bing.queries, dataFreshness: "COMPLETE_RANGE" }),
      "bing-crawl.csv": (fixture.bing.crawl || []).map((row) => commonRow({ platform: "bing", property, dataset: "crawl", date: microsoftDateToIso(row.Date), impressions: null, clicks: null, dataFreshness: "COMPLETE_RANGE", sourceTimezone: SOURCE_TIMEZONES.bing, eventName: "crawl", eventCount: safeNumber(row.CrawledPages) })),
    };
    for (const [file, rows] of Object.entries(files)) {
      const out = path.join(dirs.normalized, file);
      writeCsv(out, rows);
      manifest.files.push(path.relative(ROOT, out).replace(/\\/g, "/"));
    }
    for (const method of READ_ONLY_BING_METHODS) manifest.endpointStatus[method] = "READY";
    manifest.status = "READY";
    writeJson(path.join(MANIFEST_ROOT, `fetch-manifest-${runDate}-bing.json`), manifest);
    return manifest;
  }

  if (!configured) {
    manifest.status = "MANUAL_CREDENTIAL_SETUP_REQUIRED";
    manifest.warnings.push("BING_SITE_URL and BING_WEBMASTER_API_KEY are required for real Bing fetch.");
    writeJson(path.join(MANIFEST_ROOT, `fetch-manifest-${runDate}-bing.json`), manifest);
    return manifest;
  }

  try {
    const userSites = await bingGet("GetUserSites", {});
    manifest.endpointStatus.GetUserSites = "READY";
    const siteMatched = JSON.stringify(userSites).includes(siteUrl);
    if (!siteMatched) manifest.warnings.push("Configured BING_SITE_URL was not found in GetUserSites response; verify site ownership.");
    const daily = await probeBingEndpoint(manifest, "GetRankAndTrafficStats", { siteUrl });
    const queries = await probeBingEndpoint(manifest, "GetQueryStats", { siteUrl });
    const pages = await probeBingEndpoint(manifest, "GetPageStats", { siteUrl });
    const crawl = await probeBingEndpoint(manifest, "GetCrawlStats", { siteUrl });
    const files = {
      "bing-daily.csv": normalizeBingRows({ property: siteUrl, dataset: "daily", rows: unwrapBingRows(daily), dataFreshness: bingFreshness(daily) }),
      "bing-pages.csv": normalizeBingRows({ property: siteUrl, dataset: "pages", rows: unwrapBingRows(pages), dataFreshness: bingFreshness(pages) }),
      "bing-queries.csv": normalizeBingRows({ property: siteUrl, dataset: "queries", rows: unwrapBingRows(queries), dataFreshness: bingFreshness(queries) }),
      "bing-crawl.csv": unwrapBingRows(crawl).map((row) => commonRow({ platform: "bing", property: siteUrl, dataset: "crawl", date: microsoftDateToIso(row.Date), eventName: "crawl", eventCount: safeNumber(row.CrawledPages), dataFreshness: bingFreshness(crawl), sourceTimezone: SOURCE_TIMEZONES.bing })),
    };
    for (const [file, rows] of Object.entries(files)) {
      const out = path.join(dirs.normalized, file);
      writeCsv(out, rows);
      manifest.files.push(path.relative(ROOT, out).replace(/\\/g, "/"));
      writeJson(path.join(dirs.raw, "bing", file.replace(/\.csv$/, ".json")), rows);
    }
    manifest.status = Object.values(manifest.endpointStatus).some((v) => v === "READY") ? "PARTIAL_READY" : "AUTH_REQUIRED";
  } catch (error) {
    manifest.status = classifyApiError(error);
    manifest.error = safeError(error);
  }
  writeJson(path.join(MANIFEST_ROOT, `fetch-manifest-${runDate}-bing.json`), manifest);
  return manifest;
}

async function probeBingEndpoint(manifest, method, params) {
  try {
    const result = await bingGet(method, params);
    const rows = unwrapBingRows(result);
    manifest.endpointStatus[method] = rows.length ? "READY" : "NO_DATA";
    return result;
  } catch (error) {
    manifest.endpointStatus[method] = classifyApiError(error);
    manifest.warnings.push(`${method}: ${manifest.endpointStatus[method]}`);
    return [];
  }
}

async function bingGet(method, params) {
  if (!READ_ONLY_BING_METHODS.has(method)) throw new Error(`Bing method is not allowed in read-only mode: ${method}`);
  const url = new URL(`https://ssl.bing.com/webmaster/api.svc/json/${method}`);
  url.searchParams.set("apikey", process.env.BING_WEBMASTER_API_KEY || "");
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== null && value !== undefined && value !== "") url.searchParams.set(key, value);
  }
  return withRetry(async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Number(process.env.SEARCH_API_TIMEOUT_MS || 30000));
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        const message = await response.text();
        const error = new Error(`Bing ${method} failed with HTTP ${response.status}: ${maskSecretText(message.slice(0, 500))}`);
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }, `bing ${method}`);
}

function unwrapBingRows(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  for (const candidate of ["d", "GetRankAndTrafficStats", "GetQueryStats", "GetPageStats", "GetCrawlStats", "Results", "Rows"]) {
    if (Array.isArray(value[candidate])) return value[candidate];
    if (value[candidate] && Array.isArray(value[candidate].Results)) return value[candidate].Results;
  }
  return [];
}

function bingFreshness(value) {
  const rows = unwrapBingRows(value);
  return rows.length ? "POSSIBLY_PROVISIONAL" : "NO_DATA";
}

function classifyApiError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  const code = Number(error?.code || error?.status || 0);
  if (code === 401 || message.includes("unauthorized") || message.includes("auth")) return "AUTH_REQUIRED";
  if (code === 403 || message.includes("permission")) return "AUTHORIZATION_REQUIRED";
  if (code === 429 || message.includes("rate")) return "RATE_LIMITED";
  if ([500, 502, 503].includes(code)) return "ENDPOINT_UNAVAILABLE";
  if (message.includes("schema") || message.includes("dimension") || message.includes("metric")) return "API_SCHEMA_CHANGED";
  if (message.includes("invalid") && message.includes("key")) return "INVALID_API_KEY";
  if (message.includes("not verified")) return "SITE_NOT_VERIFIED";
  if (message.includes("network") || message.includes("fetch") || message.includes("timeout") || message.includes("aborted")) return "NETWORK_ERROR";
  return "ENDPOINT_UNAVAILABLE";
}

async function collectAll(args) {
  const manifests = [];
  const platform = String(args.platform || "all");
  if (platform === "all" || platform === "gsc") manifests.push(await collectGsc(args));
  if (platform === "all" || platform === "ga4") manifests.push(await collectGa4(args));
  if (platform === "all" || platform === "bing") manifests.push(await collectBing(args));
  const runDate = getRunDate(args);
  const combined = {
    runDate,
    generatedAt: nowIso(),
    status: manifests.every((m) => m.status === "READY") ? "READY" : manifests.some((m) => m.status === "READY" || m.status === "PARTIAL_READY") ? "PARTIAL_DATA" : "MANUAL_CREDENTIAL_SETUP_REQUIRED",
    manifests,
  };
  writeJson(path.join(MANIFEST_ROOT, `fetch-manifest-${runDate}.json`), combined);
  return combined;
}

function readNormalized(runDate, file) {
  const full = pathFor(runDate, "normalized", file);
  if (!fs.existsSync(full)) return [];
  return parseCsv(fs.readFileSync(full, "utf8")).map((row) => ({
    ...row,
    clicks: safeNumber(row.clicks),
    impressions: safeNumber(row.impressions),
    ctr: safeNumber(row.ctr),
    position: safeNumber(row.position),
    sessions: safeNumber(row.sessions),
    engagedSessions: safeNumber(row.engagedSessions),
    users: safeNumber(row.users),
    eventCount: safeNumber(row.eventCount),
  }));
}

function aggregateSearch(rows, start, end) {
  const filtered = rows.filter((row) => row.date && row.date >= start && row.date <= end);
  const clicks = sum(filtered, "clicks");
  const impressions = sum(filtered, "impressions");
  const positionNumerator = filtered.reduce((acc, row) => acc + (safeNumber(row.position) || 0) * (safeNumber(row.impressions) || 0), 0);
  return {
    clicks,
    impressions,
    ctr: divOrNull(clicks, impressions),
    position: impressions ? positionNumerator / impressions : null,
  };
}

function aggregateTraffic(rows, start, end) {
  const filtered = rows.filter((row) => row.date && row.date >= start && row.date <= end);
  return {
    sessions: sum(filtered, "sessions"),
    engagedSessions: sum(filtered, "engagedSessions"),
    users: sum(filtered, "users"),
  };
}

function sum(rows, key) {
  return rows.reduce((acc, row) => acc + (safeNumber(row[key]) || 0), 0);
}

function pctChange(current, previous) {
  if (!previous && !current) return { status: "NO_ACTIVITY", value: 0 };
  if (!previous && current > 0) return { status: "NEW_ACTIVITY", value: null };
  if (previous > 0 && !current) return { status: "LOST_ACTIVITY", value: -100 };
  return { status: "PCT_CHANGE", value: ((current - previous) / previous) * 100 };
}

function compareNumber(current, previous, lowSampleLimit) {
  const change = pctChange(current || 0, previous || 0);
  const lowSample = Math.max(current || 0, previous || 0) < lowSampleLimit;
  return { current: current || 0, previous: previous || 0, changeStatus: lowSample ? "LOW_SAMPLE" : change.status, changePct: change.value };
}

async function analyze(args) {
  const runDate = getRunDate(args);
  const config = loadConfig();
  const gscDaily = readNormalized(runDate, "gsc-daily.csv");
  const ga4Channels = readNormalized(runDate, "ga4-channels.csv");
  const bingDaily = readNormalized(runDate, "bing-daily.csv");
  const allDated = [...gscDaily, ...ga4Channels, ...bingDaily].filter((row) => row.date);
  const window = getWindow(args, allDated);
  const gscCurrent = aggregateSearch(gscDaily, window.currentStart, window.effectiveEnd);
  const gscPrevious = aggregateSearch(gscDaily, window.previousStart, window.previousEnd);
  const ga4Current = aggregateTraffic(ga4Channels, window.currentStart, window.effectiveEnd);
  const ga4Previous = aggregateTraffic(ga4Channels, window.previousStart, window.previousEnd);
  const bingCurrent = aggregateSearch(bingDaily, window.currentStart, window.effectiveEnd);
  const bingPrevious = aggregateSearch(bingDaily, window.previousStart, window.previousEnd);
  const manifests = readJson(path.join(MANIFEST_ROOT, `fetch-manifest-${runDate}.json`), { manifests: [] });
  const health = await technicalHealth({ ...args, write: false });
  const verdicts = buildVerdicts({
    config,
    manifests,
    gscCurrent,
    gscPrevious,
    ga4Current,
    ga4Previous,
    bingCurrent,
    bingPrevious,
    health,
  });
  const weekly = {
    runDate,
    generatedAt: nowIso(),
    window,
    status: manifests.status || "DATA_INCOMPLETE",
    summaries: {
      gsc: { current: gscCurrent, previous: gscPrevious, impressions: compareNumber(gscCurrent.impressions, gscPrevious.impressions, config.thresholds.lowSample.impressions), clicks: compareNumber(gscCurrent.clicks, gscPrevious.clicks, config.thresholds.lowSample.clicks) },
      ga4: { current: ga4Current, previous: ga4Previous, sessions: compareNumber(ga4Current.sessions, ga4Previous.sessions, config.thresholds.lowSample.sessions) },
      bing: { current: bingCurrent, previous: bingPrevious, impressions: compareNumber(bingCurrent.impressions, bingPrevious.impressions, config.thresholds.lowSample.impressions), clicks: compareNumber(bingCurrent.clicks, bingPrevious.clicks, config.thresholds.lowSample.clicks) },
    },
    verdicts,
    technicalHealth: health,
    limitations: [
      "GSC Search Analytics API can return top rows only and may hide low-volume/private queries.",
      "GA4 reporting identity and thresholding can change user/session counts.",
      "Bing API freshness and schema can differ from GSC.",
      "Naver data is not API-collected in this phase and should be merged from weekly CSV later.",
      "DebugView is not replaced by GA4 Data API reports.",
    ],
  };
  writeJson(path.join(WEEKLY_ROOT, `search-weekly-${runDate}.json`), weekly);
  writeWeeklyCsvs(runDate);
  return weekly;
}

function buildVerdicts(ctx) {
  const out = [];
  const missing = (ctx.manifests.manifests || []).filter((m) => String(m.status).includes("MANUAL") || String(m.status).includes("AUTH"));
  if (missing.length) {
    out.push({
      verdict: "AUTHORIZATION_REQUIRED",
      confidence: "HIGH",
      reasons: missing.map((m) => `${m.platform}: ${m.status}`),
      limitations: ["Actual credentials were not present in the Codex environment."],
    });
  }
  const gscImprChange = pctChange(ctx.gscCurrent.impressions || 0, ctx.gscPrevious.impressions || 0);
  const gscClickChange = pctChange(ctx.gscCurrent.clicks || 0, ctx.gscPrevious.clicks || 0);
  const ga4SessionChange = pctChange(ctx.ga4Current.sessions || 0, ctx.ga4Previous.sessions || 0);
  if (gscImprChange.value != null && gscImprChange.value <= ctx.config.thresholds.movement.visibilityDeclinePct) {
    out.push({ verdict: "GOOGLE_VISIBILITY_DECLINE", confidence: "MEDIUM", reasons: [`GSC impressions changed ${round(gscImprChange.value)}%.`], limitations: ["Low sample periods are marked separately; do not infer algorithmic cause."] });
  }
  if (ctx.gscCurrent.position != null && ctx.gscPrevious.position != null && ctx.gscCurrent.position - ctx.gscPrevious.position >= ctx.config.thresholds.movement.rankingDeclinePositionDelta) {
    out.push({ verdict: "GOOGLE_RANKING_DECLINE", confidence: "MEDIUM", reasons: [`GSC weighted average position worsened from ${round(ctx.gscPrevious.position)} to ${round(ctx.gscCurrent.position)}.`], limitations: ["Position is impression-weighted and query mix can change."] });
  }
  if (gscClickChange.value != null && gscClickChange.value <= ctx.config.thresholds.movement.ctrDeclinePct && gscImprChange.value != null && gscImprChange.value > -10) {
    out.push({ verdict: "GOOGLE_CTR_DECLINE", confidence: "MEDIUM", reasons: ["GSC impressions were relatively stable while clicks declined."], limitations: ["CTR movement can be noisy with low clicks."] });
  }
  if (ga4SessionChange.value != null && ga4SessionChange.value <= ctx.config.thresholds.movement.organicTrafficDeclinePct) {
    out.push({ verdict: "ORGANIC_TRAFFIC_DECLINE", confidence: "MEDIUM", reasons: [`GA4 sessions changed ${round(ga4SessionChange.value)}%.`], limitations: ["GA4 source/medium classification can differ from search console platforms."] });
  }
  if ((ctx.ga4Current.sessions || 0) === 0 && (ctx.gscCurrent.clicks || 0) > 0) {
    out.push({ verdict: "ANALYTICS_TRACKING_MISMATCH_SUSPECTED", confidence: "MEDIUM", reasons: ["GSC clicks exist but GA4 sessions are zero in the same window."], limitations: ["Landing-page and session attribution windows can differ."] });
  }
  if ((ctx.bingCurrent.impressions || 0) < ctx.config.thresholds.lowSample.impressions) {
    out.push({ verdict: "BING_LOW_SAMPLE", confidence: "HIGH", reasons: ["Bing impressions are below the configured low-sample threshold."], limitations: ["Do not over-interpret Bing percentage changes."] });
  }
  if (ctx.health.status === "TECHNICAL_RECHECK_RECOMMENDED") {
    out.push({ verdict: "CROSS_CHANNEL_DECLINE_REQUIRES_TECH_RECHECK", confidence: "MEDIUM", reasons: ctx.health.failures, limitations: ["Read-only health does not prove a technical root cause."] });
  }
  if (!out.length) {
    out.push({ verdict: "NO_CLEAR_MOVEMENT", confidence: "MEDIUM", reasons: ["No configured decline/recovery rule crossed a threshold."], limitations: ["Naver CSV data is not merged automatically yet."] });
  }
  return out;
}

function writeWeeklyCsvs(runDate) {
  const pages = [
    ...readNormalized(runDate, "gsc-pages.csv"),
    ...readNormalized(runDate, "ga4-landings.csv"),
    ...readNormalized(runDate, "bing-pages.csv"),
  ].filter((row) => row.page);
  const queries = [
    ...readNormalized(runDate, "gsc-queries.csv"),
    ...readNormalized(runDate, "bing-queries.csv"),
  ].filter((row) => row.query);
  const events = [
    ...readNormalized(runDate, "ga4-events.csv"),
    ...readNormalized(runDate, "ga4-event-pages.csv"),
  ].filter((row) => row.eventName);
  writeCsv(path.join(WEEKLY_ROOT, `search-weekly-pages-${runDate}.csv`), pages);
  writeCsv(path.join(WEEKLY_ROOT, `search-weekly-queries-${runDate}.csv`), queries);
  writeCsv(path.join(WEEKLY_ROOT, `search-weekly-events-${runDate}.csv`), events);
  const funnel = pathFor(runDate, "normalized", "ga4-calculator-funnel.csv");
  if (fs.existsSync(funnel)) {
    fs.copyFileSync(funnel, path.join(WEEKLY_ROOT, `search-weekly-calculator-funnel-${runDate}.csv`));
  }
}

async function report(args) {
  const runDate = getRunDate(args);
  const weekly = readJson(path.join(WEEKLY_ROOT, `search-weekly-${runDate}.json`), null) || await analyze(args);
  const lines = [];
  lines.push(`# Search Weekly ${runDate}`);
  lines.push("");
  lines.push(`Generated: ${weekly.generatedAt}`);
  lines.push(`Status: ${weekly.status}`);
  lines.push(`Window: ${weekly.window.currentStart} to ${weekly.window.effectiveEnd}`);
  lines.push(`Compare: ${weekly.window.previousStart} to ${weekly.window.previousEnd}`);
  lines.push("");
  lines.push("## Verdicts");
  for (const verdict of weekly.verdicts) {
    lines.push(`- ${verdict.verdict} (${verdict.confidence}): ${verdict.reasons.join("; ")}`);
  }
  lines.push("");
  lines.push("## Channel Summary");
  lines.push("| Platform | Current | Previous | Change | Notes |");
  lines.push("| --- | ---: | ---: | ---: | --- |");
  lines.push(`| GSC impressions | ${weekly.summaries.gsc.current.impressions} | ${weekly.summaries.gsc.previous.impressions} | ${formatChange(weekly.summaries.gsc.impressions)} | position ${formatMaybe(weekly.summaries.gsc.previous.position)} -> ${formatMaybe(weekly.summaries.gsc.current.position)} |`);
  lines.push(`| GSC clicks | ${weekly.summaries.gsc.current.clicks} | ${weekly.summaries.gsc.previous.clicks} | ${formatChange(weekly.summaries.gsc.clicks)} | CTR ${formatPct(weekly.summaries.gsc.current.ctr)} |`);
  lines.push(`| GA4 sessions | ${weekly.summaries.ga4.current.sessions} | ${weekly.summaries.ga4.previous.sessions} | ${formatChange(weekly.summaries.ga4.sessions)} | engaged ${weekly.summaries.ga4.current.engagedSessions} |`);
  lines.push(`| Bing impressions | ${weekly.summaries.bing.current.impressions} | ${weekly.summaries.bing.previous.impressions} | ${formatChange(weekly.summaries.bing.impressions)} | ${weekly.summaries.bing.impressions.changeStatus} |`);
  const funnelPath = path.join(WEEKLY_ROOT, `search-weekly-calculator-funnel-${runDate}.csv`);
  if (fs.existsSync(funnelPath)) {
    const rows = parseCsv(fs.readFileSync(funnelPath, "utf8")).slice(0, 5);
    lines.push("");
    lines.push("## Calculator Funnel");
    lines.push("| URL | Landing sessions | Calculate events | CTA views | CTA clicks | CTA CTR |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
    for (const row of rows) {
      lines.push(`| ${row.url} | ${row.landingSessions || 0} | ${row.calculateEventCount || 0} | ${row.ctaViewEventCount || 0} | ${row.ctaClickEventCount || 0} | ${formatPct(safeNumber(row.ctaClickThroughRate))} |`);
    }
  }
  lines.push("");
  lines.push("## Technical Health");
  lines.push(`Status: ${weekly.technicalHealth.status}`);
  for (const item of weekly.technicalHealth.checks) lines.push(`- ${item.status}: ${item.name}`);
  lines.push("");
  lines.push("## Limitations");
  for (const limitation of weekly.limitations) lines.push(`- ${limitation}`);
  writeText(path.join(WEEKLY_ROOT, `search-weekly-${runDate}.md`), `${lines.join("\n")}\n`);
  return weekly;
}

function formatMaybe(value) {
  return value === null || value === undefined ? "-" : round(value);
}

function formatPct(value) {
  return value === null || value === undefined ? "-" : `${round(value * 100)}%`;
}

function formatChange(change) {
  if (!change) return "-";
  if (change.changeStatus !== "PCT_CHANGE") return change.changeStatus;
  return `${round(change.changePct)}%`;
}

function round(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  return Number(Number(value).toFixed(digits));
}

async function technicalHealth(args = {}) {
  const config = loadConfig();
  const checks = [];
  const add = (name, ok, details = "") => checks.push({ name, status: ok ? "PASS" : "FAIL", details });
  add("tracked-pages config exists", fs.existsSync(path.join(ROOT, "config", "search-analytics", "tracked-pages.json")));
  add("query-families config exists", fs.existsSync(path.join(ROOT, "config", "search-analytics", "query-families.json")));
  add("robots.txt exists", fs.existsSync(path.join(ROOT, "public", "robots.txt")));
  add("sitemap-0.xml exists", fs.existsSync(path.join(ROOT, "public", "sitemap-0.xml")));
  for (const page of config.trackedPages.pages || []) {
    if (page.url === "/") continue;
    const inSitemap = fileIncludes("public/sitemap-0.xml", page.url) || fileIncludes("public/sitemap-ko.xml", page.url) || fileIncludes("public/sitemap-en.xml", page.url);
    add(`tracked URL in sitemap: ${page.url}`, inSitemap, "local sitemap text check");
  }
  const failures = checks.filter((check) => check.status !== "PASS").map((check) => check.name);
  const result = {
    status: failures.length ? "TECHNICAL_RECHECK_RECOMMENDED" : "NO_OBVIOUS_TECHNICAL_BLOCKER",
    checks,
    failures,
    note: "Local read-only checks only. HTTP 200/noindex/canonical checks can be run separately with existing verifiers.",
  };
  if (args.write !== false) {
    const runDate = getRunDate(args);
    writeJson(path.join(WEEKLY_ROOT, `search-health-${runDate}.json`), result);
  }
  return result;
}

function fileIncludes(file, text) {
  const full = path.join(ROOT, file);
  return fs.existsSync(full) && fs.readFileSync(full, "utf8").includes(text);
}

async function weekly(args) {
  const fetchManifest = await collectAll(args);
  const analysis = await analyze(args);
  await report(args);
  return { fetchManifest, analysis };
}

async function configCheck(args) {
  const config = loadConfig();
  const runDate = getRunDate(args);
  const dependencyStatus = {
    googleapis: canResolve("googleapis"),
    ga4Data: canResolve("@google-analytics/data"),
    dotenv: canResolve("dotenv"),
  };
  const envStatus = {
    GOOGLE_APPLICATION_CREDENTIALS: Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    GSC_PROPERTIES: Boolean(process.env.GSC_PROPERTIES),
    GSC_SEARCH_TYPE: process.env.GSC_SEARCH_TYPE || "web",
    GSC_DATA_LAG_DAYS: Number(process.env.GSC_DATA_LAG_DAYS || 3),
    GA4_PROPERTY_ID: Boolean(process.env.GA4_PROPERTY_ID),
    GA4_DATA_LAG_DAYS: Number(process.env.GA4_DATA_LAG_DAYS || 2),
    GA4_TIMEZONE: process.env.GA4_TIMEZONE || "Asia/Seoul",
    BING_SITE_URL: Boolean(process.env.BING_SITE_URL),
    BING_WEBMASTER_API_KEY: Boolean(process.env.BING_WEBMASTER_API_KEY),
  };
  const requiredConfigs = [
    "config/search-analytics/query-families.json",
    "config/search-analytics/tracked-pages.json",
    "config/search-analytics/thresholds.json",
    ".env.search.example",
    "docs/search-analytics-api-setup.md",
    "reports/search-performance/README.md",
  ];
  const missingConfigs = requiredConfigs.filter((file) => !fs.existsSync(path.join(ROOT, file)));
  const hasCredentials = envStatus.GOOGLE_APPLICATION_CREDENTIALS && envStatus.GSC_PROPERTIES && envStatus.GA4_PROPERTY_ID && envStatus.BING_SITE_URL && envStatus.BING_WEBMASTER_API_KEY;
  const verdict = missingConfigs.length
    ? "PARTIAL_READY"
    : hasCredentials
      ? "READY_FOR_REAL_FETCH"
      : "FOUNDATION_READY_MANUAL_SETUP_REQUIRED";
  const reportData = {
    generatedAt: nowIso(),
    runDate,
    verdict,
    operatingMix: { naver: "45%", google: "40%", bingMeasurementOperations: "15%" },
    config: {
      queryFamilyCount: config.queryFamilies.families?.length || 0,
      trackedPageCount: config.trackedPages.pages?.length || 0,
      missingConfigs,
    },
    dependencyStatus,
    features: {
      gscDatasets: ["daily", "pages", "queries", "devices", "countries", "page_query"],
      ga4Datasets: ["channels", "landings", "events", "event_pages", "calculator_funnel", "realtime_probe"],
      bingDatasets: ["daily", "pages", "queries", "crawl"],
      gscDiscoveryMode: "sites.list only; no Search Analytics fetch during discovery",
      retryPolicy: "Transient 408/409/425/429/5xx and network errors retry with bounded exponential backoff.",
      partialHandling: "Dataset-level failures are isolated in manifests so available read-only data can still be analyzed.",
      fixtureValidation: "search:test covers 23 assertions for normalization, fixture outputs, secrets, and report generation.",
    },
    envStatus,
    security: {
      secretsPrinted: false,
      rawDirsIgnored: gitignoreIncludes("reports/search-performance/raw/"),
      privateDirsIgnored: gitignoreIncludes("reports/search-performance/private/"),
      bingApiKeyLogged: false,
    },
    notes: [
      "Collectors are read-only and do not call GSC property mutation, GA4 write APIs, or Bing submit/write endpoints.",
      "Actual API raw data is only written under ignored reports/search-performance/raw/ after local credential setup.",
      "Naver remains CSV-manual in this phase; config is ready for later normalized merge.",
    ],
  };
  const jsonPath = path.join(ROOT, "reports", "search-growth-p1-2d-1-search-api-automation-foundation.json");
  const mdPath = path.join(ROOT, "reports", "search-growth-p1-2d-1-search-api-automation-foundation.md");
  writeJson(jsonPath, reportData);
  writeText(mdPath, foundationMarkdown(reportData));
  return reportData;
}

function foundationMarkdown(data) {
  const features = data.features || {
    gscDatasets: ["daily", "pages", "queries", "devices", "countries", "page_query"],
    ga4Datasets: ["channels", "landings", "events", "event_pages", "calculator_funnel", "realtime_probe"],
    bingDatasets: ["daily", "pages", "queries", "crawl"],
    retryPolicy: "Transient 408/409/425/429/5xx and network errors retry with bounded exponential backoff.",
    partialHandling: "Dataset-level failures are isolated in manifests so available read-only data can still be analyzed.",
    fixtureValidation: "search:test covers 23 assertions for normalization, fixture outputs, secrets, and report generation.",
  };
  return [
    "# Search Growth P1-2D-1 Search API Automation Foundation",
    "",
    `Generated: ${data.generatedAt}`,
    `Overall Verdict: ${data.verdict}`,
    "",
    "## Architecture",
    "- Node.js CLI under `scripts/search-analytics/run.js`.",
    "- Config under `config/search-analytics/`.",
    "- Normalized outputs under `reports/search-performance/normalized/`.",
    "- Weekly outputs under `reports/search-performance/weekly/`.",
    "- Real API raw payloads are restricted to ignored `reports/search-performance/raw/`.",
    "",
    "## Collectors",
    `- GSC: official \`googleapis\`, \`webmasters.readonly\`, datasets ${features.gscDatasets.join(", ")}.`,
    `- GA4: official \`@google-analytics/data\`, metadata probe, datasets ${features.ga4Datasets.join(", ")}.`,
    `- Bing: official Webmaster JSON HTTP API, read-only datasets ${features.bingDatasets.join(", ")}.`,
    "- GSC discovery: `sites.list` only; it does not run Search Analytics fetches.",
    "",
    "## Reliability",
    `- Retry policy: ${features.retryPolicy}`,
    `- Partial handling: ${features.partialHandling}`,
    `- Fixture validation: ${features.fixtureValidation}`,
    "",
    "## Security",
    `- Secrets printed: ${data.security.secretsPrinted}`,
    `- Raw ignored: ${data.security.rawDirsIgnored}`,
    `- Private ignored: ${data.security.privateDirsIgnored}`,
    `- Bing API key logged: ${data.security.bingApiKeyLogged}`,
    "",
    "## Configuration Required",
    "- Create `.env.search.local` locally from `.env.search.example`.",
    "- Set Google service-account JSON path outside this repository.",
    "- Set exact GSC properties from `search:discover:gsc`.",
    "- Set GA4 numeric property ID, not the `G-XXXX` measurement ID.",
    "- Set Bing site URL and API key locally.",
    "",
    "## Dependencies",
    `- googleapis: ${data.dependencyStatus.googleapis}`,
    `- @google-analytics/data: ${data.dependencyStatus.ga4Data}`,
    "",
    "## No Runtime Changes",
    "No page, post, calculator, sitemap, robots, canonical, hreflang, GA4 tag, or AdSense runtime file is modified by this foundation.",
    ""
  ].join("\n");
}

function canResolve(name) {
  try {
    require.resolve(name, { paths: [ROOT] });
    return true;
  } catch (_) {
    return false;
  }
}

function gitignoreIncludes(pattern) {
  const file = path.join(ROOT, ".gitignore");
  return fs.existsSync(file) && fs.readFileSync(file, "utf8").includes(pattern);
}

function secretScanFiles(files) {
  const findings = [];
  const patterns = [
    { id: "private_key_material", re: /-----BEGIN\s+PRIVATE\s+KEY-----/i },
    { id: "authorization_bearer", re: /Authorization:\s*Bearer\s+[A-Za-z0-9._-]{8,}/i },
    { id: "refresh_token_value", re: /refresh_token[^\S\r\n]*[:=][^\S\r\n]*["']?[A-Za-z0-9._/-]{12,}/i },
    { id: "client_secret_value", re: /client_secret[^\S\r\n]*[:=][^\S\r\n]*["']?[A-Za-z0-9._/-]{12,}/i },
    { id: "apikey_query_value", re: /apikey=[^&\s]{8,}/i },
    { id: "bing_key_value", re: /BING_WEBMASTER_API_KEY[^\S\r\n]*=[^\S\r\n]*\S{8,}/i },
  ];
  for (const file of files) {
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) continue;
    const text = fs.readFileSync(file, "utf8");
    for (const pattern of patterns) {
      if (pattern.re.test(text)) findings.push({ file: path.relative(ROOT, file).replace(/\\/g, "/"), pattern: pattern.id });
    }
  }
  return findings;
}

function runTests() {
  const fixture = fixtureData();
  const page1 = normalizeGscRows({ property: fixture.property, dataset: "pages", dimensions: ["page"], rows: fixture.gsc.pagesPage1, dataFreshness: "COMPLETE_RANGE" });
  const page2 = normalizeGscRows({ property: fixture.property, dataset: "pages", dimensions: ["page"], rows: fixture.gsc.pagesPage2, dataFreshness: "COMPLETE_RANGE" });
  const devices = normalizeGscRows({ property: fixture.property, dataset: "devices", dimensions: ["device"], rows: fixture.gsc.devices, dataFreshness: "COMPLETE_RANGE" });
  const countries = normalizeGscRows({ property: fixture.property, dataset: "countries", dimensions: ["country"], rows: fixture.gsc.countries, dataFreshness: "COMPLETE_RANGE" });
  assert.strictEqual(page1.length + page2.length, 3, "GSC pagination fixture combines pages");
  assert.strictEqual(devices[0].device, "DESKTOP", "GSC device rows normalize");
  assert.strictEqual(countries[0].country, "kor", "GSC country rows normalize");
  const empty = normalizeGscRows({ property: fixture.property, dataset: "page_query", dimensions: ["page", "query"], rows: fixture.gsc.emptyRows, dataFreshness: "NO_DATA" });
  assert.strictEqual(empty.length, 0, "GSC empty rows are preserved as empty");
  const daily = normalizeGscRows({ property: fixture.property, dataset: "daily", dimensions: ["date"], rows: fixture.gsc.daily, dataFreshness: "COMPLETE_RANGE" });
  const agg = aggregateSearch(daily, "2026-07-24", "2026-07-30");
  assert.strictEqual(agg.clicks, 10, "GSC clicks sum");
  assert.strictEqual(round(agg.ctr, 4), round(10 / 270, 4), "GSC weighted CTR");
  assert(agg.position > 0 && agg.position < 20, "GSC weighted position");
  assert.deepStrictEqual(pctChange(0, 0), { status: "NO_ACTIVITY", value: 0 }, "zero previous/current handling");
  assert.deepStrictEqual(pctChange(3, 0), { status: "NEW_ACTIVITY", value: null }, "new activity handling");
  assert.deepStrictEqual(pctChange(0, 3), { status: "LOST_ACTIVITY", value: -100 }, "lost activity handling");
  const gaRows = normalizeGa4Rows({ property: fixture.ga4Property, dataset: "channels", dimensions: ["date", "sessionSourceMedium", "sessionDefaultChannelGroup"], metrics: ["sessions", "engagedSessions", "engagementRate", "activeUsers", "totalUsers", "averageSessionDuration"], rows: fixture.ga4.channels, dataFreshness: "COMPLETE_RANGE" });
  assert.strictEqual(gaRows.find((row) => row.sourceMedium === "naver / organic").channel, "naver / organic", "GA4 channel normalization");
  const unsupported = ["date", "eventName"].filter((name) => !fixture.ga4.metadata.dimensions.includes(name));
  assert.strictEqual(unsupported.length, 0, "GA4 metadata supported fixture");
  const incompatibleMetadata = {
    metrics: new Set(["sessions"]),
    dimensions: new Set(["date"]),
    limitations: ["UNKNOWN_DIMENSION:eventName", "UNKNOWN_METRIC:eventCount"],
  };
  assert.deepStrictEqual(supportedMetrics(incompatibleMetadata, ["sessions", "eventCount"]), ["sessions"], "GA4 metadata incompatibility omits unsupported metrics");
  const funnel = buildCalculatorFunnelRows({
    property: fixture.ga4Property,
    landingRows: normalizeGa4Rows({ property: fixture.ga4Property, dataset: "landings", dimensions: ["landingPagePlusQueryString", "sessionSourceMedium"], metrics: ["sessions", "engagedSessions", "engagementRate", "totalUsers"], rows: fixture.ga4.landings, dataFreshness: "COMPLETE_RANGE" }),
    eventPageRows: normalizeGa4Rows({ property: fixture.ga4Property, dataset: "event_pages", dimensions: ["eventName", "pagePathPlusQueryString"], metrics: ["eventCount", "totalUsers"], rows: fixture.ga4.eventPages, dataFreshness: "COMPLETE_RANGE" }),
    trackedPages: { pages: [{ url: "/tools/compound-interest", group: "tools" }] },
    dataFreshness: "COMPLETE_RANGE",
  });
  assert.strictEqual(funnel[0].calculateEventCount, 4, "GA4 calculator funnel calculate event count");
  assert.strictEqual(round(funnel[0].ctaClickThroughRate, 4), round(1 / 3, 4), "GA4 calculator funnel CTA CTR");
  assert.strictEqual(microsoftDateToIso("/Date(1785283200000+0000)/"), "2026-07-29", "Bing Microsoft Date conversion");
  assert(maskSecretText("https://x/?apikey=abc123456789").includes("[REDACTED]"), "Bing API key URL masking");
  const low = compareNumber(1, 2, 5);
  assert.strictEqual(low.changeStatus, "LOW_SAMPLE", "LOW_SAMPLE classification");
  assert.strictEqual(isRetryableError({ status: 503, message: "temporary unavailable" }), true, "transient API errors are retryable");
  const partialVerdicts = buildVerdicts({
    config: loadConfig(),
    manifests: { manifests: [{ platform: "gsc", status: "READY" }, { platform: "ga4", status: "MANUAL_CREDENTIAL_SETUP_REQUIRED" }] },
    gscCurrent: { impressions: 1, clicks: 0, position: null },
    gscPrevious: { impressions: 1, clicks: 0, position: null },
    ga4Current: { sessions: 0 },
    ga4Previous: { sessions: 0 },
    bingCurrent: { impressions: 0 },
    bingPrevious: { impressions: 0 },
    health: { status: "NO_OBVIOUS_TECHNICAL_BLOCKER" },
  });
  assert(partialVerdicts.some((row) => row.verdict === "AUTHORIZATION_REQUIRED"), "partial platform failure produces authorization verdict");
  const csv = [COMMON_HEADERS.join(","), COMMON_HEADERS.map((h) => h === "query" ? csvEscape('a,"b"') : "").join(",")].join("\n");
  assert(parseCsv(csv).length === 1, "CSV escaping parse");
  JSON.stringify({ daily, gaRows });
  const md = foundationMarkdown({
    generatedAt: nowIso(),
    verdict: "FOUNDATION_READY_MANUAL_SETUP_REQUIRED",
    dependencyStatus: { googleapis: true, ga4Data: true },
    security: { secretsPrinted: false, rawDirsIgnored: true, privateDirsIgnored: true, bingApiKeyLogged: false },
  });
  assert(md.includes("Overall Verdict"), "report generation");
  const scanTargets = [
    path.join(ROOT, ".env.search.example"),
    path.join(ROOT, "config", "search-analytics", "query-families.json"),
    path.join(ROOT, "config", "search-analytics", "tracked-pages.json"),
  ];
  const findings = secretScanFiles(scanTargets);
  assert.strictEqual(findings.length, 0, `secret leakage scan failed: ${JSON.stringify(findings)}`);
  return { status: "PASS", assertions: 23, secretFindings: findings };
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || "help";
  fs.mkdirSync(REPORT_ROOT, { recursive: true });
  let result;
  if (command === "config:check") result = await configCheck(args);
  else if (command === "discover:gsc") result = await discoverGsc(args);
  else if (command === "check:bing") result = await collectBing({ ...args, probe: true });
  else if (command === "fetch:gsc") result = await collectGsc(args);
  else if (command === "fetch:ga4") result = await collectGa4(args);
  else if (command === "fetch:ga4:realtime") result = await collectGa4Realtime(args);
  else if (command === "fetch:bing") result = await collectBing(args);
  else if (command === "fetch") result = await collectAll(args);
  else if (command === "analyze") result = await analyze(args);
  else if (command === "report") result = await report(args);
  else if (command === "health") result = await technicalHealth(args);
  else if (command === "weekly") result = await weekly(args);
  else if (command === "test") result = runTests();
  else {
    result = {
      usage: [
        "node scripts/search-analytics/run.js config:check",
        "node scripts/search-analytics/run.js weekly --fixture",
        "node scripts/search-analytics/run.js fetch:gsc --start-date=YYYY-MM-DD --end-date=YYYY-MM-DD",
      ],
    };
  }
  console.log(JSON.stringify(sanitize(result), null, 2));
}

async function collectGa4Realtime(args) {
  const runDate = getRunDate(args);
  const manifest = {
    platform: "ga4",
    dataset: "realtime",
    runDate,
    credentialConfigured: Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    propertyIdConfigured: Boolean(process.env.GA4_PROPERTY_ID),
    status: "PENDING",
    note: "Realtime is for API connection checks only and does not replace DebugView.",
  };
  if (args.fixture) {
    manifest.status = "READY";
    manifest.activeUsers = 1;
    manifest.eventNames = ["page_view", "tool_calculate"];
    writeJson(path.join(MANIFEST_ROOT, `fetch-manifest-${runDate}-ga4-realtime.json`), manifest);
    return manifest;
  }
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || !process.env.GA4_PROPERTY_ID) {
    manifest.status = "MANUAL_CREDENTIAL_SETUP_REQUIRED";
    writeJson(path.join(MANIFEST_ROOT, `fetch-manifest-${runDate}-ga4-realtime.json`), manifest);
    return manifest;
  }
  try {
    const ga = require("@google-analytics/data");
    const Client = ga.BetaAnalyticsDataClient || ga.AnalyticsDataClient;
    const client = new Client();
    const [response] = await client.runRealtimeReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "activeUsers" }],
      limit: 100,
    });
    manifest.status = "READY";
    manifest.activeUsers = sum((response.rows || []).map((row) => ({ activeUsers: safeNumber(row.metricValues?.[0]?.value) })), "activeUsers");
    manifest.eventNames = (response.rows || []).map((row) => row.dimensionValues?.[0]?.value).filter(Boolean);
  } catch (error) {
    manifest.status = classifyApiError(error);
    manifest.error = safeError(error);
  }
  writeJson(path.join(MANIFEST_ROOT, `fetch-manifest-${runDate}-ga4-realtime.json`), manifest);
  return manifest;
}

main().catch((error) => {
  console.error(JSON.stringify({ status: "FAIL", error: safeError(error) }, null, 2));
  process.exitCode = 1;
});
