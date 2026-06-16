#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_BEFORE = path.join(process.cwd(), 'reports', 'input', 'ga4_naver_pages_20260604_0609.csv');
const DEFAULT_AFTER = path.join(process.cwd(), 'reports', 'input', 'ga4_naver_pages_20260610_0614.csv');
const DEFAULT_OUT = path.join(process.cwd(), 'reports', 'ga4-naver-page-drop-analysis-20260616.md');

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

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

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') {
      cell += ch;
    }
  }

  row.push(cell);
  rows.push(row);

  while (rows.length > 0 && rows[rows.length - 1].every((v) => !String(v || '').trim())) {
    rows.pop();
  }

  return rows.map((r) => r.map((v) => String(v || '').replace(/^\uFEFF/, '').trim()));
}

function isBlankRow(row) {
  return !row || row.every((v) => !String(v || '').trim());
}

function firstCell(row) {
  return String(row?.[0] || '').trim();
}

function isSectionRow(row) {
  return firstCell(row).startsWith('#');
}

function isUrlDataRow(row) {
  return firstCell(row).startsWith('/');
}

function parseNumber(value) {
  const raw = String(value || '').trim();
  if (!raw || raw === '-') return 0;
  const cleaned = raw.replace(/[%\s,]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function normalizeUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';

  try {
    const parsed = new URL(value, 'https://www.finmaphub.com');
    let pathname = parsed.pathname || '/';
    if (pathname === '/ko') pathname = '/';
    else if (pathname.startsWith('/ko/')) pathname = pathname.replace(/^\/ko/, '') || '/';
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    return `${pathname}${parsed.search || ''}`;
  } catch {
    return value.split('#')[0].trim();
  }
}

function pathOnly(urlPath) {
  return String(urlPath || '').split('?')[0] || '/';
}

function groupUrl(urlPath) {
  const p = pathOnly(urlPath);
  if (p === '/' || p === '/en') return 'home';
  if (p.includes('/market/real-estate/apt/')) return 'apt-detail';
  if (p.startsWith('/market/real-estate') || p.startsWith('/en/market/real-estate')) return 'real-estate';
  if (p.startsWith('/tools/') || p.startsWith('/en/tools/')) return 'tools';
  if (p.startsWith('/posts/') || p.startsWith('/en/posts/')) return 'posts';
  if (p.startsWith('/market/') || p.startsWith('/en/market/')) return 'market';
  if (p.startsWith('/category/') || p.startsWith('/en/category/')) return 'category';
  return 'other';
}

function findColumn(headers, patterns, fallback) {
  const lower = headers.map((h) => String(h || '').toLowerCase());
  for (const pattern of patterns) {
    const idx = lower.findIndex((h) => pattern.test(h));
    if (idx >= 0) return idx;
  }
  return fallback;
}

function getColumnMap(headers) {
  return {
    page: findColumn(headers, [
      /page.*path/,
      /landing.*page/,
      /path/,
      /\uD398\uC774\uC9C0.*\uACBD\uB85C/,
      /\uD654\uBA74.*\uD074\uB798\uC2A4/,
    ], 0),
    views: findColumn(headers, [
      /^views$/,
      /\bviews\b/,
      /^\uC870\uD68C\uC218$/,
    ], 1),
    activeUsers: findColumn(headers, [
      /^active\s*users$/,
      /^\uD65C\uC131\s*\uC0AC\uC6A9\uC790$/,
    ], 2),
    eventCount: findColumn(headers, [
      /^event\s*count$/,
      /^\uC774\uBCA4\uD2B8\s*\uC218$/,
    ], 5),
  };
}

function findNaverSectionIndex(rows) {
  return rows.findIndex((row) => (
    isSectionRow(row) && row.join(' ').toLowerCase().includes('naver')
  ));
}

function findHeaderAfterSection(rows, sectionIndex) {
  for (let i = sectionIndex + 1; i < rows.length; i += 1) {
    const row = rows[i];
    if (isBlankRow(row)) continue;
    if (isSectionRow(row)) continue;
    if (isUrlDataRow(row)) continue;
    if (row.length >= 2) return i;
  }
  return -1;
}

function collectSectionDataRows(rows, headerIndex) {
  const dataRows = [];
  let candidateRows = 0;
  let endIndex = rows.length;

  for (let i = headerIndex + 1; i < rows.length; i += 1) {
    const row = rows[i];
    if (isBlankRow(row) || isSectionRow(row)) {
      endIndex = i;
      break;
    }

    candidateRows += 1;
    if (isUrlDataRow(row)) {
      dataRows.push({ row, line: i + 1 });
    }
  }

  return { dataRows, candidateRows, endIndex };
}

function findFirstDataSection(rows) {
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (isBlankRow(row) || isSectionRow(row) || isUrlDataRow(row) || row.length < 2) continue;

    const section = collectSectionDataRows(rows, i);
    if (section.dataRows.length > 0) {
      return { headerIndex: i, section };
    }
  }
  return null;
}

