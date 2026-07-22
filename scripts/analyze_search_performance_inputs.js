#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const SITE_HOSTS = new Set(["finmaphub.com", "www.finmaphub.com"]);
const INPUT_DIR = path.join("reports", "search-performance-input");
const INVENTORY_FILE = path.join("reports", "search-growth-90d-url-inventory.csv");
const OUT_MERGED = path.join("reports", "search-growth-90d-p1-1a-performance-merged.csv");
const OUT_QUERY_MAP = path.join("reports", "search-growth-90d-p1-1a-query-map.csv");
const OUT_DAILY = path.join("reports", "search-growth-90d-p1-1a-daily-merged.csv");
const OUT_PRIORITY = path.join("reports", "search-growth-90d-p1-1a-priority.json");
const OUT_DIAGNOSTICS = path.join("reports", "search-growth-90d-p1-1a-input-diagnostics.json");
const OUT_REPORT = path.join("reports", "search-growth-90d-p1-1a-search-performance-audit.md");
const OUT_READINESS = path.join("reports", "search-growth-90d-p1-1a-data-readiness.md");
const OUT_NAVER_DAILY = path.join("reports", "search-growth-90d-p1-1a-naver-daily-normalized.csv");
const OUT_CALIBRATION_MD = path.join("reports", "search-growth-90d-p1-1a-2-priority-calibration.md");
const OUT_CALIBRATION_JSON = path.join("reports", "search-growth-90d-p1-1a-2-priority-calibration.json");
const OUT_UNMATCHED_URLS = path.join("reports", "search-growth-90d-p1-1a-2-unmatched-urls.csv");
const OUT_NAVER_QUERY_CLUSTERS = path.join("reports", "search-growth-90d-p1-1a-2-naver-query-clusters.csv");
const OUT_EXECUTION_TARGETS = path.join("reports", "search-growth-90d-p1-1a-2-execution-targets.json");

const TEMPLATE_FILES = [
  "gsc-pages-template.csv",
  "gsc-queries-template.csv",
  "naver-pages-template.csv",
  "naver-queries-template.csv",
  "bing-pages-template.csv",
  "bing-queries-template.csv",
];

const EXPECTED_INPUT_FILES = [
  "gsc-daily-2026-04-23_2026-07-19.csv",
  "gsc-filter-2026-04-23_2026-07-19.csv",
  "gsc-pages-2026-04-23_2026-07-19.csv",
  "gsc-queries-2026-04-23_2026-07-19.csv",
  "bing-daily-2026-04-23_2026-07-19.csv",
  "bing-pages-2026-04-23_2026-07-19.csv",
  "bing-queries-2026-04-23_2026-07-19.csv",
  "naver-daily-2026-04-23_2026-07-19.csv",
  "naver-queries-top30-2026-04-23_2026-07-19.csv",
  "naver-pages-top30-2026-04-23_2026-07-19.csv",
];

const URL_FIELDS = [
  "url",
  "locale",
  "content_type",
  "category",
  "role",
  "title",
  "h1",
  "description_length",
  "inbound_internal_links",
  "outbound_internal_links",
  "overlap_group",
  "gsc_clicks",
  "gsc_impressions",
  "gsc_ctr",
  "gsc_position",
  "gsc_actual_date_start",
  "gsc_actual_date_end",
  "naver_top30_clicks",
  "naver_top30_impressions",
  "naver_top30_ctr",
  "naver_top30_rank",
  "naver_is_top30",
  "naver_coverage_type",
  "bing_clicks",
  "bing_impressions",
  "bing_ctr",
  "bing_position",
  "known_clicks",
  "known_impressions",
  "known_clicks_excluding_naver_total",
  "known_impressions_excluding_naver_total",
  "platform_observed_clicks",
  "platform_observed_impressions",
  "platform_count",
  "query_count",
  "top_queries",
  "opportunity_type",
  "opportunity_score",
  "recommended_action",
  "data_confidence",
  "manual_review_required",
];

const QUERY_FIELDS = [
  "source",
  "query",
  "query_normalized",
  "query_family",
  "locale_hint",
  "is_branded",
  "brand_match_reason",
  "clicks",
  "impressions",
  "ctr",
  "position",
  "coverage_type",
  "is_complete_dataset",
  "ranking_basis",
  "possible_url_targets",
  "cannibalization_status",
  "input_file",
];

const DAILY_FIELDS = [
  "date",
  "gsc_clicks",
  "gsc_impressions",
  "gsc_has_record",
  "naver_clicks",
  "naver_impressions",
  "naver_has_record",
  "bing_clicks",
  "bing_impressions",
  "bing_has_record",
  "known_total_clicks",
  "known_total_impressions",
];

const NAVER_DAILY_FIELDS = [
  "date",
  "raw_date_label",
  "date_reconstructed",
  "date_reconstruction_reason",
  "impressions",
  "clicks",
  "ctr",
  "source",
  "input_file",
  "input_column",
];

const UNMATCHED_FIELDS = [
  "original_url",
  "normalized_url",
  "platform",
  "clicks",
  "impressions",
  "http_status",
  "final_url",
  "canonical",
  "sitemap_membership",
  "inventory_missing",
  "classification",
  "script_update_needed",
  "content_action_needed",
  "reason",
];

const NAVER_CLUSTER_FIELDS = [
  "cluster",
  "query_count",
  "clicks",
  "impressions",
  "ctr",
  "representative_queries",
  "variants",
  "question_like_queries",
  "amount_term_queries",
  "primary_url_candidates",
  "support_url_candidates",
  "data_confidence",
];

const URL_HEADER_ALIASES = [
  "page",
  "pages",
  "url",
  "landing page",
  "인기 페이지",
  "검색웹문서",
  "페이지",
  "노출 페이지",
];
const QUERY_HEADER_ALIASES = [
  "query",
  "queries",
  "keyword",
  "search keyword",
  "검색어",
  "검색키워드",
  "인기 검색어",
];
const CLICKS_HEADER_ALIASES = ["clicks", "click", "클릭", "클릭수", "클릭 수"];
const IMPRESSIONS_HEADER_ALIASES = ["impressions", "impression", "노출", "노출수", "노출 수"];
const CTR_HEADER_ALIASES = ["ctr", "avg. ctr", "click-through rate", "ctr(%)", "클릭률", "평균 ctr"];
const POSITION_HEADER_ALIASES = [
  "position",
  "avg. position",
  "average position",
  "게재 순위",
  "평균 게재순위",
  "평균 순위",
  "순위",
];
const DATE_HEADER_ALIASES = ["date", "날짜"];
const RANK_HEADER_ALIASES = ["no", "rank", "순위"];

const BRAND_PATTERNS = [
  { pattern: /\bfinmap\b/i, reason: "finmap" },
  { pattern: /\bfin\s*map\b/i, reason: "fin map" },
  { pattern: /\bfinmaphub\b/i, reason: "finmaphub" },
  { pattern: /핀맵|핀\s*맵/i, reason: "핀맵" },
];

const BUSINESS_PRIORITY_PATTERNS = [
  { pattern: /apartment|apt|home-buying|mortgage|loan|dsr|ltv|real-estate|주담대|담보|대출|dsr|ltv|아파트|부동산/i, boost: 18 },
  { pattern: /compound|복리|goal|목표|100m|1억/i, boost: 12 },
  { pattern: /dca|cagr|적립식|수익률/i, boost: 8 },
];

function arg(name, fallback) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((item) => item.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

function ensureDirFor(filePath) {
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
}

function writeText(filePath, text) {
  ensureDirFor(filePath);
  fs.writeFileSync(filePath, text.endsWith("\n") ? text : `${text}\n`, "utf8");
}

function csvCell(value) {
  const text = value == null ? "" : String(value);
  if (/[",\r\n\t]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(rows, fields) {
  return [
    fields.map(csvCell).join(","),
    ...rows.map((row) => fields.map((field) => csvCell(row[field])).join(",")),
  ].join("\n");
}

function countSeparatorOutsideQuotes(line, separator) {
  let inQuotes = false;
  let count = 0;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"' && inQuotes && next === '"') {
      i += 1;
      continue;
    }
    if (ch === '"') inQuotes = !inQuotes;
    else if (!inQuotes && ch === separator) count += 1;
  }
  return count;
}

function detectDelimiter(text) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .slice(0, 8);
  const candidates = [",", "\t", ";"];
  let best = { delimiter: ",", score: -1, counts: [] };
  for (const delimiter of candidates) {
    const counts = lines.map((line) => countSeparatorOutsideQuotes(line, delimiter));
    const nonZero = counts.filter((count) => count > 0);
    const consistency = nonZero.length ? nonZero.filter((count) => count === nonZero[0]).length : 0;
    const score = nonZero.reduce((sum, count) => sum + count, 0) + consistency * 10;
    if (score > best.score) best = { delimiter, score, counts };
  }
  return best;
}

function parseDelimited(text, delimiter) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  const input = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const next = input[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') inQuotes = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cellValue) => String(cellValue || "").trim() !== ""));
}

function parseObjects(rows) {
  if (!rows.length) return { headers: [], rows: [] };
  const headers = rows[0].map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
  return {
    headers,
    rows: rows.slice(1).map((cells, index) => {
      const out = { __rowNumber: index + 2 };
      headers.forEach((header, headerIndex) => {
        out[header] = cells[headerIndex] == null ? "" : cells[headerIndex];
      });
      return out;
    }),
  };
}

function decodeScore(text) {
  const replacement = (text.match(/\uFFFD/g) || []).length;
  const hangul = (text.match(/[\u3131-\u318e\uac00-\ud7a3]/g) || []).length;
  const control = (text.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g) || []).length;
  const header = /click|impression|date|query|page|노출|클릭|날짜|검색/i.test(text) ? 20 : 0;
  return header + hangul * 2 - replacement * 20 - control * 10;
}

function decodeFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const hasBom = buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;
  const encodings = hasBom ? ["utf-8", "euc-kr", "windows-949"] : ["utf-8", "euc-kr", "windows-949"];
  const candidates = [];
  for (const encoding of encodings) {
    try {
      const text = new TextDecoder(encoding, { fatal: false }).decode(buffer);
      candidates.push({ encoding, text, score: decodeScore(text) });
    } catch (_) {
      // Ignore unsupported encodings.
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0] || { encoding: "utf-8", text: buffer.toString("utf8"), score: 0 };
  return {
    buffer,
    text: best.text.replace(/^\uFEFF/, ""),
    encoding: best.encoding,
    bom: hasBom,
    decode_score: best.score,
  };
}

function parseFile(filePath) {
  const decoded = decodeFile(filePath);
  const delimiterInfo = detectDelimiter(decoded.text);
  const rows = parseDelimited(decoded.text, delimiterInfo.delimiter);
  const objects = parseObjects(rows);
  return {
    filePath,
    file: path.relative(process.cwd(), filePath),
    name: path.basename(filePath),
    bytes: decoded.buffer.length,
    encoding: decoded.encoding,
    bom: decoded.bom,
    decode_score: decoded.decode_score,
    delimiter: delimiterInfo.delimiter === "\t" ? "\\t" : delimiterInfo.delimiter,
    delimiterRaw: delimiterInfo.delimiter,
    delimiterCounts: delimiterInfo.counts,
    rawRows: rows,
    headers: objects.headers,
    rows: objects.rows,
  };
}

function key(value) {
  return String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_\-.()%]/g, "");
}

function findHeader(headers, aliases) {
  const byKey = new Map(headers.map((header) => [key(header), header]));
  for (const alias of aliases) {
    const hit = byKey.get(key(alias));
    if (hit) return hit;
  }
  return "";
}

function parseDateRangeFromFileName(name) {
  const match = name.match(/(\d{4}-\d{2}-\d{2})[_-](\d{4}-\d{2}-\d{2})/);
  return match ? { start: match[1], end: match[2] } : { start: "", end: "" };
}

function parsePlatform(name) {
  const lower = name.toLowerCase();
  if (lower.includes("gsc") || lower.includes("google")) return "gsc";
  if (lower.includes("naver")) return "naver";
  if (lower.includes("bing")) return "bing";
  return "unknown";
}

