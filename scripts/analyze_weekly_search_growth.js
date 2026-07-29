const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DEFAULT_CURRENT_DIR = "reports/search-weekly-input/2026-07-22_2026-07-28";
const DEFAULT_PREVIOUS_DIR = "reports/search-weekly-input/2026-07-15_2026-07-21";
const DEFAULT_OUTPUT_MD = "reports/search-growth-weekly-2026-07-22_2026-07-28.md";
const DEFAULT_OUTPUT_JSON = "reports/search-growth-weekly-2026-07-22_2026-07-28.json";
const PAGE_LOSS_OUTPUT = "reports/search-growth-weekly-gsc-page-loss.csv";
const QUERY_LOSS_OUTPUT = "reports/search-growth-weekly-gsc-query-loss.csv";
const PATH_LOSS_OUTPUT = "reports/search-growth-weekly-gsc-path-loss.csv";
const QUERY_FAMILY_LOSS_OUTPUT = "reports/search-growth-weekly-gsc-query-family-loss.csv";
const CALCULATOR_LOSS_OUTPUT = "reports/search-growth-weekly-gsc-calculator-loss.csv";
const INPUT_DIAGNOSTICS_OUTPUT = "reports/search-growth-weekly-gsc-input-diagnostics.json";
const DEPLOY_DECISION_OUTPUT = "reports/search-growth-weekly-gsc-deploy-decision.json";
const FOLLOW_UP_TARGETS_OUTPUT = "reports/search-growth-weekly-gsc-follow-up-targets.json";
const NEXT_ACTIONS_OUTPUT = "reports/search-growth-weekly-next-actions.json";

const REQUIRED_BASELINE_FILES = [
  "reports/search-growth-90d-p1-1a-performance-merged.csv",
  "reports/search-growth-90d-p1-1a-query-map.csv",
  "reports/search-growth-90d-p1-1a-daily-merged.csv",
  "reports/search-growth-90d-p1-1a-priority.json",
  "reports/search-growth-90d-p1-1a-search-performance-audit.md",
  "reports/search-growth-90d-p1-1a-2-priority-calibration.md",
  "reports/search-growth-90d-p1-1a-2-execution-targets.json",
  "reports/search-growth-90d-p1-1b-1-ko-naver-low-risk-expansion.md",
  "reports/search-growth-90d-p1-1b-2-en-search-experiment.md",
  "reports/search-growth-90d-p1-1c-observation-baseline.json",
  "reports/search-growth-90d-p1-1c-2-final-deploy-decision.md",
];

const GSC_CSV_NAMES = {
  recentPages: "gsc-recent-pages.csv",
  previousPages: "gsc-previous-pages.csv",
  recentQueries: "gsc-recent-queries.csv",
  previousQueries: "gsc-previous-queries.csv",
  recentCountries: "gsc-recent-countries.csv",
  previousCountries: "gsc-previous-countries.csv",
  recentDevices: "gsc-recent-devices.csv",
  previousDevices: "gsc-previous-devices.csv",
  recentSearchAppearance: "gsc-recent-search-appearance.csv",
  previousSearchAppearance: "gsc-previous-search-appearance.csv",
};

const FIELD_ALIASES = {
  page: ["page", "pages", "top pages", "url", "urls", "landing page", "landing_page", "페이지", "상위 페이지", "인기 페이지"],
  query: ["query", "queries", "top queries", "search query", "search_query", "검색어", "상위 검색어", "인기 검색어"],
  country: ["country", "countries", "국가"],
  device: ["device", "devices", "기기"],
  searchAppearance: ["search appearance", "search_appearance", "appearance", "검색 노출", "검색 노출 형식"],
  clicks: ["clicks", "click", "클릭", "클릭수"],
  impressions: ["impressions", "impr", "노출", "노출수"],
  ctr: ["ctr", "click through rate", "click-through rate", "클릭률"],
  position: ["position", "average position", "avg position", "평균 게재순위", "평균 게재 순위", "게재순위", "게재 순위", "순위"],
};

const REQUIRED_P1_2B_GSC_KEYS = ["recentPages", "previousPages", "recentQueries", "previousQueries"];

const CALCULATOR_URLS = [
  "/tools/compound-interest",
  "/tools/goal-simulator",
  "/tools/fire-calculator",
  "/tools/cagr-calculator",
  "/tools/dca-calculator",
  "/tools/dsr-ltv-calculator",
  "/tools/home-buying-budget-calculator",
  "/tools/mortgage-loan-calculator",
  "/en/tools/compound-interest",
  "/en/tools/goal-simulator",
  "/en/tools/fire-calculator",
  "/en/tools/cagr-calculator",
  "/en/tools/dca-calculator",
  "/en/tools/dsr-ltv-calculator",
  "/en/tools/home-buying-budget-calculator",
  "/en/tools/mortgage-loan-calculator",
];

function parseArgs(argv) {
  const args = {};
  for (const item of argv) {
    if (!item.startsWith("--")) continue;
    const eq = item.indexOf("=");
    if (eq === -1) {
      args[item.slice(2)] = true;
    } else {
      args[item.slice(2, eq)] = item.slice(eq + 1);
    }
  }
  return args;
}

function fromRoot(relativePath) {
  return path.resolve(ROOT, relativePath);
}

function posixPath(filePath) {
  return filePath.replace(/\\/g, "/");
}

function fileInfo(relativePath) {
  const full = fromRoot(relativePath);
  if (!fs.existsSync(full)) {
    return { path: relativePath, exists: false, bytes: 0 };
  }
  const stat = fs.statSync(full);
  return { path: relativePath, exists: true, bytes: stat.size };
}

function ensureDirFor(filePath) {
  fs.mkdirSync(path.dirname(fromRoot(filePath)), { recursive: true });
}