function readGa4Csv(filePath) {
  const result = {
    filePath,
    exists: fs.existsSync(filePath),
    filterMode: 'not_read',
    parseMode: 'not_read',
    totalRows: 0,
    usedRows: 0,
    csvRows: 0,
    sectionTitle: '',
    sectionLine: null,
    headerLine: null,
    dataStartLine: null,
    dataEndLine: null,
    columnMap: {},
    headers: [],
    rows: new Map(),
    warnings: [],
  };

  if (!result.exists) {
    result.warnings.push(`Input file not found: ${filePath}`);
    return result;
  }

  const text = fs.readFileSync(filePath, 'utf8');
  const allRows = parseCsv(text);
  result.csvRows = allRows.length;

  const naverSectionIndex = findNaverSectionIndex(allRows);
  let headerIndex = -1;
  let section = null;

  if (naverSectionIndex >= 0) {
    headerIndex = findHeaderAfterSection(allRows, naverSectionIndex);
    if (headerIndex >= 0) {
      section = collectSectionDataRows(allRows, headerIndex);
      result.filterMode = 'naver_section';
      result.parseMode = 'section_title_then_header';
      result.sectionTitle = firstCell(allRows[naverSectionIndex]);
      result.sectionLine = naverSectionIndex + 1;
    } else {
      result.warnings.push(`Found naver section at line ${naverSectionIndex + 1}, but could not find its header row.`);
    }
  }

  if (!section) {
    const firstSection = findFirstDataSection(allRows);
    if (firstSection) {
      headerIndex = firstSection.headerIndex;
      section = firstSection.section;
      result.filterMode = 'no_naver_section_assumed_pre_filtered';
      result.parseMode = 'first_data_section_fallback';
      result.warnings.push('Naver section title was not found; using the first URL data section as pre-filtered input.');
    }
  }

  if (!section || headerIndex < 0) {
    result.filterMode = naverSectionIndex >= 0 ? 'naver_section_without_data' : 'no_data_section_found';
    result.parseMode = 'failed';
    result.warnings.push('Could not locate a parsable GA4 URL data section.');
    return result;
  }

  const headers = allRows[headerIndex] || [];
  const dataRows = section.dataRows;
  result.headers = headers;
  result.totalRows = section.candidateRows;
  result.headerLine = headerIndex + 1;
  result.dataStartLine = dataRows[0]?.line || null;
  result.dataEndLine = section.endIndex;
  result.columnMap = getColumnMap(headers);

  for (const item of dataRows) {
    const row = item.row;
    const rawUrl = row[result.columnMap.page] || row[0];
    const url = normalizeUrl(rawUrl);
    if (!url || !url.startsWith('/')) continue;

    const prev = result.rows.get(url) || { url, views: 0, activeUsers: 0, eventCount: 0, group: groupUrl(url) };
    prev.views += parseNumber(row[result.columnMap.views]);
    prev.activeUsers += parseNumber(row[result.columnMap.activeUsers]);
    prev.eventCount += parseNumber(row[result.columnMap.eventCount]);
    result.rows.set(url, prev);
    result.usedRows += 1;
  }

  return result;
}

function pct(after, before) {
  if (before === 0 && after === 0) return '0.0%';
  if (before === 0) return '+new';
  return `${(((after - before) / before) * 100).toFixed(1)}%`;
}

function compare(before, after, beforeDays, afterDays) {
  const urls = new Set([...before.rows.keys(), ...after.rows.keys()]);
  const records = [];

  for (const url of urls) {
    const b = before.rows.get(url) || { url, views: 0, activeUsers: 0, eventCount: 0, group: groupUrl(url) };
    const a = after.rows.get(url) || { url, views: 0, activeUsers: 0, eventCount: 0, group: groupUrl(url) };
    const beforeDailyViews = b.views / beforeDays;
    const afterDailyViews = a.views / afterDays;
    records.push({
      url,
      group: b.group || a.group || groupUrl(url),
      beforeViews: b.views,
      afterViews: a.views,
      deltaViews: a.views - b.views,
      beforeDailyViews,
      afterDailyViews,
      deltaDailyViews: afterDailyViews - beforeDailyViews,
      dailyViewsChangeRate: pct(afterDailyViews, beforeDailyViews),
      beforeActiveUsers: b.activeUsers,
      afterActiveUsers: a.activeUsers,
      deltaActiveUsers: a.activeUsers - b.activeUsers,
      beforeEventCount: b.eventCount,
      afterEventCount: a.eventCount,
      deltaEventCount: a.eventCount - b.eventCount,
    });
  }

  return records;
}