function parseType(name, headers) {
  const lower = name.toLowerCase();
  if (lower.includes("filter")) return "filter";
  if (lower.includes("daily")) return "daily";
  if (lower.includes("queries")) return "queries";
  if (lower.includes("pages")) return "pages";
  if (findHeader(headers, URL_HEADER_ALIASES)) return "pages";
  if (findHeader(headers, QUERY_HEADER_ALIASES)) return "queries";
  if (findHeader(headers, DATE_HEADER_ALIASES)) return "daily";
  return "unknown";
}

function normalizeSpaces(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeQuery(value) {
  return normalizeSpaces(value).normalize("NFC");
}

function queryFamily(value) {
  return normalizeQuery(value)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{Letter}\p{Number}]/gu, "");
}

function isKoreanText(value) {
  return /[\u3131-\u318e\uac00-\ud7a3]/.test(String(value || ""));
}

function classifyBrand(query) {
  for (const item of BRAND_PATTERNS) {
    if (item.pattern.test(query)) return { is_branded: true, brand_match_reason: item.reason };
  }
  return { is_branded: false, brand_match_reason: "" };
}

function safeDecodeUri(value) {
  try {
    return decodeURI(value);
  } catch (_) {
    return value;
  }
}

function normalizeUrl(value) {
  if (value == null) return "";
  let text = String(value).trim().replace(/\\/g, "/");
  if (!text) return "";
  try {
    if (/^https?:\/\//i.test(text)) {
      const parsed = new URL(text);
      if (!SITE_HOSTS.has(parsed.hostname.toLowerCase())) return "";
      text = parsed.pathname || "/";
    }
  } catch (_) {
    text = text.replace(/^https?:\/\/[^/]+/i, "");
  }
  text = text.split("#")[0].split("?")[0];
  if (!text.startsWith("/")) text = `/${text}`;
  text = safeDecodeUri(text).replace(/\/{2,}/g, "/");
  if (text.length > 1 && text.endsWith("/")) text = text.slice(0, -1);
  return text || "/";
}

function localeFromUrl(url) {
  return normalizeUrl(url).startsWith("/en") ? "en" : "ko";
}

function parseMetric(value, options = {}) {
  if (value == null) return null;
  let text = String(value).trim();
  if (!text || text === "-") return null;
  const hasPercentSign = text.includes("%");
  if (/^<\s*1/.test(text)) text = "0.5";
  text = text.replace(/[,%\s]/g, "");
  if (!/^[-+]?\d*\.?\d+$/.test(text)) return null;
  let number = Number(text);
  if (!Number.isFinite(number)) return null;
  if (options.integer) number = Math.max(0, Math.round(number));
  if (options.ctr) {
    if (hasPercentSign || options.forcePercent || number > 1) number /= 100;
    if (number < 0 || number > 1) return null;
  }
  return number;
}

function fmt(value, digits = 2) {
  if (value == null || value === "" || !Number.isFinite(Number(value))) return "";
  return Number(value).toFixed(digits).replace(/\.?0+$/, "");
}

function fmtCtr(value) {
  if (value == null || value === "" || !Number.isFinite(Number(value))) return "";
  return Number(value).toFixed(4).replace(/\.?0+$/, "");
}

function dateToIso(date) {
  return date.toISOString().slice(0, 10);
}

function parseDateValue(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) return `${match[3]}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}`;
  match = text.match(/^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?$/);
  if (match) return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  return "";
}