function readJson(relativePath) {
  const full = fromRoot(relativePath);
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function writeJson(relativePath, value) {
  ensureDirFor(relativePath);
  fs.writeFileSync(fromRoot(relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(relativePath, value) {
  ensureDirFor(relativePath);
  fs.writeFileSync(fromRoot(relativePath), value, "utf8");
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(relativePath, rows, headers) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  writeText(relativePath, `${lines.join("\n")}\n`);
}

function daysInclusive(start, end) {
  const startDate = new Date(`${start}T00:00:00Z`);
  const endDate = new Date(`${end}T00:00:00Z`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;
  return Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
}

function rangesOverlap(a, b) {
  const aStart = new Date(`${a.start}T00:00:00Z`).getTime();
  const aEnd = new Date(`${a.end}T00:00:00Z`).getTime();
  const bStart = new Date(`${b.start}T00:00:00Z`).getTime();
  const bEnd = new Date(`${b.end}T00:00:00Z`).getTime();
  return aStart <= bEnd && bStart <= aEnd;
}

function asNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const cleaned = String(value)
    .trim()
    .replace(/,/g, "")
    .replace(/[^\d.+\-eE%]/g, "");
  if (!cleaned || cleaned === "%") return null;
  const numeric = Number(cleaned.replace(/%/g, ""));
  if (!Number.isFinite(numeric)) return null;
  return numeric;
}

function asCtr(value, clicks, impressions) {
  if (value !== null && value !== undefined && value !== "") {
    const raw = String(value);
    const numeric = asNumber(value);
    if (numeric === null) return null;
    if (raw.includes("%")) return numeric / 100;
    if (numeric > 1) return numeric / 100;
    return numeric;
  }
  if (impressions > 0 && clicks !== null && clicks !== undefined) return clicks / impressions;
  return null;
}

function pctChange(current, previous) {
  if (previous === null || previous === undefined || current === null || current === undefined) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  return (current - previous) / previous;
}

function delta(current, previous) {
  if (current === null || current === undefined || previous === null || previous === undefined) return null;
  return current - previous;
}

function round(value, digits = 4) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "n/a";
  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function formatSignedNumber(value, digits = 0) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "n/a";
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value, digits)}`;
}

function formatPct(value, digits = 1) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "n/a";
  return `${formatSignedNumber(value * 100, digits)}%`;
}

function formatCtr(value, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "n/a";
  return `${formatNumber(value * 100, digits)}%`;
}

function formatPp(value, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "n/a";
  return `${formatSignedNumber(value * 100, digits)}pp`;
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\ufeff/g, "")
    .replace(/\s+/g, " ")
    .replace(/_/g, " ");
}

function splitCsvLine(line, delimiter = ",") {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === delimiter && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells;
}

function detectDelimiter(headerLine) {
  const candidates = [",", "\t", ";"];
  let best = ",";
  let bestCount = 0;
  for (const delimiter of candidates) {
    const count = splitCsvLine(headerLine || "", delimiter).length;
    if (count > bestCount) {
      best = delimiter;
      bestCount = count;
    }
  }
  return best;
}

function parseCsv(text, delimiter = null) {
  const lines = text.replace(/^\ufeff/, "").split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return { rows: [], headers: [], delimiter: delimiter || ",", parsingFailures: 0 };
  const actualDelimiter = delimiter || detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], actualDelimiter).map(normalizeHeader);
  let parsingFailures = 0;
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line, actualDelimiter);
    if (cells.length !== headers.length) parsingFailures += 1;
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] === undefined ? "" : cells[index].trim();
    });
    return row;
  });
  return { rows, headers, delimiter: actualDelimiter, parsingFailures };
}

function duplicateRowCount(rows) {
  const seen = new Set();
  let duplicates = 0;
  for (const row of rows) {
    const key = JSON.stringify(row);
    if (seen.has(key)) duplicates += 1;
    seen.add(key);
  }
  return duplicates;
}

function summarizeCsvRows(rows) {
  let clicks = 0;
  let impressions = 0;
  let positionNumerator = 0;
  let positionDenominator = 0;
  for (const row of rows) {
    const rowClicks = asNumber(getField(row, FIELD_ALIASES.clicks)) || 0;
    const rowImpressions = asNumber(getField(row, FIELD_ALIASES.impressions)) || 0;
    const rowPosition = asNumber(getField(row, FIELD_ALIASES.position));
    clicks += rowClicks;
    impressions += rowImpressions;
    if (rowPosition !== null && rowPosition !== undefined) {
      const weight = rowImpressions > 0 ? rowImpressions : 1;
      positionNumerator += rowPosition * weight;
      positionDenominator += weight;
    }
  }
  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : null,
    weightedPosition: positionDenominator > 0 ? positionNumerator / positionDenominator : null,
  };
}

function getField(row, aliases) {
  for (const alias of aliases) {
    const normalized = normalizeHeader(alias);
    if (Object.prototype.hasOwnProperty.call(row, normalized)) return row[normalized];
  }
  return "";
}

function findCsv(currentDir, previousDir, fileName) {
  const currentCandidate = path.join(currentDir, fileName);
  if (fs.existsSync(fromRoot(currentCandidate))) return currentCandidate;
  const previousCandidate = path.join(previousDir, fileName);
  if (fs.existsSync(fromRoot(previousCandidate))) return previousCandidate;
  return currentCandidate;
}

function readCsvIfExists(relativePath) {
  const full = fromRoot(relativePath);
  if (!fs.existsSync(full)) {
    return {
      exists: false,
      path: relativePath,
      rows: [],
      diagnostics: {
        fileName: path.basename(relativePath),
        path: relativePath,
        status: "MISSING",
        bytes: 0,
        encoding: null,
        delimiter: null,
        header: [],
        rowCount: 0,
        firstRow: null,
        lastRow: null,
        totals: { clicks: null, impressions: null, ctr: null, weightedPosition: null },
        ctrHandling: "not parsed",
        positionHandling: "not parsed",
        duplicateRows: 0,
        parsingFailures: 0,
      },
    };
  }
  const buffer = fs.readFileSync(full);
  const text = buffer.toString("utf8");
  const parsed = parseCsv(text);
  const totals = summarizeCsvRows(parsed.rows);
  return {
    exists: true,
    path: relativePath,
    rows: parsed.rows,
    diagnostics: {
      fileName: path.basename(relativePath),
      path: relativePath,
      status: "PASS",
      bytes: buffer.length,
      encoding: text.charCodeAt(0) === 0xfeff ? "utf-8-bom" : "utf-8",
      delimiter: parsed.delimiter === "\t" ? "\\t" : parsed.delimiter,
      header: parsed.headers,
      rowCount: parsed.rows.length,
      firstRow: parsed.rows[0] || null,
      lastRow: parsed.rows[parsed.rows.length - 1] || null,
      totals,
      ctrHandling: "Use exported CTR when present; otherwise calculate clicks / impressions for display.",
      positionHandling: "Weighted by impressions when aggregating; lower number is better.",
      duplicateRows: duplicateRowCount(parsed.rows),
      parsingFailures: parsed.parsingFailures,
    },
  };
}

function toPath(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    if (/^https?:\/\//i.test(raw)) {
      const parsed = new URL(raw);
      if (!/^(www\.)?finmaphub\.com$/i.test(parsed.hostname)) {
        return `EXTERNAL:${parsed.hostname}${normalizePath(parsed.pathname)}`;
      }
      return normalizePath(parsed.pathname);
    }
  } catch {
    return normalizePath(raw);
  }
  return normalizePath(raw);
}

function normalizePath(value) {
  let output = String(value || "").trim();
  if (!output) return "";
  output = output.split("#")[0].split("?")[0];
  try {
    output = decodeURIComponent(output);
  } catch {
    // Preserve the raw path if a malformed escape sequence appears in an export.
  }
  output = output.replace(/\/{2,}/g, "/");
  if (!output.startsWith("/")) output = `/${output}`;
  if (output.length > 1) output = output.replace(/\/+$/, "");
  return output || "/";
}

function localeForUrl(url) {
  return normalizePath(url).startsWith("/en/") || normalizePath(url) === "/en" ? "en" : "ko";
}

function contentTypeForUrl(url) {
  const normalized = normalizePath(url);
  if (normalized === "/") return "home";
  if (normalized === "/tools" || normalized === "/en/tools") return "tools_hub";
  if (normalized.includes("/tools/")) return "calculator";
  if (normalized.includes("/posts/")) return "post";
  if (normalized.includes("/market/real-estate")) return "real_estate";
  if (normalized.includes("/market")) return "market";
  return "other";
}

function categoryForUrl(url) {
  const normalized = normalizePath(url);
  const match = normalized.match(/^\/(?:en\/)?posts\/([^/]+)\//);
  if (match) return match[1];
  if (normalized.includes("/tools/")) return "tools";
  if (normalized.includes("/market/real-estate")) return "real-estate";
  if (normalized.includes("/market")) return "market";
  if (normalized === "/") return "home";
  return "";
}

function pathGroupForUrl(url) {
  const normalized = normalizePath(url);
  if (normalized === "/") return "/";
  if (normalized.startsWith("/en/tools/")) return "/en/tools/";
  if (normalized.startsWith("/tools/")) return "/tools/";
  if (normalized.startsWith("/en/posts/")) return "/en/posts/";
  if (normalized.startsWith("/posts/")) return "/posts/";
  if (normalized.startsWith("/market/real-estate")) return "/market/real-estate/";
  if (normalized.startsWith("/market/")) return "/market/";
  return "other";
}

function loadSitemapPaths() {
  const sitemapFiles = [
    "public/sitemap-0.xml",
    "public/sitemap-ko.xml",
    "public/sitemap-en.xml",
    "public/en/sitemap.xml",
  ];
  const paths = new Set();
  for (const file of sitemapFiles) {
    const full = fromRoot(file);
    if (!fs.existsSync(full)) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const match of text.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      paths.add(toPath(match[1]));
    }
  }
  return paths;
}

function loadInventoryMap() {
  const inventoryFile = "reports/search-growth-90d-url-inventory.csv";
  const full = fromRoot(inventoryFile);
  const map = new Map();
  if (!fs.existsSync(full)) return map;
  const parsed = parseCsv(fs.readFileSync(full, "utf8"));
  for (const row of parsed.rows) {
    const url = normalizePath(row.url || "");
    if (!url) continue;
    map.set(url, {
      url,
      locale: row.locale || localeForUrl(url),
      content_type: row.content_type || contentTypeForUrl(url),
      category: row.category || categoryForUrl(url),
      role: row.role || "",
      title: row.title || "",
      h1: row.h1 || "",
      source_file: row.source_file || "",
      recommended_action: row.recommended_action || "",
    });
  }
  return map;
}

function normalizeDimensionRow(row, dimension) {
  const value = getField(row, FIELD_ALIASES[dimension]);
  const clicks = asNumber(getField(row, FIELD_ALIASES.clicks));
  const impressions = asNumber(getField(row, FIELD_ALIASES.impressions));
  const ctr = asCtr(getField(row, FIELD_ALIASES.ctr), clicks, impressions);
  const position = asNumber(getField(row, FIELD_ALIASES.position));
  return {
    key: dimension === "page" ? toPath(value) : String(value || "").trim(),
    rawKey: String(value || "").trim(),
    clicks: clicks ?? 0,
    impressions: impressions ?? 0,
    ctr,
    position,
  };
}

function indexRows(rows, dimension) {
  const map = new Map();
  for (const row of rows) {
    const normalized = normalizeDimensionRow(row, dimension);
    if (!normalized.key) continue;
    const existing = map.get(normalized.key) || {
      key: normalized.key,
      rawKey: normalized.rawKey,
      clicks: 0,
      impressions: 0,
      weightedPositionNumerator: 0,
      weightedPositionDenominator: 0,
    };
    existing.clicks += normalized.clicks || 0;
    existing.impressions += normalized.impressions || 0;
    if (normalized.position !== null && normalized.position !== undefined) {
      const weight = normalized.impressions > 0 ? normalized.impressions : 1;
      existing.weightedPositionNumerator += normalized.position * weight;
      existing.weightedPositionDenominator += weight;
    }
    map.set(normalized.key, existing);
  }
  for (const value of map.values()) {
    value.ctr = value.impressions > 0 ? value.clicks / value.impressions : null;
    value.position =
      value.weightedPositionDenominator > 0
        ? value.weightedPositionNumerator / value.weightedPositionDenominator
        : null;
  }
  return map;
}

function classifyPage(prev, recent) {
  const prevImpressions = prev?.impressions || 0;
  const recentImpressions = recent?.impressions || 0;
  const impressionLoss = prevImpressions - recentImpressions;
  const positionDelta = delta(recent?.position, prev?.position);
  const ctrDelta = delta(recent?.ctr, prev?.ctr);

  if (prevImpressions > 0 && !recent) return "DISAPPEARED_FROM_REPORT";
  if (recentImpressions > 0 && !prev) return "NEWLY_APPEARED";
  if (Math.max(prevImpressions, recentImpressions) < 20) return "LOW_SAMPLE";
  if (impressionLoss >= Math.max(10, prevImpressions * 0.5)) return "MAJOR_IMPRESSION_LOSS";
  if (positionDelta !== null && positionDelta > 3) return "POSITION_DROP";
  if (ctrDelta !== null && ctrDelta <= -0.005) return "CTR_DROP";
  return "UNCHANGED";
}

function normalizeQuery(query) {
  return String(query || "").replace(/\s+/g, " ").trim();
}

function queryFamily(query) {
  const normalized = normalizeQuery(query).toLowerCase();
  if (!normalized) return "other";
  if (normalized.includes("site:")) return "site operator";
  if (/(^|[\s.:/-])(finmap|finmaphub|fin map)([\s.:/-]|$)|핀맵/i.test(normalized)) return "brand";
  if (/복리|compound/.test(normalized)) return "compound";
  if (/cagr|연평균/.test(normalized)) return "CAGR";
  if (/dsr|총부채원리금상환비율/.test(normalized)) return "DSR";
  if (/ltv|담보인정비율/.test(normalized)) return "LTV";
  if (/주담대|주택담보|담보대출|mortgage/.test(normalized)) return "mortgage";
  if (/아파트 구매|내집마련|home buying|buy.*apartment/.test(normalized)) return "home buying";
  if (/dca|적립식|달러.?코스트|dollar.?cost/.test(normalized)) return "DCA";
  if (/fire|은퇴|파이어/.test(normalized)) return "FIRE";
  if (/kospi|nasdaq|s&p|index|지수|시장|금리|환율|dxy|tnx/.test(normalized)) return "market/index";
  if (/아파트|부동산|전세|매매|real estate|seoul|gangnam|magok/.test(normalized)) return "real estate";
  return "other";
}

function queryLocale(query) {
  return /[가-힣]/.test(query) ? "ko" : "en_or_unknown";
}

function likelyIntentForQuery(query) {
  const family = queryFamily(query);
  if (["compound", "CAGR", "DSR", "LTV", "mortgage", "home buying", "DCA", "FIRE"].includes(family)) {
    return "calculator";
  }
  if (family === "market/index") return "market_info";
  if (family === "real estate") return "real_estate_info";
  if (family === "brand") return "brand_navigation";
  if (family === "site operator") return "site_operator_check";
  return "unknown";
}

function likelyTargetForQuery(query) {
  const q = query.toLowerCase();
  if (/주담대|주택담보|담보대출/.test(query)) return "/tools/mortgage-loan-calculator";
  if (/dsr|ltv|대출가능/.test(q)) return "/tools/dsr-ltv-calculator";
  if (/아파트 구매|내집마련|구매 계산/.test(query)) return "/tools/home-buying-budget-calculator";
  if (/복리|compound/.test(q)) return "/tools/compound-interest";
  if (/cagr|연평균/.test(q)) return "/tools/cagr-calculator";
  if (/dca|적립식/.test(q)) return "/tools/dca-calculator";
  if (/은퇴|fire/.test(q)) return "/tools/fire-calculator";
  if (/목표 자산|goal/.test(q)) return "/tools/goal-simulator";
  return "";
}

function targetConfidenceForQuery(query) {
  const target = likelyTargetForQuery(query);
  if (!target) return "QUERY_URL_NOT_CONFIRMED";
  if (/계산기|calculator|dsr|ltv|cagr|compound|mortgage|담보대출|주담대/i.test(query)) {
    return "INFERRED_FROM_TITLE_SLUG";
  }
  return "POSSIBLE_TARGET";
}

function classifyQuery(prev, recent, query) {
  const family = queryFamily(query);
  if (family === "site operator") return "SITE_OPERATOR_QUERY";
  if (family === "brand") return "BRANDED_QUERY";
  if (!query) return "ANONYMIZED_OR_MISSING";
  const prevImpressions = prev?.impressions || 0;
  const recentImpressions = recent?.impressions || 0;
  if (Math.max(prevImpressions, recentImpressions) < 20) return "LOW_SAMPLE";
  if (/계산기|calculator|dsr|ltv|cagr|compound|mortgage|담보대출|주담대/.test(query.toLowerCase())) {
    return "CALCULATOR_QUERY_LOST";
  }
  if (/[가-힣]/.test(query)) return "KO_QUERY";
  if (/[a-z]/i.test(query)) return "EN_QUERY";
  return "FINANCE_INFO_QUERY_LOST";
}

function compareDimension(previousRows, recentRows, dimension, sitemapPaths, inventoryMap = new Map()) {
  const previous = indexRows(previousRows, dimension);
  const recent = indexRows(recentRows, dimension);
  const keys = new Set([...previous.keys(), ...recent.keys()]);
  const totalLoss = [...keys].reduce((sum, key) => {
    const prev = previous.get(key);
    const cur = recent.get(key);
    return sum + Math.max((prev?.impressions || 0) - (cur?.impressions || 0), 0);
  }, 0);

  const rows = [...keys].map((key) => {
    const prev = previous.get(key);
    const cur = recent.get(key);
    const impressionDelta = (cur?.impressions || 0) - (prev?.impressions || 0);
    const clickDelta = (cur?.clicks || 0) - (prev?.clicks || 0);
    const ctrDelta = delta(cur?.ctr, prev?.ctr);
    const positionChange = delta(cur?.position, prev?.position);
    const lostImpressions = Math.max(-impressionDelta, 0);
    if (dimension === "page") {
      const inventory = inventoryMap.get(key);
      const sitemapMembership = sitemapPaths.has(key) ? "IN_SITEMAP" : "NOT_FOUND_IN_LOCAL_SITEMAP";
      const diagnosis = classifyPage(prev, cur);
      return {
        status: diagnosis,
        url: key,
        locale: inventory?.locale || localeForUrl(key),
        content_type: inventory?.content_type || contentTypeForUrl(key),
        category: inventory?.category || categoryForUrl(key),
        role: inventory?.role || "",
        previous_clicks: prev?.clicks ?? 0,
        recent_clicks: cur?.clicks ?? 0,
        click_delta: clickDelta,
        previous_impressions: prev?.impressions ?? 0,
        recent_impressions: cur?.impressions ?? 0,
        impression_delta: impressionDelta,
        impression_change_rate: pctChange(cur?.impressions || 0, prev?.impressions || 0),
        lost_impression_share: totalLoss > 0 ? lostImpressions / totalLoss : 0,
        previous_ctr: prev?.ctr ?? null,
        recent_ctr: cur?.ctr ?? null,
        ctr_pp_delta: ctrDelta,
        previous_position: prev?.position ?? null,
        recent_position: cur?.position ?? null,
        position_delta: positionChange,
        path_group: pathGroupForUrl(key),
        inventory_match: inventory ? "LOCAL_INVENTORY_MATCH" : "INVENTORY_SCOPE_GAP",
        sitemap_membership: sitemapMembership,
        current_title: inventory?.title || "",
        current_h1: inventory?.h1 || "",
        last_modified: "",
        recent_local_change: "NOT_MODIFIED_BY_P1_2B",
        currently_deployed_change: "DEPLOY_DATE_PENDING_OR_UNKNOWN",
        diagnosis,
        confidence: inventory ? "MEDIUM_STATIC_INVENTORY_JOIN" : "LOW_INVENTORY_GAP",
        recommended_action:
          diagnosis === "DISAPPEARED_FROM_REPORT" || diagnosis === "MAJOR_IMPRESSION_LOSS"
            ? "URL_INSPECTION_RECHECK"
            : "NO_CHANGE_OBSERVE",
      };
    }
    const target = likelyTargetForQuery(key);
    const diagnosis = classifyQuery(prev, cur, key);
    return {
      status: diagnosis,
      query: key,
      normalized_query: normalizeQuery(key),
      query_family: queryFamily(key),
      locale: queryLocale(key),
      is_branded: /finmap|fin map|finmaphub|핀맵/i.test(key) ? "yes" : "no",
      previous_clicks: prev?.clicks ?? 0,
      recent_clicks: cur?.clicks ?? 0,
      click_delta: clickDelta,
      previous_impressions: prev?.impressions ?? 0,
      recent_impressions: cur?.impressions ?? 0,
      impression_delta: impressionDelta,
      loss_share: totalLoss > 0 ? lostImpressions / totalLoss : 0,
      lost_impression_share: totalLoss > 0 ? lostImpressions / totalLoss : 0,
      previous_ctr: prev?.ctr ?? null,
      recent_ctr: cur?.ctr ?? null,
      ctr_pp_delta: ctrDelta,
      previous_position: prev?.position ?? null,
      recent_position: cur?.position ?? null,
      position_delta: positionChange,
      likely_intent: likelyIntentForQuery(key),
      likely_target_url: target,
      target_confidence: targetConfidenceForQuery(key),
      query_url_confidence: targetConfidenceForQuery(key),
      diagnosis,
    };
  });

  rows.sort((a, b) => {
    const lossA = Math.max(-(a.impression_delta || 0), 0);
    const lossB = Math.max(-(b.impression_delta || 0), 0);
    return lossB - lossA;
  });

  return { rows, totalLoss };
}

function aggregatePathGroups(pageRows) {
  const groups = new Map();
  for (const row of pageRows) {
    const group = row.path_group || "other";
    const existing = groups.get(group) || {
      path_group: group,
      previous_clicks: 0,
      recent_clicks: 0,
      previous_impressions: 0,
      recent_impressions: 0,
      previous_position_num: 0,
      previous_position_den: 0,
      recent_position_num: 0,
      recent_position_den: 0,
      page_count_before: 0,
      page_count_after: 0,
      disappeared_page_count: 0,
    };
    existing.previous_clicks += Number(row.previous_clicks || 0);
    existing.recent_clicks += Number(row.recent_clicks || 0);
    existing.previous_impressions += Number(row.previous_impressions || 0);
    existing.recent_impressions += Number(row.recent_impressions || 0);
    if (row.previous_position !== null && row.previous_position !== undefined && row.previous_impressions > 0) {
      existing.previous_position_num += row.previous_position * row.previous_impressions;
      existing.previous_position_den += row.previous_impressions;
    }
    if (row.recent_position !== null && row.recent_position !== undefined && row.recent_impressions > 0) {
      existing.recent_position_num += row.recent_position * row.recent_impressions;
      existing.recent_position_den += row.recent_impressions;
    }
    if ((row.previous_impressions || 0) > 0) existing.page_count_before += 1;
    if ((row.recent_impressions || 0) > 0) existing.page_count_after += 1;
    if ((row.previous_impressions || 0) > 0 && (row.recent_impressions || 0) === 0) {
      existing.disappeared_page_count += 1;
    }
    groups.set(group, existing);
  }

  const totalLoss = [...groups.values()].reduce(
    (sum, row) => sum + Math.max(row.previous_impressions - row.recent_impressions, 0),
    0
  );

  return [...groups.values()]
    .map((row) => {
      const previousCtr = row.previous_impressions > 0 ? row.previous_clicks / row.previous_impressions : null;
      const recentCtr = row.recent_impressions > 0 ? row.recent_clicks / row.recent_impressions : null;
      const previousPosition =
        row.previous_position_den > 0 ? row.previous_position_num / row.previous_position_den : null;
      const recentPosition = row.recent_position_den > 0 ? row.recent_position_num / row.recent_position_den : null;
      return {
        path_group: row.path_group,
        previous_clicks: row.previous_clicks,
        recent_clicks: row.recent_clicks,
        previous_impressions: row.previous_impressions,
        recent_impressions: row.recent_impressions,
        impression_delta: row.recent_impressions - row.previous_impressions,
        lost_impression_contribution:
          totalLoss > 0 ? Math.max(row.previous_impressions - row.recent_impressions, 0) / totalLoss : 0,
        previous_ctr: previousCtr,
        recent_ctr: recentCtr,
        previous_position: previousPosition,
        recent_position: recentPosition,
        position_delta: delta(recentPosition, previousPosition),
        page_count_before: row.page_count_before,
        page_count_after: row.page_count_after,
        disappeared_page_count: row.disappeared_page_count,
      };
    })
    .sort((a, b) => Math.max(-b.impression_delta, 0) - Math.max(-a.impression_delta, 0));
}

function aggregateQueryFamilies(queryRows) {
  const groups = new Map();
  for (const row of queryRows) {
    const family = row.query_family || "other";
    const existing = groups.get(family) || {
      query_family: family,
      previous_impressions: 0,
      recent_impressions: 0,
      previous_position_num: 0,
      previous_position_den: 0,
      recent_position_num: 0,
      recent_position_den: 0,
      query_count_before: 0,
      query_count_after: 0,
      disappeared_query_count: 0,
    };
    existing.previous_impressions += Number(row.previous_impressions || 0);
    existing.recent_impressions += Number(row.recent_impressions || 0);
    if (row.previous_position !== null && row.previous_position !== undefined && row.previous_impressions > 0) {
      existing.previous_position_num += row.previous_position * row.previous_impressions;
      existing.previous_position_den += row.previous_impressions;
    }
    if (row.recent_position !== null && row.recent_position !== undefined && row.recent_impressions > 0) {
      existing.recent_position_num += row.recent_position * row.recent_impressions;
      existing.recent_position_den += row.recent_impressions;
    }
    if ((row.previous_impressions || 0) > 0) existing.query_count_before += 1;
    if ((row.recent_impressions || 0) > 0) existing.query_count_after += 1;
    if ((row.previous_impressions || 0) > 0 && (row.recent_impressions || 0) === 0) {
      existing.disappeared_query_count += 1;
    }
    groups.set(family, existing);
  }
  const totalLoss = [...groups.values()].reduce(
    (sum, row) => sum + Math.max(row.previous_impressions - row.recent_impressions, 0),
    0
  );
  return [...groups.values()]
    .map((row) => {
      const previousPosition =
        row.previous_position_den > 0 ? row.previous_position_num / row.previous_position_den : null;
      const recentPosition = row.recent_position_den > 0 ? row.recent_position_num / row.recent_position_den : null;
      const loss = Math.max(row.previous_impressions - row.recent_impressions, 0);
      return {
        query_family: row.query_family,
        previous_impressions: row.previous_impressions,
        recent_impressions: row.recent_impressions,
        loss,
        loss_share: totalLoss > 0 ? loss / totalLoss : 0,
        previous_weighted_position: previousPosition,
        recent_weighted_position: recentPosition,
        position_delta: delta(recentPosition, previousPosition),
        query_count_before: row.query_count_before,
        query_count_after: row.query_count_after,
        disappeared_query_count: row.disappeared_query_count,
      };
    })
    .sort((a, b) => b.loss - a.loss);
}

function calculatorLossRows(pageRows) {
  const byUrl = new Map(pageRows.map((row) => [row.url, row]));
  return CALCULATOR_URLS.map((url) => {
    const row = byUrl.get(url);
    if (!row) {
      return {
        calculator_url: url,
        previous_impressions: 0,
        recent_impressions: 0,
        previous_clicks: 0,
        recent_clicks: 0,
        previous_position: "",
        recent_position: "",
        disappeared: "no_data_in_page_export",
        naver_current_performance_reference: "see weekly-summary naver aggregate",
        bing_current_performance_reference: "see weekly-summary bing aggregate",
        content_or_technical_change: "not modified by P1-2B",
        google_loss_diagnosis: "NO_PAGE_EXPORT_ROW",
      };
    }
    return {
      calculator_url: url,
      previous_impressions: row.previous_impressions,
      recent_impressions: row.recent_impressions,
      previous_clicks: row.previous_clicks,
      recent_clicks: row.recent_clicks,
      previous_position: round(row.previous_position, 2),
      recent_position: round(row.recent_position, 2),
      disappeared: row.previous_impressions > 0 && row.recent_impressions === 0 ? "yes" : "no",
      naver_current_performance_reference: "Naver clicks 74 -> 92; CTR 0.47% -> 0.61%",
      bing_current_performance_reference: "Bing clicks 3 -> 4; impressions 134 -> 178",
      content_or_technical_change: "not modified by P1-2B",
      google_loss_diagnosis: row.diagnosis || row.status,
    };
  });
}

function summarizeChannel(current, previous, options = {}) {
  const currentCtr = current.ctr ?? asCtr(current.ctrPercent, current.clicks, current.impressions);
  const previousCtr = previous.ctr ?? asCtr(previous.ctrPercent, previous.clicks, previous.impressions);
  const currentPosition = current.averagePosition ?? current.position ?? null;
  const previousPosition = previous.averagePosition ?? previous.position ?? null;
  return {
    previous,
    current,
    clicks: {
      previous: previous.clicks,
      current: current.clicks,
      delta: delta(current.clicks, previous.clicks),
      pctChange: pctChange(current.clicks, previous.clicks),
    },
    impressions: {
      previous: previous.impressions,
      current: current.impressions,
      delta: delta(current.impressions, previous.impressions),
      pctChange: pctChange(current.impressions, previous.impressions),
    },
    ctr: {
      previous: previousCtr,
      current: currentCtr,
      ppDelta: delta(currentCtr, previousCtr),
    },
    position: options.positionUnavailable
      ? null
      : {
          previous: previousPosition,
          current: currentPosition,
          delta: delta(currentPosition, previousPosition),
        },
  };
}

function classifyChannels(changes) {
  return {
    gsc:
      changes.gsc.impressions.pctChange !== null && changes.gsc.impressions.pctChange <= -0.8
        ? "CRITICAL_DECLINE_REQUIRES_PAGE_QUERY_EXPORT"
        : "MONITOR",
    bing:
      (changes.bing.impressions.delta || 0) >= 0 && (changes.bing.clicks.delta || 0) >= 0
        ? "LOW_VOLUME_STABLE_GROWTH"
        : "LOW_VOLUME_REVIEW",
    naver:
      (changes.naver.clicks.delta || 0) > 0 && (changes.naver.ctr.ppDelta || 0) > 0
        ? "CLICK_AND_CTR_GROWTH"
        : "NAVER_MONITOR",
    ga4:
      (changes.ga4.sessions?.delta || 0) < 0
        ? "ALL_TRAFFIC_DECLINE_CHANNEL_ATTRIBUTION_MISSING"
        : "ALL_TRAFFIC_STABLE",
    overall: "MIXED_WITH_CRITICAL_GOOGLE_ANOMALY",
  };
}

function summarizeGa4(summary) {
  const recent = summary.ga4AllTraffic.recent;
  const previous = summary.ga4AllTraffic.previous;
  return {
    sessions: {
      previous: previous.sessions,
      current: recent.sessions,
      delta: delta(recent.sessions, previous.sessions),
      pctChange: pctChange(recent.sessions, previous.sessions),
    },
    activeUsers: {
      previous: previous.activeUsers,
      current: recent.activeUsers,
      delta: delta(recent.activeUsers, previous.activeUsers),
      pctChange: pctChange(recent.activeUsers, previous.activeUsers),
    },
    newUsers: {
      previous: previous.newUsers,
      current: recent.newUsers,
      delta: delta(recent.newUsers, previous.newUsers),
      pctChange: pctChange(recent.newUsers, previous.newUsers),
    },
    landingPages: (summary.ga4AllTraffic.landingPages || []).map((row) => ({
      path: row.path,
      previousSessions: row.previousSessions,
      recentSessions: row.recentSessions,
      delta: delta(row.recentSessions, row.previousSessions),
      pctChange: pctChange(row.recentSessions, row.previousSessions),
    })),
  };
}

function inspectGa4Code() {
  const checks = [
    {
      id: "ga4_loader_config",
      file: "pages/_app.js",
      patterns: ["gtag-loader", "gtag-init", "gtag('config'"],
    },
    {
      id: "spa_route_page_view",
      file: "pages/_app.js",
      patterns: ["routeChangeComplete", "page_path"],
    },
    {
      id: "event_helper_context",
      file: "utils/analytics.js",
      patterns: ["trackGaEvent", "page_group", "source_path"],
    },
    {
      id: "dsr_ltv_calculate",
      file: "_components/DsrLtvCalculator.js",
      patterns: ["dsr_ltv_calculate", "commonCalculateEventSentRef", "tool_calculate"],
    },
    {
      id: "home_buying_calculate",
      file: "pages/tools/home-buying-budget-calculator.js",
      patterns: ["home_buying_calculate"],
    },
    {
      id: "mortgage_payment_calculate",
      file: "_components/MortgageLoanCalculator.js",
      patterns: ["mortgage_payment_calculate", "tool_calculate"],
    },
    {
      id: "tool_result_cta",
      file: "_components/ToolResultCta.js",
      patterns: ["tool_result_cta_view", "tool_result_cta_click"],
    },
    {
      id: "related_calculator_click",
      file: "_components/ToolBacklinkKit.js",
      patterns: ["related_calculator_click"],
    },
    {
      id: "real_estate_bridge",
      file: "_components/RealEstateTop100Landing.js",
      patterns: ["real_estate_to_dsr_click"],
    },
  ];

  return checks.map((check) => {
    const full = fromRoot(check.file);
    const source = fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
    const missing = check.patterns.filter((pattern) => !source.includes(pattern));
    return {
      id: check.id,
      file: check.file,
      status: missing.length === 0 ? "PASS" : "REVIEW_REQUIRED",
      missing,
    };
  });
}

function readObservationDeployStatus() {
  const file = "reports/search-growth-90d-p1-1c-observation-baseline.json";
  const full = fromRoot(file);
  if (!fs.existsSync(full)) return "UNKNOWN";
  try {
    const data = JSON.parse(fs.readFileSync(full, "utf8"));
    return data.deployDate || "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}

function buildMissingRows(kind) {
  if (kind === "page") {
    return [
      {
        status: "DATA_REQUIRED",
        url: "GSC_PAGE_QUERY_EXPORT_REQUIRED",
        locale: "",
        content_type: "",
        category: "",
        role: "",
        previous_clicks: "",
        recent_clicks: "",
        click_delta: "",
        previous_impressions: "",
        recent_impressions: "",
        impression_delta: "",
        impression_change_rate: "",
        lost_impression_share: "",
        previous_ctr: "",
        recent_ctr: "",
        ctr_pp_delta: "",
        previous_position: "",
        recent_position: "",
        position_delta: "",
        path_group: "",
        inventory_match: "",
        sitemap_membership: "",
        current_title: "",
        current_h1: "",
        last_modified: "",
        recent_local_change: "",
        currently_deployed_change: "",
        diagnosis: "",
        confidence: "",
        recommended_action: "",
      },
    ];
  }
  return [
    {
      status: "DATA_REQUIRED",
      query: "GSC_PAGE_QUERY_EXPORT_REQUIRED",
      normalized_query: "",
      query_family: "",
      locale: "",
      is_branded: "",
      previous_clicks: "",
      recent_clicks: "",
      click_delta: "",
      previous_impressions: "",
      recent_impressions: "",
      impression_delta: "",
      loss_share: "",
      lost_impression_share: "",
      previous_ctr: "",
      recent_ctr: "",
      ctr_pp_delta: "",
      previous_position: "",
      recent_position: "",
      position_delta: "",
      likely_intent: "",
      likely_target_url: "",
      target_confidence: "",
      query_url_confidence: "",
      diagnosis: "",
    },
  ];
}

function buildMissingPathRows() {
  return [
    {
      path_group: "DATA_REQUIRED",
      previous_clicks: "",
      recent_clicks: "",
      previous_impressions: "",
      recent_impressions: "",
      impression_delta: "",
      loss_share: "",
      previous_weighted_position: "",
      recent_weighted_position: "",
      position_delta: "",
      page_count_before: "",
      page_count_after: "",
      disappeared_page_count: "",
    },
  ];
}

function buildMissingQueryFamilyRows() {
  return [
    {
      query_family: "DATA_REQUIRED",
      previous_impressions: "",
      recent_impressions: "",
      loss: "",
      loss_share: "",
      previous_weighted_position: "",
      recent_weighted_position: "",
      position_delta: "",
      query_count_before: "",
      query_count_after: "",
      disappeared_query_count: "",
    },
  ];
}

function buildMissingCalculatorRows() {
  return CALCULATOR_URLS.map((url) => ({
    calculator_url: url,
    previous_impressions: "",
    recent_impressions: "",
    previous_clicks: "",
    recent_clicks: "",
    previous_position: "",
    recent_position: "",
    disappeared: "DATA_REQUIRED",
    naver_current_performance_reference: "weekly summary available",
    bing_current_performance_reference: "weekly summary available",
    content_or_technical_change: "not modified by P1-2B",
    google_loss_diagnosis: "GSC_PAGE_EXPORT_REQUIRED",
  }));
}

function formatLossRowsForCsv(rows, kind) {
  if (kind === "page") {
    return rows.map((row) => ({
      ...row,
      impression_change_rate: row.impression_change_rate === "" ? "" : round(row.impression_change_rate, 6),
      lost_impression_share: row.lost_impression_share === "" ? "" : round(row.lost_impression_share, 6),
      previous_ctr: row.previous_ctr === "" ? "" : round(row.previous_ctr, 6),
      recent_ctr: row.recent_ctr === "" ? "" : round(row.recent_ctr, 6),
      ctr_pp_delta: row.ctr_pp_delta === "" ? "" : round(row.ctr_pp_delta, 6),
      previous_position: row.previous_position === "" ? "" : round(row.previous_position, 2),
      recent_position: row.recent_position === "" ? "" : round(row.recent_position, 2),
      position_delta: row.position_delta === "" ? "" : round(row.position_delta, 2),
    }));
  }
  return rows.map((row) => ({
    ...row,
    loss_share: row.loss_share === "" ? "" : round(row.loss_share, 6),
    lost_impression_share: row.lost_impression_share === "" ? "" : round(row.lost_impression_share, 6),
    previous_ctr: row.previous_ctr === "" ? "" : round(row.previous_ctr, 6),
    recent_ctr: row.recent_ctr === "" ? "" : round(row.recent_ctr, 6),
    ctr_pp_delta: row.ctr_pp_delta === "" ? "" : round(row.ctr_pp_delta, 6),
    previous_position: row.previous_position === "" ? "" : round(row.previous_position, 2),
    recent_position: row.recent_position === "" ? "" : round(row.recent_position, 2),
    position_delta: row.position_delta === "" ? "" : round(row.position_delta, 2),
  }));
}

function makeMarkdownTable(headers, rows) {
  const lines = [];
  lines.push(`| ${headers.join(" | ")} |`);
  lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const row of rows) {
    lines.push(`| ${headers.map((header) => row[header] ?? "").join(" | ")} |`);
  }
  return lines.join("\n");
}

function totalLossShareAt(rows, count, shareField = "lost_impression_share") {
  return rows
    .slice(0, count)
    .reduce((sum, row) => sum + (Number(row[shareField]) || 0), 0);
}

function diagnoseTechnicalVsRanking(gscRowsAvailable, pageRows, queryRows) {
  if (!gscRowsAvailable) return "INSUFFICIENT_DATA";
  const top3PageShare = totalLossShareAt(pageRows, 3);
  const top3QueryShare = totalLossShareAt(queryRows, 3);
  if (top3PageShare >= 0.7) return "CONCENTRATED_PAGE_LOSS";
  if (top3QueryShare >= 0.7) return "CONCENTRATED_QUERY_LOSS";
  const pathGroups = aggregatePathGroups(pageRows).filter((row) => Math.max(-row.impression_delta, 0) > 0);
  if (pathGroups.length >= 3) return "BROAD_SITEWIDE_VISIBILITY_DROP";
  return "RANKING_OR_RELEVANCE_DROP";
}

function makeDeployDecision(gscRowsAvailable, technicalDiagnosis, deployDate) {
  if (!gscRowsAvailable) {
    return {
      generatedAt: "2026-07-29",
      decision: "INPUT_BLOCKED_GSC_CSVS_MISSING",
      allowedDecisionSet: [
        "DEPLOY_VALIDATED_P0_P1",
        "HOLD_DEPLOY_FOR_TECHNICAL_FIX",
        "DEPLOY_WITH_GOOGLE_OBSERVATION_FLAG",
      ],
      recommendation: "Do not finalize P0-P1 deploy decision until the four required GSC CSV files are present.",
      reason: "P1-2B requires page/query loss maps; the current workspace does not contain the required GSC CSV exports.",
      deployDateFromObservationBaseline: deployDate,
      deploymentPerformed: false,
      commitPerformed: false,
      pushPerformed: false,
    };
  }
  if (technicalDiagnosis === "TECHNICAL_INDEXING_FAILURE") {
    return {
      generatedAt: "2026-07-29",
      decision: "HOLD_DEPLOY_FOR_TECHNICAL_FIX",
      recommendation: "Hold deployment until the confirmed technical indexing issue is fixed.",
      reason: "A technical indexing failure was detected by the analysis.",
      deployDateFromObservationBaseline: deployDate,
      deploymentPerformed: false,
      commitPerformed: false,
      pushPerformed: false,
    };
  }
  return {
    generatedAt: "2026-07-29",
    decision:
      technicalDiagnosis === "RANKING_OR_RELEVANCE_DROP" ||
      technicalDiagnosis.includes("CONCENTRATED") ||
      technicalDiagnosis === "BROAD_SITEWIDE_VISIBILITY_DROP"
        ? "DEPLOY_WITH_GOOGLE_OBSERVATION_FLAG"
        : "DEPLOY_VALIDATED_P0_P1",
    recommendation:
      "Deployment may be considered separately, but record a 28-day Google observation flag and avoid meta rewrites during the observation period.",
    reason:
      "No technical indexing failure is confirmed locally; the Google drop appears to be ranking/relevance or concentration-related.",
    deployDateFromObservationBaseline: deployDate,
    deploymentPerformed: false,
    commitPerformed: false,
    pushPerformed: false,
  };
}

function makeFollowUpTargets(gscRowsAvailable, pageRows, queryRows) {
  if (!gscRowsAvailable) {
    return {
      generatedAt: "2026-07-29",
      status: "INPUT_BLOCKED_GSC_CSVS_MISSING",
      targets: [
        {
          priority: 1,
          target: "reports/search-weekly-input/2026-07-22_2026-07-28/gsc-recent-pages.csv",
          type: "DATA_RECHECK_REQUIRED",
          reason: "Required for page loss map.",
        },
        {
          priority: 2,
          target: "reports/search-weekly-input/2026-07-22_2026-07-28/gsc-previous-pages.csv",
          type: "DATA_RECHECK_REQUIRED",
          reason: "Required for page loss map.",
        },
        {
          priority: 3,
          target: "reports/search-weekly-input/2026-07-22_2026-07-28/gsc-recent-queries.csv",
          type: "DATA_RECHECK_REQUIRED",
          reason: "Required for query loss map.",
        },
        {
          priority: 4,
          target: "reports/search-weekly-input/2026-07-22_2026-07-28/gsc-previous-queries.csv",
          type: "DATA_RECHECK_REQUIRED",
          reason: "Required for query loss map.",
        },
      ],
    };
  }
  const targets = [];
  for (const row of pageRows) {
    if (targets.length >= 5) break;
    const loss = Math.max(-(row.impression_delta || 0), 0);
    if (loss <= 0) continue;
    targets.push({
      priority: targets.length + 1,
      target: row.url,
      type: row.status === "LOW_SAMPLE" ? "NO_CHANGE_OBSERVE" : "URL_INSPECTION_RECHECK",
      reason: `${loss} impression loss; share ${formatCtr(row.lost_impression_share || 0, 1)}.`,
      queryCaveat: "Page-query mapping is not confirmed without a page-query export.",
    });
  }
  if (targets.length < 5) {
    for (const row of queryRows) {
      if (targets.length >= 5) break;
      const loss = Math.max(-(row.impression_delta || 0), 0);
      if (loss <= 0) continue;
      targets.push({
        priority: targets.length + 1,
        target: row.query,
        type: "CONTENT_INTENT_REVIEW",
        reason: `${loss} query impression loss in family ${row.query_family}.`,
        queryCaveat: "Likely target URL is inferred, not confirmed.",
      });
    }
  }
  return { generatedAt: "2026-07-29", status: "READY", targets: targets.slice(0, 5) };
}

function renderReport(data) {
  const { summary, changes, statuses, dataCompleteness, gsc, ga4Audit, deployDate, outputs } = data;
  const periods = summary.periods;
  const recent = periods.recent;
  const previous = periods.previous;
  const gscRowsAvailable = gsc.page.available && gsc.query.available;
  const gscTopPageRows = gsc.page.rows.slice(0, 10).map((row) => ({
    URL: row.url,
    "Prev Impr": row.previous_impressions,
    "Recent Impr": row.recent_impressions,
    Loss: Math.max(-(row.impression_delta || 0), 0),
    "Loss Share": formatCtr(row.lost_impression_share || 0, 1),
    Status: row.status,
  }));
  const gscTopQueryRows = gsc.query.rows.slice(0, 10).map((row) => ({
    Query: row.query,
    "Prev Impr": row.previous_impressions,
    "Recent Impr": row.recent_impressions,
    Loss: Math.max(-(row.impression_delta || 0), 0),
    "Loss Share": formatCtr(row.lost_impression_share || 0, 1),
    Status: row.status,
  }));
  const pathRows = gsc.pathGroups.map((row) => ({
    Group: row.path_group,
    "Prev Clicks": row.previous_clicks,
    "Recent Clicks": row.recent_clicks,
    "Prev Impr": row.previous_impressions,
    "Recent Impr": row.recent_impressions,
    "Loss Share": formatCtr(row.lost_impression_contribution || 0, 1),
    "Position Delta": formatSignedNumber(row.position_delta, 2),
  }));
  const ga4Rows = data.ga4.landingPages.map((row) => ({
    Path: row.path,
    Previous: row.previousSessions,
    Recent: row.recentSessions,
    Delta: formatSignedNumber(row.delta),
    Change: formatPct(row.pctChange),
  }));
  const auditRows = ga4Audit.map((row) => ({
    Check: row.id,
    File: row.file,
    Status: row.status,
    Missing: row.missing.join("; "),
  }));

  return `# Search Growth Weekly Audit: 2026-07-22 to 2026-07-28

Generated: 2026-07-29

## 1. Executive Summary

Final verdict: ${statuses.overall}.

Google Search Console impressions fell from ${changes.gsc.impressions.previous} to ${changes.gsc.impressions.current} (${formatPct(changes.gsc.impressions.pctChange)}), while Naver clicks and CTR improved and Bing grew from a small sample. This is a channel-divergent week, not a confirmed site-wide SEO failure. GSC page/query exports are required before changing Google-facing content, titles, descriptions, canonicals, sitemap policy, or calculator logic.

## 2. Comparison Period

- Recent 7 days: ${recent.start} to ${recent.end} (${daysInclusive(recent.start, recent.end)} days)
- Previous 7 days: ${previous.start} to ${previous.end} (${daysInclusive(previous.start, previous.end)} days)
- Overlap: ${rangesOverlap(recent, previous) ? "YES_REVIEW_REQUIRED" : "NO"}
- GSC latest date completeness: ${summary.channels.gsc.notes.join("; ")}

## 3. Data Completeness

${makeMarkdownTable(["File", "Status", "Bytes"], dataCompleteness.baselineFiles.map((file) => ({
    File: file.path,
    Status: file.exists ? "PASS" : "MISSING",
    Bytes: file.bytes,
  })))}

GSC detailed exports: ${gscRowsAvailable ? "AVAILABLE" : "GSC_PAGE_QUERY_EXPORT_REQUIRED"}.

## 4. Google Search Console

- Status: ${statuses.gsc}
- Clicks: ${changes.gsc.clicks.previous} -> ${changes.gsc.clicks.current} (${formatSignedNumber(changes.gsc.clicks.delta)})
- Impressions: ${changes.gsc.impressions.previous} -> ${changes.gsc.impressions.current} (${formatSignedNumber(changes.gsc.impressions.delta)}, ${formatPct(changes.gsc.impressions.pctChange)})
- CTR: ${formatCtr(changes.gsc.ctr.previous)} -> ${formatCtr(changes.gsc.ctr.current)} (${formatPp(changes.gsc.ctr.ppDelta)})
- Average position: ${formatNumber(changes.gsc.position.previous, 1)} -> ${formatNumber(changes.gsc.position.current, 1)} (${formatSignedNumber(changes.gsc.position.delta, 1)}; positive is worse)
- Top recent query: ${summary.channels.gsc.recent.topQuery}
- Top recent page: ${summary.channels.gsc.recent.topPage}

## 5. GSC Page Loss

${gsc.page.available ? makeMarkdownTable(["URL", "Prev Impr", "Recent Impr", "Loss", "Loss Share", "Status"], gscTopPageRows) : "DATA_REQUIRED: add gsc-recent-pages.csv and gsc-previous-pages.csv to the weekly input directory. No virtual page loss data was created."}

## 6. GSC Query Loss

${gsc.query.available ? makeMarkdownTable(["Query", "Prev Impr", "Recent Impr", "Loss", "Loss Share", "Status"], gscTopQueryRows) : "DATA_REQUIRED: add gsc-recent-queries.csv and gsc-previous-queries.csv to the weekly input directory. The recent top query site:www.finmaphub.com is separated from normal growth queries."}

## 7. GSC Path Group Loss

${gsc.pathGroups.length ? makeMarkdownTable(["Group", "Prev Clicks", "Recent Clicks", "Prev Impr", "Recent Impr", "Loss Share", "Position Delta"], pathRows) : "DATA_REQUIRED: path group loss needs GSC page exports."}

## 8. Bing Webmaster Tools

- Status: ${statuses.bing}
- Clicks: ${changes.bing.clicks.previous} -> ${changes.bing.clicks.current} (${formatSignedNumber(changes.bing.clicks.delta)})
- Impressions: ${changes.bing.impressions.previous} -> ${changes.bing.impressions.current} (${formatSignedNumber(changes.bing.impressions.delta)}, ${formatPct(changes.bing.impressions.pctChange)})
- CTR: ${formatCtr(changes.bing.ctr.previous)} -> ${formatCtr(changes.bing.ctr.current)} (${formatPp(changes.bing.ctr.ppDelta)})
- Position: unavailable in the provided weekly summary.
- Interpretation: positive but low-volume; do not over-weight it.

## 9. Naver Search Advisor

- Status: ${statuses.naver}
- Clicks: ${changes.naver.clicks.previous} -> ${changes.naver.clicks.current} (${formatSignedNumber(changes.naver.clicks.delta)}, ${formatPct(changes.naver.clicks.pctChange)})
- Impressions: ${changes.naver.impressions.previous} -> ${changes.naver.impressions.current} (${formatSignedNumber(changes.naver.impressions.delta)}, ${formatPct(changes.naver.impressions.pctChange)})
- Top query change: ${summary.channels.naver.recent.topQueryChange}
- Top page change: ${summary.channels.naver.recent.topPageChange}

## 10. Calculated Naver CTR

- Previous CTR: 74 / 15,844 = ${formatCtr(changes.naver.ctr.previous)}
- Recent CTR: 92 / 15,108 = ${formatCtr(changes.naver.ctr.current)}
- Change: ${formatPp(changes.naver.ctr.ppDelta)}

## 11. GA4 All-Traffic Result

- Status: ${statuses.ga4}
- Sessions: ${changes.ga4.sessions.previous} -> ${changes.ga4.sessions.current} (${formatSignedNumber(changes.ga4.sessions.delta)}, ${formatPct(changes.ga4.sessions.pctChange)})
- Active users: ${changes.ga4.activeUsers.previous} -> ${changes.ga4.activeUsers.current} (${formatSignedNumber(changes.ga4.activeUsers.delta)}, ${formatPct(changes.ga4.activeUsers.pctChange)})
- New users: ${changes.ga4.newUsers.previous} -> ${changes.ga4.newUsers.current} (${formatSignedNumber(changes.ga4.newUsers.delta)}, ${formatPct(changes.ga4.newUsers.pctChange)})

${makeMarkdownTable(["Path", "Previous", "Recent", "Delta", "Change"], ga4Rows)}

## 12. GA4 Attribution Limitation

The provided GA4 screen is an all-traffic landing page report. It is not filtered to google / organic, naver / organic, or bing / organic. The all-traffic decline should not be treated as Google organic decline. Key events = 0 on that screen should not be treated as calculator event count = 0; Events or Explore reports must be checked separately.

## 13. GA4 Event Measurement Readiness

${makeMarkdownTable(["Check", "File", "Status", "Missing"], auditRows)}

Static result: ${ga4Audit.every((row) => row.status === "PASS") ? "PASS" : "GA4_CODE_REVIEW_REQUIRED"}. No GA4 event names, parameters, or code paths were changed.

## 14. Naver Calculator SERP Baseline

Created: reports/naver-calculator-weekly-serp-baseline.csv.

The file is a manual-entry baseline only. It does not crawl Naver and leaves observed rank/result fields for the user to fill from incognito or real-device checks.

## 15. Platform Divergence

- Google: critical impression and position decline.
- Naver: click and CTR improvement despite slightly lower impressions.
- Bing: small-sample growth.
- GA4: all-channel traffic decline, attribution missing.

## 16. Technical vs Ranking Diagnosis

Diagnosis: ${gscRowsAvailable ? "RANKING_OR_RELEVANCE_DROP_REVIEW_WITH_EXPORTS" : "INSUFFICIENT_EXPORT_DATA"}.

Existing P0-P1 observation baseline deploy date: ${deployDate}. Because the deploy date remains pending or unknown in local reports, this weekly Google drop is not attributed to local P0-P1 changes. With no page/query export, a technical indexing failure is not confirmed; previous audits recorded 200/canonical/noindex/sitemap checks separately.

## 17. 상승 요인

- Naver clicks increased by ${formatSignedNumber(changes.naver.clicks.delta)} and calculated CTR improved by ${formatPp(changes.naver.ctr.ppDelta)}.
- Bing clicks and impressions rose from a small base.
- Mortgage-related Naver query movement is visible around DSR/LTV and the new mortgage calculator topic.

## 18. 정체 요인

- Bing sample size remains too small for a strong growth conclusion.
- GA4 source/medium split is missing from the provided screen.
- Naver impressions decreased slightly even as clicks improved.

## 19. 하락 요인

- GSC impressions dropped by ${Math.abs(changes.gsc.impressions.delta)} (${formatPct(changes.gsc.impressions.pctChange)}).
- GSC clicks fell from 2 to 0.
- Average position worsened by ${formatNumber(changes.gsc.position.delta, 1)} positions.
- GA4 all-traffic sessions fell by ${Math.abs(changes.ga4.sessions.delta)}.

## 20. 이번 주 조치

No page, content, calculator, canonical, hreflang, robots, sitemap, GA4 event, ad, commit, push, or deploy action should be taken from the provided weekly summary alone. This week should remain an export-and-measurement diagnosis step.

## 21. 다음 주 우선 작업 3개

1. Export GSC recent/previous 7-day page and query CSVs, then explain the 384-impression loss by URL and query.
2. Build the GA4 channel-specific landing page and calculator event views for google / organic, naver / organic, and bing / organic.
3. Fill the Naver calculator SERP baseline manually for the listed calculator queries without changing title or description.

## 22. Do-Not-Change List

Titles, descriptions, H1s, first paragraphs, post bodies, internal links, calculator UI, calculation logic, GA4 event names, GA4 event parameters, ad structure, canonical, hreflang, robots, sitemap policy, slugs, redirects, and production settings were not changed.

## 23. Files Created

${outputs.map((file) => `- ${file}`).join("\n")}

## 24. Verification

To be updated after local commands:

- node --check scripts\\analyze_weekly_search_growth.js
- node scripts\\analyze_weekly_search_growth.js
- node scripts\\verify_tool_result_cta_events.js
- npm.cmd run check:posts-links
- npm.cmd run build
- node scripts\\audit_search_growth_baseline.js
- git diff --check
- git status --short --untracked-files=all

## 25. Final Verdict

${statuses.overall}. The recommended next step is to decide Google content changes only after the GSC page/query loss map is populated from real exports.
`;
}

function renderP1_2BReport(data) {
  const { summary, changes, statuses, dataCompleteness, gsc, deployDecision, followUpTargets } = data;
  const gscRowsAvailable = gsc.page.available && gsc.query.available;
  const fileDiagnosticsRows = REQUIRED_P1_2B_GSC_KEYS.map((key) => {
    const diagnostics = dataCompleteness.inputDiagnostics.files[key];
    return {
      File: diagnostics.path,
      Status: diagnostics.status,
      Rows: diagnostics.rowCount,
      Clicks: diagnostics.totals.clicks ?? "",
      Impressions: diagnostics.totals.impressions ?? "",
      Delimiter: diagnostics.delimiter ?? "",
      Duplicates: diagnostics.duplicateRows,
      "Parse Failures": diagnostics.parsingFailures,
    };
  });
  const reportTotalRows = [
    {
      Scope: "GSC report recent",
      Clicks: summary.channels.gsc.recent.clicks,
      Impressions: summary.channels.gsc.recent.impressions,
      CTR: formatCtr(changes.gsc.ctr.current),
      Position: formatNumber(summary.channels.gsc.recent.averagePosition, 1),
    },
    {
      Scope: "GSC report previous",
      Clicks: summary.channels.gsc.previous.clicks,
      Impressions: summary.channels.gsc.previous.impressions,
      CTR: formatCtr(changes.gsc.ctr.previous),
      Position: formatNumber(summary.channels.gsc.previous.averagePosition, 1),
    },
  ];
  const pageTotalRows = [
    {
      Scope: "Page table recent",
      Clicks: dataCompleteness.inputDiagnostics.totals.pageTable.recent.clicks ?? "",
      Impressions: dataCompleteness.inputDiagnostics.totals.pageTable.recent.impressions ?? "",
      CTR: formatCtr(dataCompleteness.inputDiagnostics.totals.pageTable.recent.ctr),
      Position: formatNumber(dataCompleteness.inputDiagnostics.totals.pageTable.recent.weightedPosition, 1),
    },
    {
      Scope: "Page table previous",
      Clicks: dataCompleteness.inputDiagnostics.totals.pageTable.previous.clicks ?? "",
      Impressions: dataCompleteness.inputDiagnostics.totals.pageTable.previous.impressions ?? "",
      CTR: formatCtr(dataCompleteness.inputDiagnostics.totals.pageTable.previous.ctr),
      Position: formatNumber(dataCompleteness.inputDiagnostics.totals.pageTable.previous.weightedPosition, 1),
    },
  ];
  const queryTotalRows = [
    {
      Scope: "Query table recent",
      Clicks: dataCompleteness.inputDiagnostics.totals.queryTable.recent.clicks ?? "",
      Impressions: dataCompleteness.inputDiagnostics.totals.queryTable.recent.impressions ?? "",
      CTR: formatCtr(dataCompleteness.inputDiagnostics.totals.queryTable.recent.ctr),
      Position: formatNumber(dataCompleteness.inputDiagnostics.totals.queryTable.recent.weightedPosition, 1),
    },
    {
      Scope: "Query table previous",
      Clicks: dataCompleteness.inputDiagnostics.totals.queryTable.previous.clicks ?? "",
      Impressions: dataCompleteness.inputDiagnostics.totals.queryTable.previous.impressions ?? "",
      CTR: formatCtr(dataCompleteness.inputDiagnostics.totals.queryTable.previous.ctr),
      Position: formatNumber(dataCompleteness.inputDiagnostics.totals.queryTable.previous.weightedPosition, 1),
    },
  ];
  const topPageRows = gsc.page.rows.slice(0, 20).map((row) => ({
    URL: row.url,
    "Prev Impr": row.previous_impressions,
    "Recent Impr": row.recent_impressions,
    Delta: row.impression_delta,
    Share: formatCtr(row.lost_impression_share || 0, 1),
    Diagnosis: row.diagnosis || row.status,
    Action: row.recommended_action || "",
  }));
  const pathRows = gsc.pathGroups.map((row) => ({
    Group: row.path_group,
    "Prev Impr": row.previous_impressions,
    "Recent Impr": row.recent_impressions,
    Delta: row.impression_delta,
    Share: formatCtr((row.loss_share ?? row.lost_impression_contribution) || 0, 1),
    Before: row.page_count_before,
    After: row.page_count_after,
    Disappeared: row.disappeared_page_count,
  }));
  const calculatorRows = gsc.calculators.map((row) => ({
    URL: row.calculator_url,
    "Prev Impr": row.previous_impressions,
    "Recent Impr": row.recent_impressions,
    "Prev Clicks": row.previous_clicks,
    "Recent Clicks": row.recent_clicks,
    Disappeared: row.disappeared,
    Diagnosis: row.google_loss_diagnosis,
  }));
  const topQueryRows = gsc.query.rows.slice(0, 30).map((row) => ({
    Query: row.query,
    Family: row.query_family,
    "Prev Impr": row.previous_impressions,
    "Recent Impr": row.recent_impressions,
    Delta: row.impression_delta,
    Share: formatCtr((row.loss_share ?? row.lost_impression_share) || 0, 1),
    Target: row.likely_target_url || "",
    Confidence: row.target_confidence || "",
  }));
  const queryFamilyRows = gsc.queryFamilies.map((row) => ({
    Family: row.query_family,
    "Prev Impr": row.previous_impressions,
    "Recent Impr": row.recent_impressions,
    Loss: row.loss,
    Share: formatCtr(row.loss_share || 0, 1),
    Before: row.query_count_before,
    After: row.query_count_after,
    Disappeared: row.disappeared_query_count,
  }));
  const brandedRows = gsc.query.rows
    .filter((row) => row.query_family === "brand" || row.query_family === "site operator")
    .slice(0, 20)
    .map((row) => ({
      Query: row.query,
      Family: row.query_family,
      "Prev Impr": row.previous_impressions,
      "Recent Impr": row.recent_impressions,
      Delta: row.impression_delta,
    }));
  const followRows = (followUpTargets.targets || []).slice(0, 5).map((row) => ({
    Priority: row.priority,
    Target: row.target,
    Type: row.type,
    Reason: row.reason,
  }));

  return `# Search Growth Weekly GSC Loss Map: 2026-07-22 to 2026-07-28

Generated: 2026-07-29

## Executive Summary

Overall verdict: ${statuses.overall}.

GSC report-level impressions fell from ${changes.gsc.impressions.previous} to ${changes.gsc.impressions.current} (${formatPct(changes.gsc.impressions.pctChange)}), with clicks 2 -> 0 and average position 9.9 -> 15.0. The current workspace does ${gscRowsAvailable ? "contain" : "not contain"} the four required P1-2B GSC page/query CSV exports, so URL/query-level root cause is ${gscRowsAvailable ? "available below" : "blocked by missing input files"}.

## Data Completeness

${makeMarkdownTable(["File", "Status", "Rows", "Clicks", "Impressions", "Delimiter", "Duplicates", "Parse Failures"], fileDiagnosticsRows)}

Required GSC CSV readiness: ${dataCompleteness.inputDiagnostics.requiredFilesAvailable ? "PASS" : "FAIL_MISSING_REQUIRED_GSC_CSVS"}.

## Provisional Data Warning

Status: RECENT_GSC_DATA_MAY_BE_PROVISIONAL.

The analysis run date is 2026-07-29 and the recent period ended on 2026-07-28. The latest GSC day can still be provisional. This does not fully explain a -92.8% weekly drop, but the same exact period should be downloaded again after 2-3 days before content changes.

## GSC Report Totals

${makeMarkdownTable(["Scope", "Clicks", "Impressions", "CTR", "Position"], reportTotalRows)}

## Page Table Totals

${makeMarkdownTable(["Scope", "Clicks", "Impressions", "CTR", "Position"], pageTotalRows)}

Unexplained or anonymized page-table impression difference:

- Recent: ${dataCompleteness.inputDiagnostics.unexplainedOrAnonymizedDifference.pageRecentImpressions ?? "n/a"}
- Previous: ${dataCompleteness.inputDiagnostics.unexplainedOrAnonymizedDifference.pagePreviousImpressions ?? "n/a"}

## Query Table Totals

${makeMarkdownTable(["Scope", "Clicks", "Impressions", "CTR", "Position"], queryTotalRows)}

Unexplained or anonymized query-table impression difference:

- Recent: ${dataCompleteness.inputDiagnostics.unexplainedOrAnonymizedDifference.queryRecentImpressions ?? "n/a"}
- Previous: ${dataCompleteness.inputDiagnostics.unexplainedOrAnonymizedDifference.queryPreviousImpressions ?? "n/a"}

## Top Page Losses

${gsc.page.available ? makeMarkdownTable(["URL", "Prev Impr", "Recent Impr", "Delta", "Share", "Diagnosis", "Action"], topPageRows) : "DATA_REQUIRED: gsc-recent-pages.csv and gsc-previous-pages.csv are missing from the required weekly input directory."}

Page concentration:

- Top 1 share: ${formatCtr(gsc.pageConcentration.top1, 1)}
- Top 3 share: ${formatCtr(gsc.pageConcentration.top3, 1)}
- Top 5 share: ${formatCtr(gsc.pageConcentration.top5, 1)}
- Top 10 share: ${formatCtr(gsc.pageConcentration.top10, 1)}

## Path Group Losses

${gsc.page.available ? makeMarkdownTable(["Group", "Prev Impr", "Recent Impr", "Delta", "Share", "Before", "After", "Disappeared"], pathRows) : "DATA_REQUIRED: path group loss needs page exports."}

## Calculator Losses

${gsc.page.available ? makeMarkdownTable(["URL", "Prev Impr", "Recent Impr", "Prev Clicks", "Recent Clicks", "Disappeared", "Diagnosis"], calculatorRows) : "DATA_REQUIRED: calculator loss needs page exports."}

## Top Query Losses

${gsc.query.available ? makeMarkdownTable(["Query", "Family", "Prev Impr", "Recent Impr", "Delta", "Share", "Target", "Confidence"], topQueryRows) : "DATA_REQUIRED: gsc-recent-queries.csv and gsc-previous-queries.csv are missing from the required weekly input directory."}

## Query Family Losses

${gsc.query.available ? makeMarkdownTable(["Family", "Prev Impr", "Recent Impr", "Loss", "Share", "Before", "After", "Disappeared"], queryFamilyRows) : "DATA_REQUIRED: query family loss needs query exports."}

## Branded and Site Queries

${brandedRows.length ? makeMarkdownTable(["Query", "Family", "Prev Impr", "Recent Impr", "Delta"], brandedRows) : "No branded/site query table can be produced without query exports. site:www.finmaphub.com is still separated from normal growth queries by rule."}

## Technical vs Ranking Diagnosis

Diagnosis: ${gsc.technicalDiagnosis}.

No technical indexing failure is concluded from this local run. Existing evidence says key URLs had HTTP 200, self canonical, no noindex, sitemap presence, no manual action/security issue evidence, and P0-P1 local changes were not deployed when the Google drop was observed. ${gscRowsAvailable ? "With the provided page/query CSVs, the loss is interpreted as visibility/ranking distribution rather than a confirmed indexing failure." : "With missing CSVs, the diagnosis remains insufficient rather than technical-failure."}

## P0-P1 Deploy Decision

Decision: ${deployDecision.decision}.

Recommendation: ${deployDecision.recommendation}

Reason: ${deployDecision.reason}

Deployment performed: ${deployDecision.deploymentPerformed ? "yes" : "no"}.

## Follow-up Candidates

${makeMarkdownTable(["Priority", "Target", "Type", "Reason"], followRows)}

Follow-up candidates are capped at ${followRows.length} and no source edits were made.

## Do-Not-Change List

Titles, descriptions, H1s, first paragraphs, post bodies, new content, calculator UI, calculation logic, GA4 events, ad structure, internal links, canonical, hreflang, robots, sitemap policy, redirects, dependencies, and production settings were not changed.

## 2-to-3-Day Recheck Plan

1. Download the same GSC period again after 2-3 days.
2. Save the four CSVs under reports/search-weekly-input/2026-07-22_2026-07-28/.
3. Rerun node scripts\\analyze_weekly_search_growth.js.
4. Compare page/query loss maps before any Google-targeted source edits.

## 28-Day Observation Plan

If P0-P1 is deployed separately, record the real deploy date in the observation baseline, watch the affected URLs for at least 28 days, and avoid repeated title/description rewrites during the observation window.

## Files Created

${data.outputs.map((file) => `- ${file}`).join("\n")}

## Verification

To be updated after local commands:

- node --check scripts\\analyze_weekly_search_growth.js
- node scripts\\analyze_weekly_search_growth.js
- node scripts\\verify_tool_result_cta_events.js
- npm.cmd run check:posts-links
- npm.cmd run build
- node scripts\\audit_search_growth_baseline.js
- git diff --check
- git status --short --untracked-files=all

## No Runtime or Content Changes

P1-2B changed local analysis/report artifacts only. No page/content/calculator runtime source was edited.

## Local-only Confirmation

- deployment 없음
- commit 없음
- push 없음

## Recommended Next Step

2~3일 후 동일 기간 CSV 재다운로드 결과와 비교한 뒤 Google 대상 수정 여부를 결정한다.
`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const currentDir = posixPath(args.current || DEFAULT_CURRENT_DIR);
  const previousDir = posixPath(args.previous || DEFAULT_PREVIOUS_DIR);
  const outputMd = posixPath(args.output || DEFAULT_OUTPUT_MD);
  const outputJson = posixPath(args.json || DEFAULT_OUTPUT_JSON);
  const summaryPath = path.join(currentDir, "weekly-summary.json").replace(/\\/g, "/");

  if (!fs.existsSync(fromRoot(summaryPath))) {
    throw new Error(`weekly-summary.json not found: ${summaryPath}`);
  }

  const summary = readJson(summaryPath);
  const periodCheck = {
    recentDays: daysInclusive(summary.periods.recent.start, summary.periods.recent.end),
    previousDays: daysInclusive(summary.periods.previous.start, summary.periods.previous.end),
    overlap: rangesOverlap(summary.periods.recent, summary.periods.previous),
  };
  if (periodCheck.recentDays !== 7 || periodCheck.previousDays !== 7 || periodCheck.overlap) {
    throw new Error(`Invalid comparison periods: ${JSON.stringify(periodCheck)}`);
  }

  const gscChanges = summarizeChannel(summary.channels.gsc.recent, summary.channels.gsc.previous);
  const bingChanges = summarizeChannel(summary.channels.bing.recent, summary.channels.bing.previous, {
    positionUnavailable: true,
  });
  const naverChanges = summarizeChannel(summary.channels.naver.recent, summary.channels.naver.previous, {
    positionUnavailable: true,
  });
  const ga4Changes = summarizeGa4(summary);
  const changes = {
    gsc: gscChanges,
    bing: bingChanges,
    naver: naverChanges,
    ga4: ga4Changes,
  };
  const statuses = classifyChannels(changes);

  const csvFiles = {};
  for (const [key, fileName] of Object.entries(GSC_CSV_NAMES)) {
    csvFiles[key] = readCsvIfExists(findCsv(currentDir, previousDir, fileName));
  }
  const requiredGscCsvsAvailable = REQUIRED_P1_2B_GSC_KEYS.every((key) => csvFiles[key].exists);

  const sitemapPaths = loadSitemapPaths();
  const inventoryMap = loadInventoryMap();
  let pageRows = buildMissingRows("page");
  let queryRows = buildMissingRows("query");
  let pageAnalysis = { available: false, rows: pageRows, totalLoss: 0 };
  let queryAnalysis = { available: false, rows: queryRows, totalLoss: 0 };
  let pathGroups = buildMissingPathRows();
  let queryFamilyRows = buildMissingQueryFamilyRows();
  let calculatorRows = buildMissingCalculatorRows();

  if (csvFiles.previousPages.exists && csvFiles.recentPages.exists) {
    const compared = compareDimension(
      csvFiles.previousPages.rows,
      csvFiles.recentPages.rows,
      "page",
      sitemapPaths,
      inventoryMap
    );
    pageRows = compared.rows;
    pageAnalysis = { available: true, rows: pageRows, totalLoss: compared.totalLoss };
    pathGroups = aggregatePathGroups(pageRows);
    calculatorRows = calculatorLossRows(pageRows);
  }
  if (csvFiles.previousQueries.exists && csvFiles.recentQueries.exists) {
    const compared = compareDimension(
      csvFiles.previousQueries.rows,
      csvFiles.recentQueries.rows,
      "query",
      sitemapPaths,
      inventoryMap
    );
    queryRows = compared.rows;
    queryAnalysis = { available: true, rows: queryRows, totalLoss: compared.totalLoss };
    queryFamilyRows = aggregateQueryFamilies(queryRows);
  }

  const technicalDiagnosis = diagnoseTechnicalVsRanking(requiredGscCsvsAvailable, pageRows, queryRows);
  const deployDate = readObservationDeployStatus();
  const deployDecision = makeDeployDecision(requiredGscCsvsAvailable, technicalDiagnosis, deployDate);
  const followUpTargets = makeFollowUpTargets(requiredGscCsvsAvailable, pageRows, queryRows);
  if (!requiredGscCsvsAvailable) {
    statuses.overall = "INPUT_BLOCKED_GSC_CSVS_MISSING";
    statuses.gsc = "CRITICAL_DECLINE_REQUIRES_GSC_CSV_EXPORTS";
  }

  const pageHeaders = [
    "status",
    "url",
    "locale",
    "content_type",
    "category",
    "role",
    "previous_clicks",
    "recent_clicks",
    "click_delta",
    "previous_impressions",
    "recent_impressions",
    "impression_delta",
    "impression_change_rate",
    "lost_impression_share",
    "previous_ctr",
    "recent_ctr",
    "ctr_pp_delta",
    "previous_position",
    "recent_position",
    "position_delta",
    "path_group",
    "inventory_match",
    "sitemap_membership",
    "current_title",
    "current_h1",
    "last_modified",
    "recent_local_change",
    "currently_deployed_change",
    "diagnosis",
    "confidence",
    "recommended_action",
  ];
  const queryHeaders = [
    "status",
    "query",
    "normalized_query",
    "query_family",
    "locale",
    "is_branded",
    "previous_clicks",
    "recent_clicks",
    "click_delta",
    "previous_impressions",
    "recent_impressions",
    "impression_delta",
    "loss_share",
    "lost_impression_share",
    "previous_ctr",
    "recent_ctr",
    "ctr_pp_delta",
    "previous_position",
    "recent_position",
    "position_delta",
    "likely_intent",
    "likely_target_url",
    "target_confidence",
    "query_url_confidence",
    "diagnosis",
  ];
  const pathHeaders = [
    "path_group",
    "previous_clicks",
    "recent_clicks",
    "previous_impressions",
    "recent_impressions",
    "impression_delta",
    "loss_share",
    "lost_impression_contribution",
    "previous_weighted_position",
    "recent_weighted_position",
    "previous_position",
    "recent_position",
    "position_delta",
    "page_count_before",
    "page_count_after",
    "disappeared_page_count",
  ];
  const queryFamilyHeaders = [
    "query_family",
    "previous_impressions",
    "recent_impressions",
    "loss",
    "loss_share",
    "previous_weighted_position",
    "recent_weighted_position",
    "position_delta",
    "query_count_before",
    "query_count_after",
    "disappeared_query_count",
  ];
  const calculatorHeaders = [
    "calculator_url",
    "previous_impressions",
    "recent_impressions",
    "previous_clicks",
    "recent_clicks",
    "previous_position",
    "recent_position",
    "disappeared",
    "naver_current_performance_reference",
    "bing_current_performance_reference",
    "content_or_technical_change",
    "google_loss_diagnosis",
  ];

  writeCsv(PAGE_LOSS_OUTPUT, formatLossRowsForCsv(pageRows, "page"), pageHeaders);
  writeCsv(QUERY_LOSS_OUTPUT, formatLossRowsForCsv(queryRows, "query"), queryHeaders);
  writeCsv(
    PATH_LOSS_OUTPUT,
    pathGroups.map((row) => ({
      ...row,
      loss_share: row.loss_share === "" ? "" : round(row.loss_share ?? row.lost_impression_contribution, 6),
      lost_impression_contribution:
        row.lost_impression_contribution === "" ? "" : round(row.lost_impression_contribution, 6),
      previous_weighted_position: row.previous_weighted_position ?? round(row.previous_position, 2),
      recent_weighted_position: row.recent_weighted_position ?? round(row.recent_position, 2),
      previous_position: row.previous_position === "" ? "" : round(row.previous_position, 2),
      recent_position: row.recent_position === "" ? "" : round(row.recent_position, 2),
      position_delta: row.position_delta === "" ? "" : round(row.position_delta, 2),
    })),
    pathHeaders
  );
  writeCsv(
    QUERY_FAMILY_LOSS_OUTPUT,
    queryFamilyRows.map((row) => ({
      ...row,
      loss_share: row.loss_share === "" ? "" : round(row.loss_share, 6),
      previous_weighted_position:
        row.previous_weighted_position === "" ? "" : round(row.previous_weighted_position, 2),
      recent_weighted_position: row.recent_weighted_position === "" ? "" : round(row.recent_weighted_position, 2),
      position_delta: row.position_delta === "" ? "" : round(row.position_delta, 2),
    })),
    queryFamilyHeaders
  );
  writeCsv(CALCULATOR_LOSS_OUTPUT, calculatorRows, calculatorHeaders);

  const inputDiagnostics = {
    generatedAt: "2026-07-29",
    inputDir: currentDir,
    requiredFilesAvailable: requiredGscCsvsAvailable,
    freshnessStatus: "RECENT_GSC_DATA_MAY_BE_PROVISIONAL",
    expectedReportTotals: {
      recent: {
        clicks: summary.channels.gsc.recent.clicks,
        impressions: summary.channels.gsc.recent.impressions,
      },
      previous: {
        clicks: summary.channels.gsc.previous.clicks,
        impressions: summary.channels.gsc.previous.impressions,
      },
    },
    files: Object.fromEntries(Object.entries(csvFiles).map(([key, value]) => [key, value.diagnostics])),
    totals: {
      report: {
        recent: {
          clicks: summary.channels.gsc.recent.clicks,
          impressions: summary.channels.gsc.recent.impressions,
        },
        previous: {
          clicks: summary.channels.gsc.previous.clicks,
          impressions: summary.channels.gsc.previous.impressions,
        },
      },
      pageTable: {
        recent: csvFiles.recentPages.diagnostics.totals,
        previous: csvFiles.previousPages.diagnostics.totals,
      },
      queryTable: {
        recent: csvFiles.recentQueries.diagnostics.totals,
        previous: csvFiles.previousQueries.diagnostics.totals,
      },
    },
    unexplainedOrAnonymizedDifference: {
      pageRecentImpressions:
        csvFiles.recentPages.diagnostics.totals.impressions === null
          ? null
          : summary.channels.gsc.recent.impressions - csvFiles.recentPages.diagnostics.totals.impressions,
      pagePreviousImpressions:
        csvFiles.previousPages.diagnostics.totals.impressions === null
          ? null
          : summary.channels.gsc.previous.impressions - csvFiles.previousPages.diagnostics.totals.impressions,
      queryRecentImpressions:
        csvFiles.recentQueries.diagnostics.totals.impressions === null
          ? null
          : summary.channels.gsc.recent.impressions - csvFiles.recentQueries.diagnostics.totals.impressions,
      queryPreviousImpressions:
        csvFiles.previousQueries.diagnostics.totals.impressions === null
          ? null
          : summary.channels.gsc.previous.impressions - csvFiles.previousQueries.diagnostics.totals.impressions,
    },
  };
  writeJson(INPUT_DIAGNOSTICS_OUTPUT, inputDiagnostics);
  writeJson(DEPLOY_DECISION_OUTPUT, deployDecision);
  writeJson(FOLLOW_UP_TARGETS_OUTPUT, followUpTargets);

  const nextActions = {
    generatedAt: "2026-07-29",
    verdict: statuses.overall,
    actions: [
      {
        priority: 1,
        action: "Export GSC page/query CSVs for both 7-day periods and populate the loss map.",
        reason: "Google impressions fell by 384, but page/query contribution is unavailable without exports.",
        forbiddenUntilComplete: ["title changes", "description changes", "Google-targeted content edits"],
      },
      {
        priority: 2,
        action: "Create GA4 channel-specific landing page and calculator event views.",
        reason: "The provided GA4 landing page screen is all-traffic and cannot attribute decline to organic Google.",
        forbiddenUntilComplete: ["event name changes", "event parameter changes"],
      },
      {
        priority: 3,
        action: "Fill the Naver calculator SERP baseline manually.",
        reason: "Naver clicks and CTR improved, so calculator SERP positions should be observed before any metadata edits.",
        forbiddenUntilComplete: ["Naver automated crawling", "calculator title/description edits"],
      },
    ],
  };
  writeJson(NEXT_ACTIONS_OUTPUT, nextActions);

  const outputs = [
    "scripts/analyze_weekly_search_growth.js",
    "reports/search-weekly-input/README.md",
    "reports/search-weekly-input/2026-07-22_2026-07-28/weekly-summary.json",
    outputMd,
    outputJson,
    PAGE_LOSS_OUTPUT,
    QUERY_LOSS_OUTPUT,
    PATH_LOSS_OUTPUT,
    QUERY_FAMILY_LOSS_OUTPUT,
    CALCULATOR_LOSS_OUTPUT,
    INPUT_DIAGNOSTICS_OUTPUT,
    "reports/ga4-weekly-search-channel-check.md",
    "reports/naver-calculator-weekly-serp-baseline.csv",
    DEPLOY_DECISION_OUTPUT,
    FOLLOW_UP_TARGETS_OUTPUT,
    NEXT_ACTIONS_OUTPUT,
  ];

  const data = {
    generatedAt: "2026-07-29",
    input: { currentDir, previousDir, summaryPath },
    summary,
    periodCheck,
    changes,
    statuses,
    dataCompleteness: {
      baselineFiles: REQUIRED_BASELINE_FILES.map(fileInfo),
      gscCsvFiles: Object.fromEntries(
        Object.entries(csvFiles).map(([key, value]) => [key, {
          path: value.path,
          exists: value.exists,
          rows: value.rows.length,
          totals: value.diagnostics.totals,
        }])
      ),
      inputDiagnostics,
    },
    gsc: {
      page: pageAnalysis,
      query: queryAnalysis,
      pathGroups,
      queryFamilies: queryFamilyRows,
      calculators: calculatorRows,
      technicalDiagnosis,
      pageConcentration: {
        top1: totalLossShareAt(pageRows, 1),
        top3: totalLossShareAt(pageRows, 3),
        top5: totalLossShareAt(pageRows, 5),
        top10: totalLossShareAt(pageRows, 10),
      },
      queryConcentration: {
        top1: totalLossShareAt(queryRows, 1),
        top3: totalLossShareAt(queryRows, 3),
        top5: totalLossShareAt(queryRows, 5),
        top10: totalLossShareAt(queryRows, 10),
      },
      auxiliary: {
        countriesAvailable: csvFiles.recentCountries.exists && csvFiles.previousCountries.exists,
        devicesAvailable: csvFiles.recentDevices.exists && csvFiles.previousDevices.exists,
        searchAppearanceAvailable:
          csvFiles.recentSearchAppearance.exists && csvFiles.previousSearchAppearance.exists,
      },
    },
    ga4: ga4Changes,
    ga4Audit: inspectGa4Code(),
    deployDate,
    deployDecision,
    followUpTargets,
    nextActions,
    outputs,
  };

  writeJson(outputJson, data);
  writeText(outputMd, renderP1_2BReport(data));

  console.log(`PASS weekly search growth analysis written to ${outputMd}`);
  console.log(`PASS JSON written to ${outputJson}`);
  console.log(`PASS GSC page loss written to ${PAGE_LOSS_OUTPUT}`);
  console.log(`PASS GSC query loss written to ${QUERY_LOSS_OUTPUT}`);
  console.log(`PASS GSC path loss written to ${PATH_LOSS_OUTPUT}`);
  console.log(`PASS GSC query family loss written to ${QUERY_FAMILY_LOSS_OUTPUT}`);
  console.log(`PASS GSC calculator loss written to ${CALCULATOR_LOSS_OUTPUT}`);
  console.log(`PASS GSC input diagnostics written to ${INPUT_DIAGNOSTICS_OUTPUT}`);
  if (!requiredGscCsvsAvailable) {
    console.log("WARN GSC_PAGE_QUERY_EXPORT_REQUIRED");
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`FAIL ${error.message}`);
    process.exitCode = 1;
  }
}