function sumRecords(records) {
  return records.reduce(
    (acc, r) => {
      acc.beforeViews += r.beforeViews;
      acc.afterViews += r.afterViews;
      acc.deltaViews += r.deltaViews;
      acc.beforeActiveUsers += r.beforeActiveUsers;
      acc.afterActiveUsers += r.afterActiveUsers;
      acc.beforeEventCount += r.beforeEventCount;
      acc.afterEventCount += r.afterEventCount;
      return acc;
    },
    {
      beforeViews: 0,
      afterViews: 0,
      deltaViews: 0,
      beforeActiveUsers: 0,
      afterActiveUsers: 0,
      beforeEventCount: 0,
      afterEventCount: 0,
    }
  );
}

function groupRecords(records, beforeDays, afterDays) {
  const byGroup = new Map();
  for (const r of records) {
    if (!byGroup.has(r.group)) byGroup.set(r.group, []);
    byGroup.get(r.group).push(r);
  }
  return Array.from(byGroup.entries())
    .map(([group, items]) => {
      const s = sumRecords(items);
      const beforeDailyViews = s.beforeViews / beforeDays;
      const afterDailyViews = s.afterViews / afterDays;
      return {
        group,
        urls: items.length,
        ...s,
        beforeDailyViews,
        afterDailyViews,
        deltaDailyViews: afterDailyViews - beforeDailyViews,
        dailyViewsChangeRate: pct(afterDailyViews, beforeDailyViews),
      };
    })
    .sort((a, b) => a.deltaDailyViews - b.deltaDailyViews);
}