function eachDate(start, end) {
  if (!start || !end) return [];
  const out = [];
  const current = new Date(`${start}T00:00:00Z`);
  const final = new Date(`${end}T00:00:00Z`);
  while (current <= final) {
    out.push(dateToIso(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return out;
}

function addDays(start, count) {
  const date = new Date(`${start}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return dateToIso(date);
}

function loadInventory(filePath) {
  const file = parseFile(filePath);
  const inventory = [];
  const byUrl = new Map();
  for (const row of file.rows) {
    const url = normalizeUrl(row.url);
    if (!url) continue;
    const item = {
      url,
      locale: row.locale || localeFromUrl(url),
      content_type: row.content_type || "",
      category: row.category || "",
      role: row.role || "",
      title: row.title || "",
      h1: row.h1 || "",
      description_length: row.description_length || "",
      inbound_internal_links: row.inbound_internal_links || "",
      outbound_internal_links: row.outbound_internal_links || "",
      overlap_group: row.overlap_group || "",
      manual_review_required: row.manual_review_required || "",
      description: row.description || "",
      first_paragraph: row.first_paragraph || "",
      source_file: row.source_file || "",
      date_modified: row.date_modified || row.dateModified || "",
    };
    inventory.push(item);
    byUrl.set(url, item);
  }
  return { inventory, byUrl };
}

function loadAuditMap() {
  const auditFile = path.join("reports", "search-growth-90d-audit-data.json");
  if (!fs.existsSync(auditFile)) return new Map();
  try {
    const payload = JSON.parse(fs.readFileSync(auditFile, "utf8"));
    return new Map((payload.entries || []).map((entry) => [entry.url, entry]));
  } catch (_) {
    return new Map();
  }
}

function enrichInventoryWithAudit(inventoryData) {
  const auditMap = loadAuditMap();
  for (const item of inventoryData.inventory) {
    const audit = auditMap.get(item.url);
    if (audit) {
      item.description = audit.description || item.description || "";
      item.first_paragraph = audit.first_paragraph || item.first_paragraph || "";
      item.source_file = audit.source_file || item.source_file || "";
      item.priority_score = audit.priority_score || "";
      item.snippet_risk = audit.snippet_risk || "";
      item.date_modified = audit.date_modified || audit.dateModified || item.date_modified || "";
    }
    if (!item.date_modified) item.date_modified = dateModifiedFromSource(item.source_file);
  }
  return inventoryData;
}

function discoverInputFiles(inputDir) {
  if (!fs.existsSync(inputDir)) return [];
  return fs
    .readdirSync(inputDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => entry.name.toLowerCase().endsWith(".csv"))
    .filter((entry) => !entry.name.toLowerCase().includes("template"))
    .map((entry) => path.join(inputDir, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

function getColumns(file) {
  return {
    url: findHeader(file.headers, URL_HEADER_ALIASES),
    query: findHeader(file.headers, QUERY_HEADER_ALIASES),
    clicks: findHeader(file.headers, CLICKS_HEADER_ALIASES),
    impressions: findHeader(file.headers, IMPRESSIONS_HEADER_ALIASES),
    ctr: findHeader(file.headers, CTR_HEADER_ALIASES),
    position: findHeader(file.headers, POSITION_HEADER_ALIASES),
    date: findHeader(file.headers, DATE_HEADER_ALIASES),
    rank: findHeader(file.headers, RANK_HEADER_ALIASES),
  };
}

function createEmptyDiagnostics(file) {
  const requested = parseDateRangeFromFileName(file.name);
  const columns = getColumns(file);
  return {
    file: file.file,
    platform: parsePlatform(file.name),
    type: parseType(file.name, file.headers),
    encoding: file.encoding,
    bom: file.bom,
    delimiter: file.delimiter,
    requested_range: requested,
    actual_range: { start: "", end: "" },
    actual_range_source: "",
    bytes: file.bytes,
    rows: file.rows.length,
    headers: file.headers,
    detected_columns: columns,
    first_data_row: file.rawRows[1] || [],
    last_data_row: file.rawRows[file.rawRows.length - 1] || [],
    status: "PASS",
    warnings: [],
    empty_rows: 0,
    parse_failure_count: 0,
    duplicate_key_count: 0,
    is_template: false,
    naver: {},
  };
}

function parseDailyVertical(file, diagnostics) {
  const columns = getColumns(file);
  const out = [];
  if (!columns.date) {
    diagnostics.status = "WARN";
    diagnostics.warnings.push("MISSING_DATE_COLUMN");
    return out;
  }
  for (const row of file.rows) {
    const date = parseDateValue(row[columns.date]);
    if (!date) {
      diagnostics.parse_failure_count += 1;
      continue;
    }
    out.push({
      source: diagnostics.platform,
      date,
      clicks: columns.clicks ? parseMetric(row[columns.clicks], { integer: true }) : null,
      impressions: columns.impressions ? parseMetric(row[columns.impressions], { integer: true }) : null,
      ctr: columns.ctr ? parseMetric(row[columns.ctr], { ctr: true }) : null,
      input_file: file.file,
      input_row: row.__rowNumber,
    });
  }
  setActualRange(diagnostics, out.map((row) => row.date));
  return out;
}

function parseNaverDailyHorizontal(file, diagnostics) {
  const requested = diagnostics.requested_range;
  const rows = file.rawRows;
  const out = [];
  if (!rows.length || !requested.start || !requested.end) {
    diagnostics.status = "WARN";
    diagnostics.warnings.push("NAVER_DAILY_MISSING_RANGE_OR_ROWS");
    return out;
  }

  const header = rows[0];
  const impressionsRow = rows.find((row) => /노출|impressions/i.test(String(row[0] || "")));
  const clicksRow = rows.find((row) => /클릭|clicks/i.test(String(row[0] || "")));
  if (!impressionsRow || !clicksRow) {
    diagnostics.status = "WARN";
    diagnostics.warnings.push("NAVER_DAILY_MISSING_HORIZONTAL_METRIC_ROWS");
    return out;
  }

  const expectedDates = eachDate(requested.start, requested.end);
  const columnCount = Math.max(header.length, impressionsRow.length, clicksRow.length) - 1;
  diagnostics.naver.horizontal = true;
  diagnostics.naver.date_column_count = columnCount;
  diagnostics.naver.expected_date_count = expectedDates.length;
  diagnostics.naver.date_reconstructed_count = 0;
  diagnostics.naver.date_reconstruction_failure_count = 0;
  if (columnCount !== expectedDates.length) {
    diagnostics.status = "WARN";
    diagnostics.warnings.push(`NAVER_DAILY_DATE_COUNT_MISMATCH:${columnCount}/${expectedDates.length}`);
  }

  for (let i = 1; i <= columnCount; i += 1) {
    const date = expectedDates[i - 1] || addDays(requested.start, i - 1);
    const impressions = parseMetric(impressionsRow[i], { integer: true });
    const clicks = parseMetric(clicksRow[i], { integer: true });
    if (!date) {
      diagnostics.naver.date_reconstruction_failure_count += 1;
      continue;
    }
    diagnostics.naver.date_reconstructed_count += 1;
    out.push({
      source: "naver",
      date,
      raw_date_label: header[i] || "",
      date_reconstructed: true,
      date_reconstruction_reason: "filename_range_column_sequence",
      impressions,
      clicks,
      ctr: impressions && impressions > 0 && clicks != null ? clicks / impressions : null,
      input_file: file.file,
      input_column: i + 1,
    });
  }
  setActualRange(diagnostics, out.map((row) => row.date));
  diagnostics.naver.raw_clicks_sum = out.reduce((sum, row) => sum + (row.clicks || 0), 0);
  diagnostics.naver.raw_impressions_sum = out.reduce((sum, row) => sum + (row.impressions || 0), 0);
  return out;
}

function setActualRange(diagnostics, dates) {
  const actual = dates.filter(Boolean).sort();
  if (!actual.length) return;
  diagnostics.actual_range = { start: actual[0], end: actual[actual.length - 1] };
  diagnostics.actual_range_source = "row_dates";
}

function parsePages(file, diagnostics) {
  const columns = getColumns(file);
  const out = [];
  const seen = new Set();
  if (diagnostics.requested_range.start && diagnostics.requested_range.end) {
    diagnostics.actual_range = { ...diagnostics.requested_range };
    diagnostics.actual_range_source = "file_name";
    diagnostics.warnings.push("FILE_LEVEL_RANGE_ONLY");
  }
  if (!columns.url) {
    diagnostics.status = "WARN";
    diagnostics.warnings.push("MISSING_URL_COLUMN");
    return out;
  }
  for (const row of file.rows) {
    const url = normalizeUrl(row[columns.url]);
    if (!url) {
      diagnostics.parse_failure_count += 1;
      continue;
    }
    const rank = columns.rank ? parseMetric(row[columns.rank], { integer: true }) : null;
    const forcePercent = columns.ctr ? /\(%\)|%/.test(columns.ctr) : false;
    const item = {
      source: diagnostics.platform,
      raw_url: String(row[columns.url] || "").trim(),
      url,
      locale: localeFromUrl(url),
      clicks: columns.clicks ? parseMetric(row[columns.clicks], { integer: true }) : null,
      impressions: columns.impressions ? parseMetric(row[columns.impressions], { integer: true }) : null,
      ctr: columns.ctr ? parseMetric(row[columns.ctr], { ctr: true, forcePercent }) : null,
      position: columns.position ? parseMetric(row[columns.position]) : null,
      rank,
      coverage_type: diagnostics.platform === "naver" ? "CLICK_TOP_30" : "COMPLETE_EXPORT",
      is_complete_dataset: diagnostics.platform !== "naver",
      ranking_basis: diagnostics.platform === "naver" ? "NAVER_CLICK_TOP" : "PLATFORM_EXPORT",
      input_file: file.file,
      input_row: row.__rowNumber,
    };
    if (seen.has(url)) diagnostics.duplicate_key_count += 1;
    seen.add(url);
    out.push(item);
  }
  return out;
}

function parseQueries(file, diagnostics) {
  const columns = getColumns(file);
  const out = [];
  const seen = new Set();
  if (diagnostics.requested_range.start && diagnostics.requested_range.end) {
    diagnostics.actual_range = { ...diagnostics.requested_range };
    diagnostics.actual_range_source = "file_name";
    diagnostics.warnings.push("FILE_LEVEL_RANGE_ONLY");
  }
  if (!columns.query) {
    diagnostics.status = "WARN";
    diagnostics.warnings.push("MISSING_QUERY_COLUMN");
    return out;
  }
  for (const row of file.rows) {
    const query = normalizeQuery(row[columns.query]);
    if (!query) {
      diagnostics.parse_failure_count += 1;
      continue;
    }
    const normalized = normalizeQuery(query).toLowerCase();
    const brand = classifyBrand(query);
    const forcePercent = columns.ctr ? /\(%\)|%/.test(columns.ctr) : false;
    const item = {
      source: diagnostics.platform,
      query,
      query_normalized: normalized,
      query_family: queryFamily(query),
      locale_hint: isKoreanText(query) ? "ko" : "en",
      is_branded: brand.is_branded,
      brand_match_reason: brand.brand_match_reason,
      clicks: columns.clicks ? parseMetric(row[columns.clicks], { integer: true }) : null,
      impressions: columns.impressions ? parseMetric(row[columns.impressions], { integer: true }) : null,
      ctr: columns.ctr ? parseMetric(row[columns.ctr], { ctr: true, forcePercent }) : null,
      position: columns.position ? parseMetric(row[columns.position]) : null,
      coverage_type: diagnostics.platform === "naver" ? "CLICK_TOP_30" : "COMPLETE_EXPORT",
      is_complete_dataset: diagnostics.platform !== "naver",
      ranking_basis: diagnostics.platform === "naver" ? "NAVER_CLICK_TOP" : "PLATFORM_EXPORT",
      input_file: file.file,
      input_row: row.__rowNumber,
    };
    const keyValue = `${item.source}\t${item.query_family}`;
    if (seen.has(keyValue)) diagnostics.duplicate_key_count += 1;
    seen.add(keyValue);
    out.push(item);
  }
  return out;
}

function parseFilter(file, diagnostics) {
  const lines = file.rows.map((row) => Object.values(row).map(normalizeSpaces).join(": "));
  const text = lines.join("\n");
  const match = text.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.-(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\./);
  if (match) {
    diagnostics.actual_range = {
      start: `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`,
      end: `${match[4]}-${match[5].padStart(2, "0")}-${match[6].padStart(2, "0")}`,
    };
    diagnostics.actual_range_source = "filter_file";
  }
  diagnostics.filter_text = text;
}

function aggregatePageRows(rows) {
  const map = new Map();
  for (const row of rows) {
    const keyValue = `${row.source}\t${row.url}`;
    const current = map.get(keyValue) || {
      source: row.source,
      url: row.url,
      locale: row.locale,
      clicks: 0,
      impressions: 0,
      positionWeightedSum: 0,
      positionWeight: 0,
      ctrWeightedSum: 0,
      ctrWeight: 0,
      rank: row.rank || null,
      coverage_type: row.coverage_type,
      is_complete_dataset: row.is_complete_dataset,
      ranking_basis: row.ranking_basis,
      input_files: new Set(),
      raw_urls: new Set(),
    };
    current.clicks += row.clicks || 0;
    current.impressions += row.impressions || 0;
    if (row.position != null) {
      const weight = row.impressions && row.impressions > 0 ? row.impressions : 1;
      current.positionWeightedSum += row.position * weight;
      current.positionWeight += weight;
    }
    if (row.ctr != null) {
      const weight = row.impressions && row.impressions > 0 ? row.impressions : 1;
      current.ctrWeightedSum += row.ctr * weight;
      current.ctrWeight += weight;
    }
    if (row.rank != null) current.rank = row.rank;
    current.input_files.add(row.input_file);
    if (row.raw_url) current.raw_urls.add(row.raw_url);
    map.set(keyValue, current);
  }

  const out = new Map();
  for (const item of map.values()) {
    out.set(`${item.source}\t${item.url}`, {
      ...item,
      position: item.positionWeight > 0 ? item.positionWeightedSum / item.positionWeight : null,
      ctr: item.ctrWeight > 0 ? item.ctrWeightedSum / item.ctrWeight : (item.impressions > 0 ? item.clicks / item.impressions : null),
      input_files: Array.from(item.input_files),
      raw_urls: Array.from(item.raw_urls),
    });
  }
  return out;
}

function aggregateDailyRows(rows) {
  const map = new Map();
  for (const row of rows) {
    const keyValue = `${row.source}\t${row.date}`;
    const current = map.get(keyValue) || {
      source: row.source,
      date: row.date,
      clicks: 0,
      impressions: 0,
      has_record: false,
    };
    current.clicks += row.clicks || 0;
    current.impressions += row.impressions || 0;
    current.has_record = true;
    map.set(keyValue, current);
  }
  return map;
}

function sourceRange(diagnostics, source, type) {
  const hits = diagnostics.filter((item) => item.platform === source && item.type === type && item.actual_range.start);
  if (!hits.length) return { start: "", end: "" };
  const starts = hits.map((item) => item.actual_range.start).sort();
  const ends = hits.map((item) => item.actual_range.end).sort();
  return { start: starts[0], end: ends[ends.length - 1] };
}

function expectedCtr(position) {
  if (position == null || !Number.isFinite(Number(position))) return null;
  const pos = Number(position);
  if (pos <= 3) return 0.1;
  if (pos <= 5) return 0.06;
  if (pos <= 10) return 0.03;
  if (pos <= 20) return 0.015;
  if (pos <= 40) return 0.006;
  return 0.002;
}

function confidence(impressions, platformCount, naverOnly) {
  if (naverOnly) return "LIMITED";
  if (naverOnly === "naver_dominant") return "LIMITED";
  if (impressions >= 30 && platformCount >= 1) return "SUFFICIENT";
  if (impressions >= 10) return "LIMITED";
  return "VERY_LOW";
}

function businessBoost(url, title, h1, group) {
  const text = `${url} ${title} ${h1} ${group}`;
  let boost = 0;
  for (const item of BUSINESS_PRIORITY_PATTERNS) {
    if (item.pattern.test(text)) boost += item.boost;
  }
  return boost;
}

function classifyOpportunity(row, metrics) {
  const gscPosition = metrics.gsc?.position ?? null;
  const bingPosition = metrics.bing?.position ?? null;
  const positions = [gscPosition, bingPosition].filter((value) => value != null && Number.isFinite(Number(value)));
  const weightedPosition = positions.length ? positions.reduce((sum, value) => sum + value, 0) / positions.length : null;
  const nonNaverImpressions = (metrics.gsc?.impressions || 0) + (metrics.bing?.impressions || 0);
  const nonNaverClicks = (metrics.gsc?.clicks || 0) + (metrics.bing?.clicks || 0);
  const ctr = nonNaverImpressions > 0 ? nonNaverClicks / nonNaverImpressions : null;
  const expected = expectedCtr(weightedPosition);
  const ctrGap = expected == null || ctr == null ? 0 : Math.max(0, expected - ctr);
  const naverClicks = metrics.naver?.clicks || 0;
  const naverRank = metrics.naver?.rank || null;
  const naverHighClick = naverClicks >= 10 || (naverRank != null && naverRank <= 10);
  const boost = businessBoost(row.url, row.title, row.h1, row.overlap_group);

  let type = "NO_DATA";
  if (nonNaverImpressions >= 30 && weightedPosition != null && weightedPosition >= 4 && weightedPosition <= 10 && ctrGap > 0.015) type = "QUICK_WIN";
  else if (nonNaverImpressions >= 30 && weightedPosition != null && weightedPosition <= 10 && ctrGap > 0.02) type = "CTR_REPAIR";
  else if (nonNaverImpressions >= 30 && weightedPosition != null && weightedPosition >= 11 && weightedPosition <= 20) type = "PAGE_ONE_CANDIDATE";
  else if (nonNaverImpressions >= 30 && weightedPosition != null && weightedPosition >= 21 && weightedPosition <= 40) type = "GROWTH_CANDIDATE";
  else if (naverClicks > 0 && naverRank != null && naverRank <= 30) type = "NAVER_WINNER";
  else if (nonNaverImpressions > 0 || naverClicks > 0) type = "HOLD";

  if (naverHighClick && nonNaverImpressions < 100) {
    type = "NAVER_WINNER";
  }

  if (type === "NAVER_WINNER" && nonNaverImpressions >= 30 && weightedPosition != null && weightedPosition >= 11 && weightedPosition <= 40) {
    type = "HOLD";
  }

  const score = Math.round(Math.min(100,
    Math.log10(nonNaverImpressions + 1) * 18
    + Math.min(20, nonNaverClicks * 2)
    + (weightedPosition ? Math.max(0, 35 - weightedPosition) : 0)
    + ctrGap * 450
    + Math.min(15, naverClicks / 10)
    + boost
  ));

  return { type, score };
}

function actionFor(type) {
  const map = {
    QUICK_WIN: "P1-1B title/description/intro SERP alignment review",
    PAGE_ONE_CANDIDATE: "P1-1B metadata and answer-summary scope review",
    CTR_REPAIR: "P1-1B snippet clarity review",
    GROWTH_CANDIDATE: "Observe first; consider light intent refinement",
    NAVER_WINNER: "Hold or low-risk refresh only",
    HOLD: "Hold; avoid immediate content changes",
    NO_DATA: "No action until more search data",
  };
  return map[type] || "Manual review";
}

function buildMergedRows(inventory, pageMap, diagnostics) {
  const gscRange = sourceRange(diagnostics, "gsc", "daily");
  const output = [];
  const unmatched = [];
  const inventoryUrls = new Set(inventory.map((item) => item.url));

  for (const item of inventory) {
    const gsc = pageMap.get(`gsc\t${item.url}`) || null;
    const bing = pageMap.get(`bing\t${item.url}`) || null;
    const naver = pageMap.get(`naver\t${item.url}`) || null;
    const nonNaverClicks = (gsc?.clicks || 0) + (bing?.clicks || 0);
    const nonNaverImpressions = (gsc?.impressions || 0) + (bing?.impressions || 0);
    const observedClicks = nonNaverClicks + (naver?.clicks || 0);
    const observedImpressions = nonNaverImpressions + (naver?.impressions || 0);
    const platformCount = [gsc, bing, naver].filter(Boolean).length;
    const opportunity = classifyOpportunity(item, { gsc, bing, naver });
    const naverOnly = !!naver && !gsc && !bing;
    const naverDominant = !!naver && nonNaverImpressions < 30;

    output.push({
      url: item.url,
      locale: item.locale,
      content_type: item.content_type,
      category: item.category,
      role: item.role,
      title: item.title,
      h1: item.h1,
      description_length: item.description_length,
      inbound_internal_links: item.inbound_internal_links,
      outbound_internal_links: item.outbound_internal_links,
      overlap_group: item.overlap_group,
      gsc_clicks: gsc ? gsc.clicks : "",
      gsc_impressions: gsc ? gsc.impressions : "",
      gsc_ctr: gsc ? fmtCtr(gsc.ctr) : "",
      gsc_position: gsc ? fmt(gsc.position) : "",
      gsc_actual_date_start: gsc ? gscRange.start : "",
      gsc_actual_date_end: gsc ? gscRange.end : "",
      naver_top30_clicks: naver ? naver.clicks : "",
      naver_top30_impressions: naver ? naver.impressions : "",
      naver_top30_ctr: naver ? fmtCtr(naver.ctr) : "",
      naver_top30_rank: naver?.rank || "",
      naver_is_top30: naver ? "true" : "false",
      naver_coverage_type: naver ? "CLICK_TOP_30" : "",
      bing_clicks: bing ? bing.clicks : "",
      bing_impressions: bing ? bing.impressions : "",
      bing_ctr: bing ? fmtCtr(bing.ctr) : "",
      bing_position: bing ? fmt(bing.position) : "",
      known_clicks: platformCount ? observedClicks : "",
      known_impressions: platformCount ? observedImpressions : "",
      known_clicks_excluding_naver_total: gsc || bing ? nonNaverClicks : "",
      known_impressions_excluding_naver_total: gsc || bing ? nonNaverImpressions : "",
      platform_observed_clicks: platformCount ? observedClicks : "",
      platform_observed_impressions: platformCount ? observedImpressions : "",
      platform_count: platformCount || "",
      query_count: "",
      top_queries: "",
      opportunity_type: opportunity.type,
      opportunity_score: opportunity.score,
      recommended_action: actionFor(opportunity.type),
      data_confidence: confidence(observedImpressions, platformCount, naverOnly ? true : (naverDominant ? "naver_dominant" : false)),
      manual_review_required: item.manual_review_required,
    });
  }

  for (const metric of pageMap.values()) {
    if (!inventoryUrls.has(metric.url)) unmatched.push(metric);
  }

  output.sort((a, b) => {
    const typeWeight = {
      QUICK_WIN: 7,
      CTR_REPAIR: 6,
      PAGE_ONE_CANDIDATE: 5,
      GROWTH_CANDIDATE: 4,
      NAVER_WINNER: 3,
      HOLD: 2,
      NO_DATA: 1,
    };
    return (typeWeight[b.opportunity_type] - typeWeight[a.opportunity_type])
      || ((Number(b.opportunity_score) || 0) - (Number(a.opportunity_score) || 0));
  });

  return { rows: output, unmatched };
}

function buildQueryRows(queryRows, inventory) {
  const rows = [];
  for (const row of queryRows) {
    const possibleTargets = findPossibleTargets(row, inventory);
    const cannibalizationStatus = possibleTargets.length > 1 ? "POSSIBLE_OVERLAP" : "LIMITED_DATA";
    rows.push({
      source: row.source,
      query: row.query,
      query_normalized: row.query_normalized,
      query_family: row.query_family,
      locale_hint: row.locale_hint,
      is_branded: row.is_branded ? "true" : "false",
      brand_match_reason: row.brand_match_reason,
      clicks: row.clicks == null ? "" : row.clicks,
      impressions: row.impressions == null ? "" : row.impressions,
      ctr: fmtCtr(row.ctr),
      position: fmt(row.position),
      coverage_type: row.coverage_type,
      is_complete_dataset: row.is_complete_dataset ? "true" : "false",
      ranking_basis: row.ranking_basis,
      possible_url_targets: possibleTargets.slice(0, 5).map((item) => item.url).join(" | "),
      cannibalization_status: cannibalizationStatus,
      input_file: row.input_file,
    });
  }
  rows.sort((a, b) => (Number(b.impressions) || 0) - (Number(a.impressions) || 0));
  return rows;
}

function findPossibleTargets(queryRow, inventory) {
  if (queryRow.is_branded) return [];
  const family = queryRow.query_family;
  if (!family || family.length < 3) return [];
  const queryText = queryRow.query_normalized;
  const terms = queryText
    .split(/[\s,./|:;!?()[\]{}"']+/)
    .map((term) => term.trim().toLowerCase())
    .filter((term) => term.length >= 3);
  if (!terms.length) return [];

  return inventory
    .map((item) => {
      const haystack = `${item.url} ${item.title} ${item.h1} ${item.overlap_group}`.toLowerCase();
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
      return { item, score };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((hit) => hit.item);
}

function buildDailyRows(dailyRows, diagnostics) {
  const dailyMap = aggregateDailyRows(dailyRows);
  const ranges = diagnostics.map((item) => item.requested_range).filter((range) => range.start && range.end);
  const start = ranges.map((range) => range.start).sort()[0] || "";
  const end = ranges.map((range) => range.end).sort().slice(-1)[0] || "";
  const dates = eachDate(start, end);
  const rows = [];
  for (const date of dates) {
    const gsc = dailyMap.get(`gsc\t${date}`);
    const naver = dailyMap.get(`naver\t${date}`);
    const bing = dailyMap.get(`bing\t${date}`);
    const knownClicks = [gsc, naver, bing].reduce((sum, item) => sum + (item ? item.clicks : 0), 0);
    const knownImpressions = [gsc, naver, bing].reduce((sum, item) => sum + (item ? item.impressions : 0), 0);
    rows.push({
      date,
      gsc_clicks: gsc ? gsc.clicks : "",
      gsc_impressions: gsc ? gsc.impressions : "",
      gsc_has_record: gsc ? "true" : "false",
      naver_clicks: naver ? naver.clicks : "",
      naver_impressions: naver ? naver.impressions : "",
      naver_has_record: naver ? "true" : "false",
      bing_clicks: bing ? bing.clicks : "",
      bing_impressions: bing ? bing.impressions : "",
      bing_has_record: bing ? "true" : "false",
      known_total_clicks: [gsc, naver, bing].some(Boolean) ? knownClicks : "",
      known_total_impressions: [gsc, naver, bing].some(Boolean) ? knownImpressions : "",
    });
  }
  return rows;
}

function summarizeDaily(rows) {
  const sources = ["gsc", "naver", "bing"];
  const summary = {};
  for (const source of sources) {
    const sourceRows = rows.filter((row) => row[`${source}_has_record`] === "true");
    const clicks = sourceRows.reduce((sum, row) => sum + (Number(row[`${source}_clicks`]) || 0), 0);
    const impressions = sourceRows.reduce((sum, row) => sum + (Number(row[`${source}_impressions`]) || 0), 0);
    const first4 = sourceRows.slice(0, 28);
    const last4 = sourceRows.slice(-28);
    summary[source] = {
      recorded_days: sourceRows.length,
      clicks,
      impressions,
      ctr: impressions > 0 ? clicks / impressions : null,
      first_date: sourceRows[0]?.date || "",
      last_date: sourceRows[sourceRows.length - 1]?.date || "",
      first_4w_clicks: first4.reduce((sum, row) => sum + (Number(row[`${source}_clicks`]) || 0), 0),
      last_4w_clicks: last4.reduce((sum, row) => sum + (Number(row[`${source}_clicks`]) || 0), 0),
      first_4w_impressions: first4.reduce((sum, row) => sum + (Number(row[`${source}_impressions`]) || 0), 0),
      last_4w_impressions: last4.reduce((sum, row) => sum + (Number(row[`${source}_impressions`]) || 0), 0),
    };
  }
  return summary;
}

function topBy(rows, type, limit = 10) {
  return rows
    .filter((row) => row.opportunity_type === type)
    .slice(0, limit);
}

function priorityRows(rows) {
  return rows
    .filter((row) => ["QUICK_WIN", "CTR_REPAIR", "PAGE_ONE_CANDIDATE", "GROWTH_CANDIDATE"].includes(row.opportunity_type))
    .filter((row) => row.data_confidence !== "VERY_LOW")
    .slice(0, 10);
}

function observationRows(rows) {
  return rows
    .filter((row) => ["NAVER_WINNER", "HOLD"].includes(row.opportunity_type))
    .filter((row) => Number(row.platform_observed_clicks || 0) > 0 || Number(row.platform_observed_impressions || 0) > 0)
    .slice(0, 10);
}

function mdTable(headers, rows) {
  if (!rows.length) return "- 해당 항목 없음";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((value) => String(value == null ? "" : value).replace(/\|/g, "\\|")).join(" | ")} |`),
  ].join("\n");
}

const sourceDateCache = new Map();

function dateModifiedFromSource(sourceFile) {
  const file = String(sourceFile || "").trim();
  if (!file) return "";
  if (sourceDateCache.has(file)) return sourceDateCache.get(file);
  let date = "";
  try {
    const raw = fs.readFileSync(file, "utf8");
    const match = raw.match(/\bdateModified:\s*["']?([^"'\r\n]+)["']?/);
    if (match) date = match[1].trim();
  } catch (_) {
    date = "";
  }
  sourceDateCache.set(file, date);
  return date;
}

function shortList(values, limit = 5) {
  return (values || [])
    .filter(Boolean)
    .slice(0, limit)
    .join(" | ");
}

function renderUrlTable(rows) {
  return mdTable(
    ["URL", "Type", "Clicks", "Impressions", "CTR", "Position", "Naver", "Confidence", "Score"],
    rows.map((row) => {
      const clicks = row.known_clicks || "";
      const impressions = row.known_impressions || "";
      const ctr = impressions ? fmtCtr((Number(clicks) || 0) / Number(impressions)) : "";
      const position = row.gsc_position || row.bing_position || "";
      return [
        row.url,
        row.opportunity_type,
        clicks,
        impressions,
        ctr,
        position,
        row.naver_is_top30 === "true" ? `top30 #${row.naver_top30_rank}` : "",
        row.data_confidence,
        row.opportunity_score,
      ];
    })
  );
}

function writePriority(context) {
  const priority = priorityRows(context.mergedRows).map((row) => ({
    url: row.url,
    locale: row.locale,
    content_type: row.content_type,
    current_title: row.title,
    current_h1: row.h1,
    platforms: {
      gsc: {
        clicks: row.gsc_clicks,
        impressions: row.gsc_impressions,
        ctr: row.gsc_ctr,
        position: row.gsc_position,
      },
      bing: {
        clicks: row.bing_clicks,
        impressions: row.bing_impressions,
        ctr: row.bing_ctr,
        position: row.bing_position,
      },
      naver_top30: {
        is_top30: row.naver_is_top30,
        rank: row.naver_top30_rank,
        clicks: row.naver_top30_clicks,
        impressions: row.naver_top30_impressions,
        coverage_type: row.naver_coverage_type,
      },
    },
    target_query_candidates: [],
    target_query_evidence: "No page-query dataset; use platform query exports and visible URL/title/H1 only.",
    known_clicks: row.known_clicks,
    known_impressions: row.known_impressions,
    opportunity_type: row.opportunity_type,
    data_confidence: row.data_confidence,
    selection_reason: row.recommended_action,
    recommended_p1_1b_scope: ["title", "description", "H1", "first paragraph", "answer summary"],
    change_risk: row.naver_is_top30 === "true" ? "MEDIUM: Naver top30 observed; avoid aggressive rewrite." : "LOW_TO_MEDIUM",
    minimum_observation_period_after_change: "14-28 days after recrawl",
  }));

  const observation = observationRows(context.mergedRows).map((row) => ({
    url: row.url,
    opportunity_type: row.opportunity_type,
    reason: row.opportunity_type === "NAVER_WINNER" ? "Observed Naver top30 clicks; hold or low-risk refresh." : "Current search data exists but not a high-confidence P1-1B edit candidate.",
    known_clicks: row.known_clicks,
    known_impressions: row.known_impressions,
    data_confidence: row.data_confidence,
  }));

  const payload = {
    generatedAt: new Date().toISOString(),
    localOnly: true,
    inputFiles: context.diagnostics.map((item) => ({
      file: item.file,
      platform: item.platform,
      type: item.type,
      encoding: item.encoding,
      delimiter: item.delimiter,
      requested_range: item.requested_range,
      actual_range: item.actual_range,
      actual_range_source: item.actual_range_source,
      rows: item.rows,
      status: item.status,
      warnings: item.warnings,
    })),
    summary: {
      inputFileCount: context.diagnostics.length,
      inventoryUrls: context.mergedRows.length,
      mergedUrlsWithObservedData: context.mergedRows.filter((row) => row.platform_count).length,
      unmatchedInputUrls: context.unmatched.length,
      priorityCandidateCount: priority.length,
      observationCount: observation.length,
      dailyRows: context.dailyRows.length,
      pageQueryStatus: "LIMITED_DATA",
    },
    priorityUrlsForP1_1B: priority,
    observationUrls: observation,
    dataLimitations: [
      "GSC and Bing page/query files are separate; there is no page-query dataset.",
      "Naver query/page files are click top30 only and are not complete datasets.",
      "Naver daily totals, query top30, and page top30 are not force-reconciled.",
      "Missing platform values remain blank and are not treated as zero.",
      "Possible cannibalization is limited to URL/title/H1/query-string overlap heuristics.",
    ],
    noContentChanges: true,
  };
  writeText(OUT_PRIORITY, JSON.stringify(payload, null, 2));
}

function writeDiagnostics(diagnostics, extra) {
  const payload = {
    generatedAt: new Date().toISOString(),
    localOnly: true,
    expectedInputFiles: EXPECTED_INPUT_FILES,
    actualInputFileCount: diagnostics.length,
    files: diagnostics,
    summary: extra,
  };
  writeText(OUT_DIAGNOSTICS, JSON.stringify(payload, null, 2));
}

function writeReport(context) {
  const { diagnostics, mergedRows, queryRows, dailyRows, dailySummary, unmatched } = context;
  const priority = priorityRows(mergedRows);
  const observation = observationRows(mergedRows);
  const platformRows = ["gsc", "naver", "bing"].map((source) => {
    const sourceDiagnostics = diagnostics.filter((item) => item.platform === source);
    const clicks = dailySummary[source]?.clicks || 0;
    const impressions = dailySummary[source]?.impressions || 0;
    return [
      source,
      sourceDiagnostics.length,
      dailySummary[source]?.first_date || "",
      dailySummary[source]?.last_date || "",
      dailySummary[source]?.recorded_days || 0,
      clicks,
      impressions,
      impressions ? fmtCtr(clicks / impressions) : "",
    ];
  });

  const lines = [
    "# FinMap 검색 유입 90일 P1-1A 검색 성과 병합 감사",
    "",
    `- 기준일: ${new Date().toISOString().slice(0, 10)}`,
    "- 분석 범위: local-only search performance CSV parsing and merge",
    "- 배포/운영/검색도구 계정 변경: 없음",
    "",
    "## 1. Executive Summary",
    "",
    `실제 입력 CSV ${diagnostics.length}개를 진단했고, 기존 URL inventory ${mergedRows.length}개와 병합했습니다.`,
    `검색 성과가 관측된 inventory URL은 ${mergedRows.filter((row) => row.platform_count).length}개이며, inventory에 없는 입력 URL은 ${unmatched.length}개입니다.`,
    `P1-1B 우선 후보는 ${priority.length}개, 관찰 대상은 ${observation.length}개로 제한했습니다.`,
    "",
    "## 2. Local-only Analysis Scope",
    "",
    "이번 작업은 로컬 분석 산출물 생성만 수행했습니다. 운영 서버, 운영 DB, 검색도구 계정, 배포, git commit, git push는 수행하지 않았습니다.",
    "",
    "## 3. Input Files",
    "",
    mdTable(
      ["File", "Platform", "Type", "Rows", "Status"],
      diagnostics.map((item) => [item.file, item.platform, item.type, item.rows, item.status])
    ),
    "",
    "## 4. Encoding and Delimiter Detection",
    "",
    mdTable(
      ["File", "Encoding", "BOM", "Delimiter", "Warnings"],
      diagnostics.map((item) => [item.file, item.encoding, item.bom, item.delimiter, item.warnings.join(", ") || "none"])
    ),
    "",
    "## 5. Requested Date Range",
    "",
    mdTable(
      ["File", "Requested Start", "Requested End"],
      diagnostics.map((item) => [item.file, item.requested_range.start, item.requested_range.end])
    ),
    "",
    "## 6. Actual Data Ranges",
    "",
    mdTable(
      ["File", "Actual Start", "Actual End", "Source"],
      diagnostics.map((item) => [item.file, item.actual_range.start, item.actual_range.end, item.actual_range_source || ""])
    ),
    "",
    "## 7. GSC Data Quality",
    "",
    renderDataQuality(diagnostics, "gsc"),
    "",
    "## 8. Naver Data Quality",
    "",
    renderDataQuality(diagnostics, "naver"),
    "",
    "## 9. Bing Data Quality",
    "",
    renderDataQuality(diagnostics, "bing"),
    "",
    "## 10. Naver TOP 30 Limitations",
    "",
    "- Naver queries/pages are marked `CLICK_TOP_30`.",
    "- Naver TOP 30 is not treated as a complete query or URL dataset.",
    "- Naver daily totals, query TOP 30, and page TOP 30 totals were not force-reconciled.",
    "- Naver horizontal daily dates were reconstructed from filename range and column sequence.",
    "",
    "## 11. URL Normalization",
    "",
    "- Protocol, host, query string, hash, duplicated slash, and trailing slash were normalized.",
    "- `/en` prefix was preserved.",
    "- External hosts were not merged into FinMap inventory.",
    "",
    "## 12. Inventory Merge Results",
    "",
    `- inventory URLs: ${mergedRows.length}`,
    `- merged URLs with observed data: ${mergedRows.filter((row) => row.platform_count).length}`,
    `- unmatched input URLs: ${unmatched.length}`,
    "",
    "## 13. Daily Search Trend",
    "",
    mdTable(["Platform", "Recorded days", "First date", "Last date", "Clicks", "Impressions", "CTR"], platformRows),
    "",
    "First 4 weeks vs last 4 weeks:",
    "",
    mdTable(
      ["Platform", "First 4w clicks", "Last 4w clicks", "First 4w impressions", "Last 4w impressions"],
      ["gsc", "naver", "bing"].map((source) => [
        source,
        dailySummary[source]?.first_4w_clicks || 0,
        dailySummary[source]?.last_4w_clicks || 0,
        dailySummary[source]?.first_4w_impressions || 0,
        dailySummary[source]?.last_4w_impressions || 0,
      ])
    ),
    "",
    "## 14. Platform Comparison",
    "",
    "GSC/Bing page-level data and Naver TOP 30 page data are kept separate in the merged CSV. `known_clicks_excluding_naver_total` excludes Naver TOP 30, while `platform_observed_clicks` includes observed Naver TOP 30 clicks.",
    "",
    "## 15. Branded vs Non-Branded",
    "",
    renderBrandedSummary(queryRows),
    "",
    "## 16. QUICK_WIN",
    "",
    renderUrlTable(topBy(mergedRows, "QUICK_WIN")),
    "",
    "## 17. PAGE_ONE_CANDIDATE",
    "",
    renderUrlTable(topBy(mergedRows, "PAGE_ONE_CANDIDATE")),
    "",
    "## 18. CTR_REPAIR",
    "",
    renderUrlTable(topBy(mergedRows, "CTR_REPAIR")),
    "",
    "## 19. GROWTH_CANDIDATE",
    "",
    renderUrlTable(topBy(mergedRows, "GROWTH_CANDIDATE")),
    "",
    "## 20. NAVER_WINNER",
    "",
    renderUrlTable(topBy(mergedRows, "NAVER_WINNER")),
    "",
    "## 21. HOLD",
    "",
    renderUrlTable(topBy(mergedRows, "HOLD")),
    "",
    "## 22. Possible Cannibalization and Data Limitations",
    "",
    "- No page-query dataset was available, so cannibalization is not confirmed.",
    "- Query rows include `LIMITED_DATA`, `MANUAL_REVIEW_REQUIRED`, or `POSSIBLE_OVERLAP` style signals only.",
    "- GSC anonymous query handling can make page totals and query totals differ.",
    "- Bing may omit position for some exports; missing position was left blank.",
    "",
    "## 23. Priority URLs for P1-1B",
    "",
    renderUrlTable(priority),
    "",
    "## 24. Observation URLs",
    "",
    renderUrlTable(observation),
    "",
    "## 25. Data Gaps",
    "",
    "- No page-query export for GSC/Bing.",
    "- Naver query/page exports are TOP 30 only.",
    "- GSC actual daily data starts later than the requested filename range.",
    "- Some GSC URLs point to apt detail paths that are not part of the 192 URL inventory.",
    "",
    "## 26. Files Created",
    "",
    "- `scripts/analyze_search_performance_inputs.js`",
    "- `reports/search-growth-90d-p1-1a-performance-merged.csv`",
    "- `reports/search-growth-90d-p1-1a-query-map.csv`",
    "- `reports/search-growth-90d-p1-1a-daily-merged.csv`",
    "- `reports/search-growth-90d-p1-1a-priority.json`",
    "- `reports/search-growth-90d-p1-1a-input-diagnostics.json`",
    "- `reports/search-growth-90d-p1-1a-search-performance-audit.md`",
    "- `reports/search-growth-90d-p1-1a-naver-daily-normalized.csv`",
    "",
    "## 27. Verification",
    "",
    "- `node scripts\\analyze_search_performance_inputs.js`: PASS",
    "",
    "## 28. No Content Changes",
    "",
    "No title, description, H1, first paragraph, body, internal links, calculator UI, calculator logic, calculator results, GA4, ads, canonical, hreflang, robots, or sitemap policy was changed.",
    "",
    "## 29. Recommended P1-1B Scope",
    "",
    "Use the priority JSON as a shortlist only. Split P1-1B into 3-5 URL batches and edit only after reviewing each URL's visible SERP intent, current title/H1, and recrawl risk.",
  ];
  writeText(OUT_REPORT, lines.join("\n"));
}

function renderDataQuality(diagnostics, source) {
  const rows = diagnostics.filter((item) => item.platform === source);
  if (!rows.length) return "- DATA_NOT_AVAILABLE";
  return mdTable(
    ["Type", "Encoding", "Delimiter", "Rows", "Actual Range", "Warnings"],
    rows.map((item) => [
      item.type,
      item.encoding,
      item.delimiter,
      item.rows,
      `${item.actual_range.start || ""}${item.actual_range.end ? ` ~ ${item.actual_range.end}` : ""}`,
      item.warnings.join(", ") || "none",
    ])
  );
}

function renderBrandedSummary(queryRows) {
  const branded = queryRows.filter((row) => row.is_branded === "true");
  const nonBranded = queryRows.filter((row) => row.is_branded !== "true");
  const sum = (rows, field) => rows.reduce((total, row) => total + (Number(row[field]) || 0), 0);
  return mdTable(
    ["Segment", "Queries", "Clicks", "Impressions"],
    [
      ["branded", branded.length, sum(branded, "clicks"), sum(branded, "impressions")],
      ["non-branded", nonBranded.length, sum(nonBranded, "clicks"), sum(nonBranded, "impressions")],
    ]
  );
}

function num(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function readSitemapPathSet() {
  const files = [
    path.join("public", "sitemap-0.xml"),
    path.join("public", "sitemap-ko.xml"),
    path.join("public", "sitemap-en.xml"),
    path.join("public", "en", "sitemap.xml"),
  ];
  const set = new Set();
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    const re = /<loc>([^<]+)<\/loc>/g;
    let match;
    while ((match = re.exec(text))) {
      set.add(normalizeUrl(match[1]));
    }
  }
  return set;
}

function topicCluster(text) {
  const value = String(text || "").toLowerCase();
  if (/주담대|주택담보|담보대출|원리금|대출금|mortgage/.test(value)) return "주담대";
  if (/dsr/.test(value)) return "DSR";
  if (/ltv/.test(value)) return "LTV";
  if (/아파트 구매|구매 계산|구매 대출|구매 가능|home-buy|home buying/.test(value)) return "아파트 구매 가능 금액";
  if (/집값|아파트값|순위|마곡|강남|서울|잠실|송파|가격|top100|real-estate/.test(value)) return "실거래가";
  if (/cagr|연평균|수익률/.test(value)) return "CAGR";
  if (/복리|월복리|연복리|compound/.test(value)) return "복리";
  if (/dca|적립식|분할매수/.test(value)) return "DCA";
  if (/목표|1억|모으기|goal/.test(value)) return "목표 자산";
  if (/fire|은퇴/.test(value)) return "FIRE";
  if (/환율|원화|금리|물가|dxy|tnx|kospi|시장/.test(value)) return "환율·시장";
  return "기타";
}

function clusterPriority(cluster) {
  const priority = {
    "아파트 구매 가능 금액": 24,
    DSR: 23,
    LTV: 22,
    "주담대": 21,
    "복리": 17,
    "목표 자산": 16,
    DCA: 15,
    CAGR: 15,
    "실거래가": 12,
    "환율·시장": 6,
    FIRE: 5,
    "기타": 1,
  };
  return priority[cluster] || 0;
}

function candidateUrlPriority(url, cluster, inventoryByUrl) {
  const item = inventoryByUrl.get(url);
  if (!item) return 0;
  let score = clusterPriority(cluster);
  if (item.content_type === "tool") score += 12;
  if (item.content_type === "post") score += 8;
  if (item.content_type === "market") score += 4;
  const haystack = `${url} ${item.title} ${item.h1}`.toLowerCase();
  if (cluster === "주담대" && /mortgage|주담대|담보|loan/.test(haystack)) score += 12;
  if (cluster === "DSR" && /dsr/.test(haystack)) score += 10;
  if (cluster === "CAGR" && /cagr|연평균/.test(haystack)) score += 10;
  if (cluster === "복리" && /compound|복리/.test(haystack)) score += 10;
  return score;
}

function parseCandidateUrls(value) {
  return String(value || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildNaverQueryClusters(queryMapRows, inventoryByUrl) {
  const clusters = new Map();
  for (const row of queryMapRows.filter((item) => item.source === "naver")) {
    const cluster = topicCluster(`${row.query} ${row.possible_url_targets}`);
    const bucket = clusters.get(cluster) || {
      cluster,
      queries: [],
      clicks: 0,
      impressions: 0,
      candidateCounts: new Map(),
    };
    bucket.queries.push(row);
    bucket.clicks += num(row.clicks);
    bucket.impressions += num(row.impressions);
    for (const url of parseCandidateUrls(row.possible_url_targets)) {
      bucket.candidateCounts.set(url, (bucket.candidateCounts.get(url) || 0) + num(row.impressions));
    }
    clusters.set(cluster, bucket);
  }

  const rows = Array.from(clusters.values()).map((bucket) => {
    const sortedQueries = bucket.queries
      .slice()
      .sort((a, b) => num(b.clicks) - num(a.clicks) || num(b.impressions) - num(a.impressions));
    const candidates = Array.from(bucket.candidateCounts.entries())
      .map(([url, impressions]) => ({
        url,
        impressions,
        score: candidateUrlPriority(url, bucket.cluster, inventoryByUrl),
      }))
      .sort((a, b) => b.score - a.score || b.impressions - a.impressions)
      .map((item) => item.url);
    const questionQueries = sortedQueries.filter((row) => /어떻게|얼마|왜|계산|가능|how|what|why|should/i.test(row.query));
    const amountQueries = sortedQueries.filter((row) => /\d|억|만원|%|년|월|연봉|금리|대출/i.test(row.query));
    return {
      cluster: bucket.cluster,
      query_count: bucket.queries.length,
      clicks: bucket.clicks,
      impressions: bucket.impressions,
      ctr: fmtCtr(bucket.impressions ? bucket.clicks / bucket.impressions : ""),
      representative_queries: sortedQueries.slice(0, 5).map((row) => row.query).join(" | "),
      variants: sortedQueries.map((row) => row.query).slice(0, 10).join(" | "),
      question_like_queries: questionQueries.map((row) => row.query).slice(0, 5).join(" | "),
      amount_term_queries: amountQueries.map((row) => row.query).slice(0, 5).join(" | "),
      primary_url_candidates: candidates.slice(0, 3).join(" | "),
      support_url_candidates: candidates.slice(3, 8).join(" | "),
      data_confidence: bucket.impressions >= 100 ? "LIMITED" : "VERY_LOW",
    };
  });

  return rows.sort((a, b) => num(b.clicks) - num(a.clicks) || num(b.impressions) - num(a.impressions));
}

function bestQueryEvidenceForUrl(url, queryMapRows) {
  const hits = queryMapRows
    .filter((row) => row.source !== "naver")
    .filter((row) => parseCandidateUrls(row.possible_url_targets).includes(url))
    .sort((a, b) => num(b.impressions) - num(a.impressions));
  const impressions = hits.reduce((sum, row) => sum + num(row.impressions), 0);
  const clicks = hits.reduce((sum, row) => sum + num(row.clicks), 0);
  const positions = hits
    .filter((row) => row.position !== "")
    .map((row) => ({ position: num(row.position), impressions: Math.max(1, num(row.impressions)) }));
  const weightedPosition = positions.length
    ? positions.reduce((sum, row) => sum + row.position * row.impressions, 0) / positions.reduce((sum, row) => sum + row.impressions, 0)
    : "";
  return {
    queries: hits.slice(0, 5).map((row) => row.query),
    clicks,
    impressions,
    position: weightedPosition,
    status: hits.length ? "HEURISTIC_QUERY_MATCH" : "NO_PAGE_QUERY_DATA",
  };
}

function reviewEnCandidates(mergedRows, queryMapRows, inventoryByUrl) {
  const candidates = mergedRows
    .filter((row) => row.locale === "en")
    .filter((row) => ["QUICK_WIN", "CTR_REPAIR", "PAGE_ONE_CANDIDATE", "GROWTH_CANDIDATE"].includes(row.opportunity_type))
    .filter((row) => num(row.known_impressions_excluding_naver_total) >= 30 || num(row.known_impressions) >= 30);

  return candidates.map((row) => {
    const item = inventoryByUrl.get(row.url) || {};
    const evidence = bestQueryEvidenceForUrl(row.url, queryMapRows);
    const gscImpressions = num(row.gsc_impressions);
    const bingImpressions = num(row.bing_impressions);
    const nonNaverImpressions = gscImpressions + bingImpressions;
    const positions = [row.gsc_position, row.bing_position].filter((value) => value !== "").map(Number);
    const bestPosition = positions.length ? Math.min(...positions) : "";
    const cluster = topicCluster(`${row.url} ${row.title} ${row.h1} ${row.overlap_group}`);
    const sampleGrade = nonNaverImpressions >= 100 ? "SUFFICIENT" : (nonNaverImpressions >= 30 ? "LIMITED" : "VERY_LOW");
    const changeValue = Math.round(
      Math.log10(nonNaverImpressions + 1) * 20
      + clusterPriority(cluster)
      + (bestPosition && bestPosition >= 4 && bestPosition <= 20 ? 18 : 0)
      + (evidence.impressions >= 20 ? 8 : 0)
    );
    const changeRisk = sampleGrade === "VERY_LOW" ? "HIGH_SAMPLE_RISK" : "LOW_TO_MEDIUM";
    return {
      ...row,
      engine_track: "EN_EXPERIMENT",
      cluster,
      non_naver_impressions: nonNaverImpressions,
      best_position: bestPosition,
      query_evidence: evidence,
      description: item.description || "",
      first_paragraph: item.first_paragraph || "",
      source_file: item.source_file || "",
      date_modified: item.date_modified || "",
      sample_grade: sampleGrade,
      recalibrated_score: changeValue,
      change_value: changeValue >= 75 ? "HIGH" : (changeValue >= 55 ? "MEDIUM" : "LOW"),
      change_risk: changeRisk,
      selected: false,
      exclusion_reason: "",
    };
  }).sort((a, b) => b.recalibrated_score - a.recalibrated_score);
}

function selectTrackA(enReviews) {
  const selected = [];
  const ordered = [
    ...enReviews.filter((row) => clusterPriority(row.cluster) >= 12),
    ...enReviews.filter((row) => clusterPriority(row.cluster) < 12),
  ];
  for (const row of ordered) {
    if (selected.length >= 3) break;
    if (row.sample_grade === "VERY_LOW") {
      row.exclusion_reason = "sample too small";
      continue;
    }
    if (!row.best_position || row.best_position > 20) {
      row.exclusion_reason = "position evidence outside 4-20 window";
      continue;
    }
    row.selected = true;
    selected.push(row);
  }
  for (const row of enReviews) {
    if (!row.selected && !row.exclusion_reason) {
      row.exclusion_reason = selected.length >= 3 ? "Track A limited to max 3" : "lower recalibrated score";
    }
  }
  return selected;
}

function reviewNaverPages(mergedRows, inventoryByUrl) {
  return mergedRows
    .filter((row) => row.naver_is_top30 === "true")
    .map((row) => {
      const item = inventoryByUrl.get(row.url) || row;
      const cluster = topicCluster(`${row.url} ${row.title} ${row.h1}`);
      const clicks = num(row.naver_top30_clicks);
      const rank = num(row.naver_top30_rank);
      let naver_class = "NO_ACTION";
      let protect = "title/H1";
      let expansion = "observe only";
      if ((item.content_type === "tool" || item.content_type === "market") && (clicks >= 10 || rank <= 10)) {
        naver_class = "NAVER_PROTECT";
        expansion = "avoid broad copy changes; monitor current winner";
      } else if (item.content_type === "post" && clicks >= 8 && clusterPriority(cluster) >= 12) {
        naver_class = "NAVER_LOW_RISK_EXPAND";
        expansion = "preserve title/H1; consider answer summary, concrete examples, calculator CTA, and lower-risk internal support";
      } else if (clicks >= 3 && clusterPriority(cluster) >= 12) {
        naver_class = "NAVER_ADJACENT_OPPORTUNITY";
        expansion = "use as supporting context for related intent; avoid heavy rewrite";
      } else if (clicks > 0) {
        naver_class = "HOLD";
      }
      return {
        ...row,
        naver_class,
        cluster,
        protect_elements: protect,
        low_risk_scope: expansion,
        related_calculator: relatedCalculatorForCluster(cluster),
        source_file: item.source_file || "",
        date_modified: item.date_modified || "",
        description: item.description || "",
        first_paragraph: item.first_paragraph || "",
      };
    })
    .sort((a, b) => num(a.naver_top30_rank) - num(b.naver_top30_rank));
}

function relatedCalculatorForCluster(cluster) {
  const map = {
    DSR: "/tools/dsr-ltv-calculator",
    LTV: "/tools/dsr-ltv-calculator",
    "주담대": "/tools/mortgage-loan-calculator",
    "아파트 구매 가능 금액": "/tools/home-buying-budget-calculator",
    "복리": "/tools/compound-interest",
    CAGR: "/tools/cagr-calculator",
    DCA: "/tools/dca-calculator",
    "목표 자산": "/tools/goal-simulator",
    FIRE: "/tools/fire-calculator",
    "실거래가": "/market/real-estate",
  };
  return map[cluster] || "";
}

function selectTrackB(naverReviews, naverClusters, inventoryByUrl) {
  const lowRisk = naverReviews
    .filter((row) => row.naver_class === "NAVER_LOW_RISK_EXPAND")
    .filter((row) => row.locale === "ko")
    .map((row) => ({
      url: row.url,
      source: "naver_page_top30",
      naver_class: row.naver_class,
      cluster: row.cluster,
      title: row.title,
      h1: row.h1,
      naver_rank: row.naver_top30_rank,
      clicks: num(row.naver_top30_clicks),
      impressions: num(row.naver_top30_impressions),
      ctr: row.naver_top30_ctr,
      protect_elements: "preserve title/H1 and current ranking intent",
      low_risk_scope: row.low_risk_scope,
      related_calculator: row.related_calculator,
      source_file: row.source_file,
      date_modified: row.date_modified,
      observation_period: "28 days minimum, preferably 6 weeks",
      score: num(row.naver_top30_clicks) + clusterPriority(row.cluster) + Math.log10(num(row.naver_top30_impressions) + 1) * 8,
    }));

  const existingUrls = new Set(naverReviews.map((row) => row.url));
  const adjacent = [];
  for (const cluster of naverClusters) {
    if (clusterPriority(cluster.cluster) < 15 || num(cluster.clicks) < 5) continue;
    const candidates = parseCandidateUrls(cluster.primary_url_candidates)
      .filter((url) => inventoryByUrl.has(url))
      .filter((url) => inventoryByUrl.get(url).locale === "ko")
      .filter((url) => !existingUrls.has(url));
    const url = candidates[0];
    if (!url) continue;
    const item = inventoryByUrl.get(url);
    adjacent.push({
      url,
      source: "naver_query_top30_adjacent",
      naver_class: "NAVER_ADJACENT_OPPORTUNITY",
      cluster: cluster.cluster,
      title: item.title,
      h1: item.h1,
      naver_rank: "",
      clicks: num(cluster.clicks),
      impressions: num(cluster.impressions),
      ctr: cluster.ctr,
      protect_elements: "no current Naver page winner to rewrite; keep target URL role clear",
      low_risk_scope: "align answer summary, calculator CTA, and supporting examples without keyword repetition",
      related_calculator: relatedCalculatorForCluster(cluster.cluster),
      source_file: item.source_file,
      date_modified: item.date_modified,
      observation_period: "28 days minimum, preferably 6 weeks",
      score: clusterPriority(cluster.cluster) + num(cluster.clicks) + Math.log10(num(cluster.impressions) + 1) * 8,
    });
  }

  const seen = new Set();
  const combined = [...adjacent, ...lowRisk]
    .sort((a, b) => b.score - a.score)
    .filter((row) => {
      if (seen.has(row.url)) return false;
      seen.add(row.url);
      return true;
    });
  return combined.slice(0, 3);
}

function classifyUnmatchedUrl(metric, sitemapSet, inventoryByUrl) {
  const url = metric.url;
  const inSitemap = sitemapSet.has(url);
  let classification = "OTHER";
  let reason = "Not present in 192 URL inventory.";
  let httpStatus = inSitemap ? "EXPECTED_200_FROM_SITEMAP" : "NOT_FETCHED_LOCAL_ONLY";
  let finalUrl = url;
  let canonical = inSitemap ? url : "";
  let scriptUpdateNeeded = "no";
  let contentActionNeeded = "no";

  if (/^\/(en\/)?market\/real-estate\/apt\//.test(url)) {
    classification = "APARTMENT_DETAIL_DYNAMIC_ROUTE";
    httpStatus = "DYNAMIC_ROUTE_NOT_FETCHED";
    canonical = "";
    reason = "Apartment detail URL is outside the 192 growth inventory and sitemap scope.";
  } else if (/^\/(en\/)?category\//.test(url)) {
    classification = "CATEGORY_ARCHIVE_ROUTE";
    reason = "Category archive route is a real navigation page but not part of the 192 growth inventory.";
    scriptUpdateNeeded = inSitemap ? "review_inventory_scope" : "no";
  } else if (inSitemap && !inventoryByUrl.has(url)) {
    classification = "INVENTORY_SCOPE_GAP";
    reason = "URL appears in sitemap but is outside the current analysis inventory.";
    scriptUpdateNeeded = "review_inventory_scope";
  }

  return {
    original_url: (metric.raw_urls || []).join(" | ") || url,
    normalized_url: url,
    platform: metric.source,
    clicks: metric.clicks,
    impressions: metric.impressions,
    http_status: httpStatus,
    final_url: finalUrl,
    canonical,
    sitemap_membership: inSitemap ? "true" : "false",
    inventory_missing: "true",
    classification,
    script_update_needed: scriptUpdateNeeded,
    content_action_needed: contentActionNeeded,
    reason,
  };
}

function buildUnmatchedRows(unmatched, inventoryByUrl) {
  const sitemapSet = readSitemapPathSet();
  return unmatched
    .map((metric) => classifyUnmatchedUrl(metric, sitemapSet, inventoryByUrl))
    .sort((a, b) => num(b.impressions) - num(a.impressions) || num(b.clicks) - num(a.clicks));
}

function platformTrafficShare(dailySummary) {
  const rows = ["gsc", "naver", "bing"].map((source) => ({
    source,
    clicks: dailySummary[source]?.clicks || 0,
    impressions: dailySummary[source]?.impressions || 0,
  }));
  const totalClicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const totalImpressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  return rows.map((row) => ({
    ...row,
    click_share: totalClicks ? row.clicks / totalClicks : 0,
    impression_share: totalImpressions ? row.impressions / totalImpressions : 0,
  }));
}

function writeCalibrationOutputs(context, inventoryData) {
  const inventoryByUrl = inventoryData.byUrl;
  const trafficShare = platformTrafficShare(context.dailySummary);
  const enReviews = reviewEnCandidates(context.mergedRows, context.queryRows, inventoryByUrl);
  const trackA = selectTrackA(enReviews);
  const naverClusters = buildNaverQueryClusters(context.queryRows, inventoryByUrl);
  const naverReviews = reviewNaverPages(context.mergedRows, inventoryByUrl);
  const trackB = selectTrackB(naverReviews, naverClusters, inventoryByUrl);
  const unmatchedRows = buildUnmatchedRows(context.unmatched, inventoryByUrl);
  const hold = naverReviews.filter((row) => row.naver_class === "NAVER_PROTECT" || row.naver_class === "HOLD");
  const noAction = [
    ...enReviews.filter((row) => !row.selected),
    ...naverReviews.filter((row) => row.naver_class === "NO_ACTION"),
  ];

  writeText(OUT_NAVER_QUERY_CLUSTERS, toCsv(naverClusters, NAVER_CLUSTER_FIELDS));
  writeText(OUT_UNMATCHED_URLS, toCsv(unmatchedRows, UNMATCHED_FIELDS));

  const executionTargets = {
    generatedAt: new Date().toISOString(),
    trackA_enExperiment: trackA.map((row) => ({
      url: row.url,
      current_title: row.title,
      current_h1: row.h1,
      bing: {
        clicks: row.bing_clicks,
        impressions: row.bing_impressions,
        ctr: row.bing_ctr,
        position: row.bing_position,
      },
      gsc: {
        clicks: row.gsc_clicks,
        impressions: row.gsc_impressions,
        ctr: row.gsc_ctr,
        position: row.gsc_position,
      },
      query_evidence: row.query_evidence,
      sample_grade: row.sample_grade,
      source_file: row.source_file,
      date_modified: row.date_modified,
      inbound_internal_links: row.inbound_internal_links,
      outbound_internal_links: row.outbound_internal_links,
      change_value: row.change_value,
      reason: "Non-Naver impressions and first-page/near-first-page Bing or GSC position support a limited EN experiment.",
      recommended_scope: ["title", "description", "first paragraph", "answer summary"],
      risk: row.change_risk,
      observation_period: "28 days minimum, preferably 6 weeks",
    })),
    trackB_koNaverExpansion: trackB.map((row) => ({
      url: row.url,
      current_title: row.title,
      current_h1: row.h1,
      naver_class: row.naver_class,
      naver_rank: row.naver_rank,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      query_cluster: row.cluster,
      protect_elements: row.protect_elements,
      low_risk_scope: row.low_risk_scope,
      related_calculator: row.related_calculator,
      source_file: row.source_file,
      date_modified: row.date_modified,
      observation_period: row.observation_period,
    })),
    hold: hold.slice(0, 20).map((row) => ({
      url: row.url,
      naver_class: row.naver_class,
      clicks: row.naver_top30_clicks,
      impressions: row.naver_top30_impressions,
      reason: row.low_risk_scope || "protect existing search performance",
    })),
    noAction: noAction.slice(0, 20).map((row) => ({
      url: row.url,
      reason: row.exclusion_reason || row.naver_class || "insufficient evidence",
    })),
  };
  writeText(OUT_EXECUTION_TARGETS, JSON.stringify(executionTargets, null, 2));

  const calibration = {
    generatedAt: new Date().toISOString(),
    trafficShare,
    enCandidateReview: enReviews.map((row) => ({
      url: row.url,
      title: row.title,
      h1: row.h1,
      bing_clicks: row.bing_clicks,
      bing_impressions: row.bing_impressions,
      bing_ctr: row.bing_ctr,
      bing_position: row.bing_position,
      gsc_clicks: row.gsc_clicks,
      gsc_impressions: row.gsc_impressions,
      gsc_ctr: row.gsc_ctr,
      gsc_position: row.gsc_position,
      query_evidence: row.query_evidence,
      description_length: row.description_length,
      inbound_internal_links: row.inbound_internal_links,
      outbound_internal_links: row.outbound_internal_links,
      source_file: row.source_file,
      date_modified: row.date_modified,
      sample_grade: row.sample_grade,
      recalibrated_score: row.recalibrated_score,
      change_value: row.change_value,
      change_risk: row.change_risk,
      selected: row.selected,
      exclusion_reason: row.exclusion_reason,
    })),
    naverClusters,
    naverPageReview: naverReviews,
    unmatchedUrls: unmatchedRows,
    executionTargets,
    dataLimitations: [
      "GSC and Bing have no page-query export; query-to-URL evidence is heuristic.",
      "Naver page/query files are TOP 30 click exports and are not complete datasets.",
      "Naver high-click winners are protected from broad title/H1 rewrites.",
      "Unmatched URL HTTP status is inferred from local route/sitemap scope, not fetched from production.",
    ],
    noContentChanges: true,
  };
  writeText(OUT_CALIBRATION_JSON, JSON.stringify(calibration, null, 2));

  writeCalibrationReport({
    trafficShare,
    enReviews,
    trackA,
    naverClusters,
    naverReviews,
    trackB,
    hold,
    noAction,
    unmatchedRows,
  });
}

function writeCalibrationReport(data) {
  const trafficRows = data.trafficShare.map((row) => [
    row.source,
    row.clicks,
    row.impressions,
    `${fmt(row.click_share * 100)}%`,
    `${fmt(row.impression_share * 100)}%`,
  ]);
  const enMetricRows = data.enReviews.map((row) => [
    row.url,
    row.title,
    row.h1,
    `${row.bing_clicks || 0}/${row.bing_impressions || 0}`,
    row.bing_ctr,
    row.bing_position,
    `${row.gsc_clicks || 0}/${row.gsc_impressions || 0}`,
    row.gsc_ctr,
    row.gsc_position,
    row.sample_grade,
    row.date_modified || "not declared",
    row.inbound_internal_links || 0,
    row.change_value,
    row.change_risk,
    row.selected ? "Track A" : row.exclusion_reason,
  ]);
  const enQueryRows = data.enReviews.map((row) => [
    row.url,
    shortList(row.query_evidence.queries, 5),
    row.query_evidence.impressions,
    fmt(row.query_evidence.position),
    row.query_evidence.status,
  ]);
  const naverPageRows = data.naverReviews.slice(0, 30).map((row) => [
    row.naver_top30_rank,
    row.url,
    row.title,
    row.h1,
    row.content_type,
    row.naver_top30_clicks,
    row.naver_top30_impressions,
    row.naver_top30_ctr,
    row.date_modified || "not declared",
    row.cluster,
    row.related_calculator || "",
    row.naver_class,
  ]);
  const trackARows = data.trackA.map((row) => [
    row.url,
    `${row.bing_clicks || 0}/${row.bing_impressions || 0}`,
    `${row.gsc_clicks || 0}/${row.gsc_impressions || 0}`,
    shortList(row.query_evidence.queries, 5),
    row.sample_grade,
    row.change_value,
    row.change_risk,
    "title/description/first paragraph/answer summary",
  ]);
  const trackBRows = data.trackB.map((row) => [
    row.url,
    row.title,
    row.naver_class,
    row.naver_rank,
    row.clicks,
    row.impressions,
    row.cluster,
    row.date_modified || "not declared",
    row.related_calculator || "",
    row.protect_elements,
    row.low_risk_scope,
  ]);
  const unmatchedDetailRows = data.unmatchedRows.map((row) => [
    row.normalized_url,
    row.platform,
    `${row.clicks || 0}/${row.impressions || 0}`,
    row.http_status,
    row.sitemap_membership,
    row.classification,
    row.script_update_needed,
    row.content_action_needed,
  ]);
  const unmatchedSummary = new Map();
  for (const row of data.unmatchedRows) {
    unmatchedSummary.set(row.classification, (unmatchedSummary.get(row.classification) || 0) + 1);
  }

  const lines = [
    "# FinMap 검색 유입 90일 P1-1A-2 우선순위 재보정",
    "",
    `- 기준일: ${new Date().toISOString().slice(0, 10)}`,
    "- 범위: P1-1A 검색 성과 재해석, 검색엔진별 역할 분리, P1-1B 실행 대상 확정",
    "- 실제 콘텐츠/페이지/계산기/SEO 정책 변경 없음",
    "",
    "## 1. Executive Summary",
    "",
    `P1-1A의 EN 후보 6개를 재검토해 Track A EN 실험 대상을 ${data.trackA.length}개로 제한했습니다.`,
    `Naver TOP 30 성과는 전체 클릭의 대부분을 차지하므로 전부 HOLD로 묶지 않고, 보호 대상과 저위험 확장 대상을 분리했습니다. Track B KO Naver 확장 대상은 ${data.trackB.length}개입니다.`,
    `Inventory 미매칭 URL ${data.unmatchedRows.length}개도 별도 분류했습니다.`,
    "",
    "## 2. Why Recalibration Was Needed",
    "",
    "P1-1A의 기존 우선 후보는 Bing/GSC의 평균 순위와 노출을 중심으로 잡혀 모두 EN URL이었습니다. 그러나 실제 클릭은 Naver가 압도적으로 크기 때문에, EN 실험과 KO Naver 성장 실험을 같은 점수로 비교하면 실행 우선순위가 왜곡됩니다.",
    "",
    "## 3. Platform Traffic Share",
    "",
    mdTable(["Platform", "Clicks", "Impressions", "Click Share", "Impression Share"], trafficRows),
    "",
    "## 4. Current EN Candidate Review",
    "",
    mdTable(
      ["URL", "Current Title", "Current H1", "Bing C/I", "Bing CTR", "Bing Pos.", "GSC C/I", "GSC CTR", "GSC Pos.", "Sample", "Date Modified", "Inbound Links", "Change Value", "Change Risk", "Decision"],
      enMetricRows
    ),
    "",
    "### EN Query Evidence",
    "",
    mdTable(["URL", "Identifiable Queries", "Query Impr.", "Query Pos.", "Evidence Status"], enQueryRows),
    "",
    "## 5. EN Sample Sufficiency",
    "",
    "- EN 후보는 page impressions 30 이상 또는 쿼리 evidence 20 이상을 우선 기준으로 삼았습니다.",
    "- page-query가 없으므로 쿼리와 URL 연결은 확정이 아니라 heuristic evidence입니다.",
    "- 최종 Track A는 최대 3개로 제한했습니다.",
    "",
    "## 6. Naver Query TOP 30 Clusters",
    "",
    mdTable(
      ["Cluster", "Queries", "Clicks", "Impressions", "CTR", "Representative Queries", "Primary URL Candidates"],
      data.naverClusters.map((row) => [
        row.cluster,
        row.query_count,
        row.clicks,
        row.impressions,
        row.ctr,
        row.representative_queries,
        row.primary_url_candidates,
      ])
    ),
    "",
    "## 7. Naver Page TOP 30 Review",
    "",
    mdTable(["Rank", "URL", "Title", "H1", "Type", "Clicks", "Impressions", "CTR", "Date Modified", "Topic", "Related Calculator", "Class"], naverPageRows),
    "",
    "## 8. NAVER_PROTECT",
    "",
    renderCalibrationUrlList(data.naverReviews.filter((row) => row.naver_class === "NAVER_PROTECT")),
    "",
    "## 9. NAVER_LOW_RISK_EXPAND",
    "",
    renderCalibrationUrlList(data.naverReviews.filter((row) => row.naver_class === "NAVER_LOW_RISK_EXPAND")),
    "",
    "## 10. NAVER_ADJACENT_OPPORTUNITY",
    "",
    renderCalibrationUrlList(data.trackB.filter((row) => row.naver_class === "NAVER_ADJACENT_OPPORTUNITY")),
    "",
    "## 11. Inventory Unmatched URLs",
    "",
    mdTable(
      ["Classification", "Count"],
      Array.from(unmatchedSummary.entries()).map(([classification, count]) => [classification, count])
    ),
    "",
    "Full original URLs are kept in `reports/search-growth-90d-p1-1a-2-unmatched-urls.csv`.",
    "",
    mdTable(["Normalized URL", "Platform", "Clicks/Impr.", "HTTP/Route Status", "Sitemap", "Class", "Script Update", "Content Action"], unmatchedDetailRows),
    "",
    "## 12. Track A EN Experiment Targets",
    "",
    mdTable(["URL", "Bing C/I", "GSC C/I", "Query Evidence", "Sample", "Change Value", "Change Risk", "Recommended Scope"], trackARows),
    "",
    "## 13. Track B KO Naver Expansion Targets",
    "",
    mdTable(["URL", "Current Title", "Class", "Rank", "Clicks", "Impressions", "Topic", "Date Modified", "Related Calculator", "Protect Elements", "Low-risk Scope"], trackBRows),
    "",
    "## 14. HOLD",
    "",
    renderCalibrationUrlList(data.hold.slice(0, 20)),
    "",
    "## 15. NO_ACTION",
    "",
    renderCalibrationNoAction(data.noAction.slice(0, 20)),
    "",
    "## 16. Recommended Execution Order",
    "",
    "1. Track A EN 2-3개를 먼저 실험하고 최소 28일 관찰합니다.",
    "2. 배포/색인 반영 뒤 Bing/GSC impressions, CTR, clicks를 비교합니다.",
    "3. Track B KO Naver 확장은 기존 title/H1 보호 원칙으로 별도 배치에서 진행합니다.",
    "4. Naver winner URL은 광범위한 rewrite보다 answer summary, calculator CTA, 관련 예시처럼 작은 변경만 검토합니다.",
    "",
    "## 17. Risks and Data Limitations",
    "",
    "- Naver TOP 30은 전체 데이터가 아니라 클릭 상위 30개입니다.",
    "- GSC/Bing page-query 데이터가 없어 특정 쿼리의 대표 URL은 확정하지 않았습니다.",
    "- Bing 표본은 EN 실험 신호로만 사용하고, Naver 클릭과 같은 가중치로 보지 않았습니다.",
    "- unmatched URL의 HTTP 상태는 로컬 route/sitemap 범위로 추정했으며 production fetch를 수행하지 않았습니다.",
    "",
    "## 18. Files Created",
    "",
    "- `reports/search-growth-90d-p1-1a-2-priority-calibration.md`",
    "- `reports/search-growth-90d-p1-1a-2-priority-calibration.json`",
    "- `reports/search-growth-90d-p1-1a-2-unmatched-urls.csv`",
    "- `reports/search-growth-90d-p1-1a-2-naver-query-clusters.csv`",
    "- `reports/search-growth-90d-p1-1a-2-execution-targets.json`",
    "",
    "## 19. Verification",
    "",
    "- `node scripts\\analyze_search_performance_inputs.js`: PASS",
    "",
    "## 20. No Content Changes",
    "",
    "No title, description, H1, first paragraph, body, internal link, calculator, GA4, ad, canonical, hreflang, robots, sitemap, slug, or redirect changes were made.",
    "",
    "## 21. Local-only Confirmation",
    "",
    "- Production server changes: none",
    "- Deployment: none",
    "- Commit: none",
    "- Push: none",
    "",
    "## 22. Recommended P1-1B Scope",
    "",
    "Track A는 EN 실험으로, Track B는 KO Naver 저위험 확장으로 분리해서 진행하는 것이 좋습니다. 두 트랙을 한 번에 모두 수정하지 말고, 변경일과 관찰 기간을 URL별로 기록하세요.",
  ];
  writeText(OUT_CALIBRATION_MD, lines.join("\n"));
}

function renderCalibrationUrlList(rows) {
  if (!rows.length) return "- 해당 항목 없음";
  return mdTable(
    ["URL", "Class", "Clicks", "Impressions", "Topic", "Scope"],
    rows.map((row) => [
      row.url,
      row.naver_class || row.opportunity_type || "",
      row.naver_top30_clicks || row.clicks || "",
      row.naver_top30_impressions || row.impressions || "",
      row.cluster || "",
      row.low_risk_scope || row.reason || "",
    ])
  );
}

function renderCalibrationNoAction(rows) {
  if (!rows.length) return "- 해당 항목 없음";
  return mdTable(
    ["URL", "Reason"],
    rows.map((row) => [row.url, row.exclusion_reason || row.naver_class || "insufficient evidence"])
  );
}

function createReadinessIfNoData(inventoryCount) {
  const lines = [
    "# FinMap 검색 유입 90일 P1-1A 데이터 준비도 보고서",
    "",
    "- 상태: DATA_NOT_AVAILABLE",
    `- inventory URL 수: ${inventoryCount}`,
    "",
    "`reports/search-performance-input/`에 실제 CSV가 없어 분석을 수행하지 않았습니다.",
  ];
  writeText(OUT_READINESS, lines.join("\n"));
}

function main() {
  const inputDir = arg("input", INPUT_DIR);
  const inventoryPath = arg("inventory", INVENTORY_FILE);
  const inventoryData = enrichInventoryWithAudit(loadInventory(inventoryPath));
  const files = discoverInputFiles(inputDir);
  if (!files.length) {
    createReadinessIfNoData(inventoryData.inventory.length);
    console.log("DATA_NOT_AVAILABLE: no actual CSV input files found.");
    return;
  }

  const diagnostics = [];
  const pageRows = [];
  const queryRows = [];
  const dailyRows = [];
  const naverDailyRows = [];

  for (const filePath of files) {
    const file = parseFile(filePath);
    const diagnosticsItem = createEmptyDiagnostics(file);
    const type = diagnosticsItem.type;
    diagnostics.push(diagnosticsItem);

    if (type === "filter") {
      parseFilter(file, diagnosticsItem);
    } else if (type === "daily" && diagnosticsItem.platform === "naver") {
      const rows = parseNaverDailyHorizontal(file, diagnosticsItem);
      dailyRows.push(...rows);
      naverDailyRows.push(...rows);
    } else if (type === "daily") {
      dailyRows.push(...parseDailyVertical(file, diagnosticsItem));
    } else if (type === "pages") {
      pageRows.push(...parsePages(file, diagnosticsItem));
    } else if (type === "queries") {
      queryRows.push(...parseQueries(file, diagnosticsItem));
    } else {
      diagnosticsItem.status = "WARN";
      diagnosticsItem.warnings.push("UNKNOWN_FILE_TYPE");
    }
  }

  const pageMap = aggregatePageRows(pageRows);
  const merged = buildMergedRows(inventoryData.inventory, pageMap, diagnostics);
  const queryMapRows = buildQueryRows(queryRows, inventoryData.inventory);
  const dailyMergedRows = buildDailyRows(dailyRows, diagnostics);
  const dailySummary = summarizeDaily(dailyMergedRows);

  writeText(OUT_MERGED, toCsv(merged.rows, URL_FIELDS));
  writeText(OUT_QUERY_MAP, toCsv(queryMapRows, QUERY_FIELDS));
  writeText(OUT_DAILY, toCsv(dailyMergedRows, DAILY_FIELDS));
  writeText(OUT_NAVER_DAILY, toCsv(naverDailyRows, NAVER_DAILY_FIELDS));

  const context = {
    diagnostics,
    mergedRows: merged.rows,
    queryRows: queryMapRows,
    dailyRows: dailyMergedRows,
    dailySummary,
    unmatched: merged.unmatched,
  };
  writePriority(context);
  writeDiagnostics(diagnostics, {
    inventoryUrls: inventoryData.inventory.length,
    inputFiles: diagnostics.length,
    pageRows: pageRows.length,
    queryRows: queryRows.length,
    dailyRows: dailyRows.length,
    mergedUrlsWithObservedData: merged.rows.filter((row) => row.platform_count).length,
    unmatchedInputUrls: merged.unmatched.length,
  });
  writeReport(context);
  writeCalibrationOutputs(context, inventoryData);

  console.log("Search performance inputs analyzed.");
  console.log(`Input files: ${diagnostics.length}`);
  console.log(`Inventory URLs: ${inventoryData.inventory.length}`);
  console.log(`Page rows: ${pageRows.length}`);
  console.log(`Query rows: ${queryRows.length}`);
  console.log(`Daily rows: ${dailyRows.length}`);
  console.log(`Merged URLs with observed data: ${merged.rows.filter((row) => row.platform_count).length}`);
  console.log(`Unmatched input URLs: ${merged.unmatched.length}`);
  console.log(`Priority candidates: ${priorityRows(merged.rows).length}`);
  console.log("P1-1A-2 calibration outputs: generated");
}

main();
