#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SITE = 'https://www.finmaphub.com';
const DEFAULT_BUILD_DIR = path.join(process.cwd(), '.next', 'server', 'pages');
const DEFAULT_REPORT_PATH = path.join(process.cwd(), 'reports', 'post-h1-count-audit-20260616.md');

const REQUIRED_URLS = [
  '/en/posts/personalFinance/rent-jeonse-buy-cashflow-opportunity-cost',
  '/en/posts/personalFinance/fire-sequence-risk-first-5-years',
];

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function normalizeSlashes(value) {
  return String(value || '').replace(/\\/g, '/');
}

function isPostHtmlFile(buildDir, filePath) {
  const rel = normalizeSlashes(path.relative(buildDir, filePath));
  if (!rel.endsWith('.html')) return false;

  const parts = rel.split('/');
  const postIndex = parts.indexOf('posts');
  if (postIndex < 0) return false;

  const afterPosts = parts.slice(postIndex + 1);
  return afterPosts.length === 2 && afterPosts[1].endsWith('.html');
}

function urlFromBuildFile(buildDir, filePath) {
  let rel = normalizeSlashes(path.relative(buildDir, filePath));
  rel = rel.replace(/\.html$/, '').replace(/\/index$/, '');

  let urlPath = `/${rel}`;
  if (urlPath.startsWith('/ko/')) urlPath = urlPath.replace(/^\/ko/, '') || '/';

  return urlPath;
}

function shortText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function mdEscape(value) {
  return shortText(value).replace(/\|/g, '\\|');
}

function auditFile(buildDir, filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);
  const h1Texts = $('h1')
    .map((_, el) => shortText($(el).text()))
    .get()
    .filter(Boolean);
  const canonical = $('link[rel="canonical"]').first().attr('href') || '';
  const title = $('title').first().text() || '';
  const url = urlFromBuildFile(buildDir, filePath);
  const h1Count = h1Texts.length;

  return {
    url,
    absoluteUrl: `${SITE}${url}`,
    file: normalizeSlashes(path.relative(process.cwd(), filePath)),
    h1Count,
    status: h1Count === 1 ? 'OK' : h1Count === 0 ? 'MISSING_H1' : 'MULTIPLE_H1',
    h1Texts,
    canonical,
    title: shortText(title),
  };
}

function tableRow(record) {
  return [
    record.absoluteUrl,
    String(record.h1Count),
    record.status,
    record.canonical || '-',
    record.h1Texts.length ? record.h1Texts.map(mdEscape).join('<br>') : '-',
  ].map(mdEscape).join(' | ');
}

function renderReport(records, buildDir) {
  const total = records.length;
  const ok = records.filter((r) => r.status === 'OK').length;
  const missing = records.filter((r) => r.status === 'MISSING_H1').length;
  const multiple = records.filter((r) => r.status === 'MULTIPLE_H1').length;
  const requiredRecords = REQUIRED_URLS.map((url) => (
    records.find((r) => r.url === url) || {
      url,
      absoluteUrl: `${SITE}${url}`,
      h1Count: 0,
      status: 'NOT_FOUND_IN_BUILD',
      canonical: '',
      h1Texts: [],
    }
  ));
  const problemRecords = records.filter((r) => r.h1Count !== 1);

  const lines = [];
  lines.push('# Finmap Post H1 Count Audit - 2026-06-16');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Build source: \`${normalizeSlashes(path.relative(process.cwd(), buildDir) || '.')}\``);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('| --- | ---: |');
  lines.push(`| Post HTML pages checked | ${total} |`);
  lines.push(`| H1 count = 1 | ${ok} |`);
  lines.push(`| H1 count = 0 | ${missing} |`);
  lines.push(`| H1 count > 1 | ${multiple} |`);
  lines.push('');
  lines.push('## Required URL Check');
  lines.push('');
  lines.push('| URL | H1 count | Status | Canonical | H1 text |');
  lines.push('| --- | ---: | --- | --- | --- |');
  requiredRecords.forEach((record) => {
    lines.push(`| ${tableRow(record)} |`);
  });
  lines.push('');
  lines.push('## URLs With H1 Count Not Equal To 1');
  lines.push('');

  if (!problemRecords.length) {
    lines.push('- None');
  } else {
    lines.push('| URL | H1 count | Status | Canonical | H1 text |');
    lines.push('| --- | ---: | --- | --- | --- |');
    problemRecords.forEach((record) => {
      lines.push(`| ${tableRow(record)} |`);
    });
  }

  lines.push('');
  lines.push('## All Post URLs');
  lines.push('');
  lines.push('| URL | H1 count | Status | Canonical | H1 text |');
  lines.push('| --- | ---: | --- | --- | --- |');
  records.forEach((record) => {
    lines.push(`| ${tableRow(record)} |`);
  });
  lines.push('');

  return lines.join('\n');
}

function main() {
  const buildDir = path.resolve(getArg('build-dir', DEFAULT_BUILD_DIR));
  const reportPath = path.resolve(getArg('out', DEFAULT_REPORT_PATH));

  if (!fs.existsSync(buildDir)) {
    console.error(`Build directory not found: ${buildDir}`);
    console.error('Run npm run build first, then rerun this audit.');
    process.exit(1);
  }

  const records = walk(buildDir)
    .filter((filePath) => isPostHtmlFile(buildDir, filePath))
    .map((filePath) => auditFile(buildDir, filePath))
    .sort((a, b) => a.url.localeCompare(b.url));

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, renderReport(records, buildDir), 'utf8');

  const multiple = records.filter((r) => r.h1Count > 1);
  const missing = records.filter((r) => r.h1Count === 0);
  console.log(`Checked ${records.length} post HTML pages.`);
  console.log(`H1 count > 1: ${multiple.length}`);
  console.log(`H1 count = 0: ${missing.length}`);
  console.log(`Report: ${normalizeSlashes(path.relative(process.cwd(), reportPath))}`);

  if (multiple.length || missing.length) {
    process.exitCode = 1;
  }
}

main();
