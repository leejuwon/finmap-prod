'use strict';

const moment = require('moment-timezone');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const COMPACT_DATE_RE = /^\d{8}$/;

function pad2(value) {
  return String(value).padStart(2, '0');
}

function dateFromKey(dateKey) {
  const normalized = normalizeDateKey(dateKey);
  if (!normalized) return null;
  const [y, m, d] = normalized.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatUtcDate(date) {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

function addDays(dateKey, days) {
  const date = dateFromKey(dateKey);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return formatUtcDate(date);
}

function normalizeDateKey(value) {
  if (value == null || value === '') return null;

  if (value instanceof Date) {
    return formatUtcDate(value);
  }

  const raw = String(value).trim();
  if (DATE_RE.test(raw)) return raw;
  if (COMPACT_DATE_RE.test(raw)) return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);

  return null;
}

function todayInSeoul() {
  return moment().tz('Asia/Seoul').format('YYYY-MM-DD');
}

function weekday(dateKey) {
  const date = dateFromKey(dateKey);
  if (!date) return null;
  return date.getUTCDay();
}

function getWeekRange(input) {
  const base = input === 'today' || !input ? todayInSeoul() : normalizeDateKey(input);
  if (!base) throw new Error(`invalid --week value: ${input}`);

  const day = weekday(base);
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = addDays(base, mondayOffset);
  return {
    weekStart,
    weekEnd: addDays(weekStart, 4),
  };
}

function getCrawlerDateSet(targetDate) {
  const day = weekday(targetDate);
  if (day === 1) {
    return {
      targetDate,
      previousDate: addDays(targetDate, -3),
      xPreviousDate: addDays(targetDate, -4),
    };
  }
  if (day === 2) {
    return {
      targetDate,
      previousDate: addDays(targetDate, -1),
      xPreviousDate: addDays(targetDate, -4),
    };
  }
  return {
    targetDate,
    previousDate: addDays(targetDate, -1),
    xPreviousDate: addDays(targetDate, -2),
  };
}

function listTargetDates(fromDate, toDate) {
  const from = normalizeDateKey(fromDate);
  const to = normalizeDateKey(toDate);
  if (!from || !to) throw new Error('invalid date range');
  if (from > to) throw new Error('--from must be less than or equal to --to');

  const dates = [];
  for (let cur = from; cur <= to; cur = addDays(cur, 1)) {
    const day = weekday(cur);
    if (day >= 1 && day <= 5) dates.push(cur);
  }
  return dates;
}

function parseBoolean(value) {
  if (value == null) return false;
  return ['1', 'true', 'y', 'yes'].includes(String(value).toLowerCase());
}

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith('--')) continue;
    const idx = raw.indexOf('=');
    if (idx === -1) {
      args[raw.slice(2)] = '1';
    } else {
      args[raw.slice(2, idx)] = raw.slice(idx + 1);
    }
  }

  const targets = parseTargets(args.targets || 'all');
  const collector = parseCollector(args.collector || 'yahoo');
  const compareScope = parseCompareScope(args.compareScope || 'yhfOnly');
  const dryRun = parseBoolean(args.dryRun);
  const debug = parseBoolean(args.debug);
  const compareOnly = parseBoolean(args.compareOnly);
  const compareStockValue = parseBoolean(args.compareStockValue || '0');
  const allowEmptyStage = parseBoolean(args.allowEmptyStage || '0');
  const throttle = Number(args.throttle || 0);
  const runId = args.runId == null || args.runId === '' ? null : Number(args.runId);
  if (args.runId != null && (!Number.isInteger(runId) || runId <= 0)) {
    throw new Error('invalid --runId value');
  }

  let fromDate;
  let toDate;
  let weekStart;
  let weekEnd;

  if (args.from || args.to) {
    if (!args.from || !args.to) throw new Error('--from and --to must be provided together');
    fromDate = normalizeDateKey(args.from);
    toDate = normalizeDateKey(args.to);
    if (!fromDate || !toDate) throw new Error('invalid --from/--to date. Use YYYY-MM-DD');
    weekStart = fromDate;
    weekEnd = toDate;
  } else {
    const range = getWeekRange(args.week || 'today');
    weekStart = range.weekStart;
    weekEnd = range.weekEnd;
    fromDate = weekStart;
    toDate = weekEnd;
  }

  const targetDates = listTargetDates(fromDate, toDate);

  return {
    week: args.week || null,
    fromDate,
    toDate,
    weekStart,
    weekEnd,
    targetDates,
    targets,
    collector,
    compareScope,
    dryRun,
    debug,
    compareOnly,
    compareStockValue,
    allowEmptyStage,
    runId,
    throttle: Number.isFinite(throttle) && throttle > 0 ? throttle : 0,
  };
}

function parseCollector(value) {
  const collector = String(value || 'yahoo').toLowerCase();
  const allowed = new Set(['yahoo']);
  if (!allowed.has(collector)) {
    throw new Error(`invalid --collector value: ${value}. Supported: yahoo`);
  }
  return collector;
}

function parseCompareScope(value) {
  const scope = String(value || 'yhfOnly');
  const allowed = new Set(['yhfOnly']);
  if (!allowed.has(scope)) {
    throw new Error(`invalid --compareScope value: ${value}. Supported: yhfOnly`);
  }
  return scope;
}

function parseTargets(value) {
  const raw = String(value || 'all').toLowerCase();
  if (raw === 'all') return ['world', 'stock'];

  const targets = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const allowed = new Set(['world', 'stock']);
  for (const target of targets) {
    if (!allowed.has(target)) {
      throw new Error(`invalid --targets value: ${value}`);
    }
  }
  return [...new Set(targets)];
}

function sleep(ms) {
  if (!ms) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeJson(value) {
  try {
    return JSON.stringify(value == null ? null : value);
  } catch (error) {
    return JSON.stringify({ jsonError: error.message });
  }
}

function truncateText(value, maxLength) {
  if (value == null) return null;
  const text = String(value);
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

module.exports = {
  addDays,
  getCrawlerDateSet,
  getWeekRange,
  listTargetDates,
  normalizeDateKey,
  parseArgs,
  safeJson,
  sleep,
  todayInSeoul,
  truncateText,
};