function fmt(n, digits = 0) {
  if (!Number.isFinite(n)) return '-';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function md(value) {
  return String(value ?? '').replace(/\|/g, '\\|');
}

function renderMetricTable(records) {
  if (!records.length) return '- No rows';
  const lines = [
    '| URL | Group | Before views | After views | Delta views | Before/day | After/day | Daily change | Active users delta | Events delta |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];
  for (const r of records) {
    lines.push(`| ${md(r.url)} | ${r.group} | ${fmt(r.beforeViews)} | ${fmt(r.afterViews)} | ${fmt(r.deltaViews)} | ${fmt(r.beforeDailyViews, 2)} | ${fmt(r.afterDailyViews, 2)} | ${r.dailyViewsChangeRate} | ${fmt(r.deltaActiveUsers)} | ${fmt(r.deltaEventCount)} |`);
  }
  return lines.join('\n');
}

function renderGroupTable(records) {
  if (!records.length) return '- No rows';
  const lines = [
    '| Group | URLs | Before views | After views | Delta views | Before/day | After/day | Daily change | Active users delta | Events delta |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];
  for (const r of records) {
    lines.push(`| ${r.group} | ${r.urls} | ${fmt(r.beforeViews)} | ${fmt(r.afterViews)} | ${fmt(r.deltaViews)} | ${fmt(r.beforeDailyViews, 2)} | ${fmt(r.afterDailyViews, 2)} | ${r.dailyViewsChangeRate} | ${fmt(r.afterActiveUsers - r.beforeActiveUsers)} | ${fmt(r.afterEventCount - r.beforeEventCount)} |`);
  }
  return lines.join('\n');
}

function renderParseDetails(label, result) {
  const lines = [];
  lines.push(`### ${label}`);
  lines.push('');
  lines.push(`- Parse mode: ${result.parseMode}`);
  lines.push(`- Filter mode: ${result.filterMode}`);
  lines.push(`- CSV rows scanned: ${result.csvRows}`);
  lines.push(`- Section line: ${result.sectionLine || '-'}`);
  lines.push(`- Section title: ${result.sectionTitle || '-'}`);
  lines.push(`- Header line: ${result.headerLine || '-'}`);
  lines.push(`- Data line range: ${result.dataStartLine || '-'} to ${result.dataEndLine || '-'}`);
  lines.push(`- Rows used: ${result.usedRows} / ${result.totalRows}`);
  lines.push(`- Column indexes: page=${result.columnMap.page ?? '-'}, views=${result.columnMap.views ?? '-'}, activeUsers=${result.columnMap.activeUsers ?? '-'}, eventCount=${result.columnMap.eventCount ?? '-'}`);
  lines.push('');
  return lines.join('\n');
}

function renderReport({ before, after, records, groups, beforeDays, afterDays }) {
  const total = sumRecords(records);
  const totalBeforeDaily = total.beforeViews / beforeDays;
  const totalAfterDaily = total.afterViews / afterDays;
  const drops = records.filter((r) => r.deltaViews < 0).sort((a, b) => a.deltaViews - b.deltaViews).slice(0, 30);
  const gains = records.filter((r) => r.deltaViews > 0).sort((a, b) => b.deltaViews - a.deltaViews).slice(0, 30);

  const lines = [];
  lines.push('# GA4 Naver Page Drop Analysis - 2026-06-16');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Input Status');
  lines.push('');
  lines.push(`- Before CSV: \`${path.relative(process.cwd(), before.filePath)}\` (${before.exists ? 'found' : 'missing'})`);
  lines.push(`- After CSV: \`${path.relative(process.cwd(), after.filePath)}\` (${after.exists ? 'found' : 'missing'})`);
  lines.push(`- Before period days: ${beforeDays}`);
  lines.push(`- After period days: ${afterDays}`);
  lines.push(`- Before rows used: ${before.usedRows} / ${before.totalRows}`);
  lines.push(`- After rows used: ${after.usedRows} / ${after.totalRows}`);
  [...before.warnings, ...after.warnings].forEach((warning) => lines.push(`- Warning: ${warning}`));
  lines.push('');
  lines.push('## Parsing Details');
  lines.push('');
  lines.push(renderParseDetails('Before CSV', before).trimEnd());
  lines.push('');
  lines.push(renderParseDetails('After CSV', after).trimEnd());
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Before | After | Delta | Daily before | Daily after | Daily change |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: |');
  lines.push(`| Views | ${fmt(total.beforeViews)} | ${fmt(total.afterViews)} | ${fmt(total.deltaViews)} | ${fmt(totalBeforeDaily, 2)} | ${fmt(totalAfterDaily, 2)} | ${pct(totalAfterDaily, totalBeforeDaily)} |`);
  lines.push(`| Active users | ${fmt(total.beforeActiveUsers)} | ${fmt(total.afterActiveUsers)} | ${fmt(total.afterActiveUsers - total.beforeActiveUsers)} | - | - | - |`);
  lines.push(`| Event count | ${fmt(total.beforeEventCount)} | ${fmt(total.afterEventCount)} | ${fmt(total.afterEventCount - total.beforeEventCount)} | - | - | - |`);
  lines.push('');

  if (!before.exists || !after.exists) {
    lines.push('## Data Gap');
    lines.push('');
    lines.push('The requested GA4 CSV input files are not present in `reports/input`, so this report could not calculate URL-level drops yet.');
    lines.push('Place the exported CSV files at the requested paths and rerun:');
    lines.push('');
    lines.push('```powershell');
    lines.push('node scripts\\analyze_ga4_naver_pages.js --before=reports/input/ga4_naver_pages_20260604_0609.csv --after=reports/input/ga4_naver_pages_20260610_0614.csv');
    lines.push('```');
    lines.push('');
  }

  lines.push('## Group Changes');
  lines.push('');
  lines.push(renderGroupTable(groups));
  lines.push('');
  lines.push('## Top 30 Drops');
  lines.push('');
  lines.push(renderMetricTable(drops));
  lines.push('');
  lines.push('## Top 30 Gains');
  lines.push('');
  lines.push(renderMetricTable(gains));
  lines.push('');
  lines.push('## Notes');
  lines.push('');
  lines.push('- The parser first looks for a section title row whose first column starts with `#` and whose row text contains `naver`.');
  lines.push('- It then skips comment metadata rows, uses the next non-comment row as the header, and reads only rows whose first column starts with `/`.');
  lines.push('- The section ends at the next blank row, the next `#` row, or end of file.');
  lines.push('- Metric columns use header names when detected. Fallback indexes are page=0, views=1, activeUsers=2, eventCount=5.');
  lines.push('- Daily change uses 6 days for 2026-06-04 to 2026-06-09 and 5 days for 2026-06-10 to 2026-06-14 by default.');
  lines.push('- URL groups are based on normalized page paths after removing the Korean `/ko` prefix.');
  lines.push('');

  return lines.join('\n');
}

function main() {
  const beforePath = path.resolve(getArg('before', DEFAULT_BEFORE));
  const afterPath = path.resolve(getArg('after', DEFAULT_AFTER));
  const outPath = path.resolve(getArg('out', DEFAULT_OUT));
  const beforeDays = Number(getArg('before-days', '6'));
  const afterDays = Number(getArg('after-days', '5'));

  const before = readGa4Csv(beforePath);
  const after = readGa4Csv(afterPath);
  const records = compare(before, after, beforeDays, afterDays);
  const groups = groupRecords(records, beforeDays, afterDays);
  const total = sumRecords(records);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, renderReport({ before, after, records, groups, beforeDays, afterDays }), 'utf8');

  console.log(`Before CSV: ${before.exists ? 'found' : 'missing'} (${before.usedRows} rows used)`);
  console.log(`After CSV: ${after.exists ? 'found' : 'missing'} (${after.usedRows} rows used)`);
  console.log(`Compared URLs: ${records.length}`);
  console.log(`Views: ${total.beforeViews} -> ${total.afterViews}`);
  console.log(`Report: ${path.relative(process.cwd(), outPath).replace(/\\/g, '/')}`);
}

main();
