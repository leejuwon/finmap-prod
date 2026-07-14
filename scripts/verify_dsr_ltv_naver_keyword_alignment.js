#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const PAGE_PATH = path.join(ROOT, 'pages', 'tools', 'dsr-ltv-calculator.js');
const COMPONENT_PATH = path.join(ROOT, '_components', 'DsrLtvCalculator.js');
const RESULT_CTA_PATH = path.join(ROOT, '_components', 'ToolResultCta.js');
const BACKLINK_KIT_PATH = path.join(ROOT, '_components', 'ToolBacklinkKit.js');
const SITEMAP_KO_PATH = path.join(ROOT, 'public', 'sitemap-ko.xml');
const TARGET_PATH = '/tools/dsr-ltv-calculator';
const TARGET_URL = `https://www.finmaphub.com${TARGET_PATH}`;

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function extractField(raw, field) {
  const re = new RegExp(`${field}\\s*:\\s*(?:"([^"]*)"|'([^']*)'|\`([^\`]*)\`)`, 'm');
  const match = raw.match(re);
  return match ? match[1] || match[2] || match[3] || '' : '';
}

function pass(condition, name, detail) {
  return { ok: Boolean(condition), name, detail: detail || '' };
}

function containsAny(values, needles) {
  return needles.some((needle) => values.some((value) => String(value || '').includes(needle)));
}

function printTable(checks) {
  console.log('| Check | Result | Detail |');
  console.log('| --- | --- | --- |');
  for (const check of checks) {
    console.log(`| ${check.name} | ${check.ok ? 'PASS' : 'FAIL'} | ${String(check.detail || '-').replace(/\|/g, '\\|')} |`);
  }
}

function main() {
  const page = read(PAGE_PATH);
  const component = read(COMPONENT_PATH);
  const resultCta = read(RESULT_CTA_PATH);
  const backlinkKit = read(BACKLINK_KIT_PATH);
  const sitemapKo = read(SITEMAP_KO_PATH);

  const title = extractField(page, 'seoTitle');
  const description = extractField(page, 'seoDesc');
  const h1 = extractField(page, 'h1');
  const lead = extractField(page, 'lead');
  const upperText = `${h1}\n${lead}`;
  const titleDesc = [title, description];
  const pageAndComponents = `${page}\n${component}\n${resultCta}\n${backlinkKit}`;

  const checks = [
    pass(title.includes('DSR') && title.includes('LTV') && title.includes('계산기'), 'title includes DSR/LTV/calculator', title),
    pass(containsAny(titleDesc, ['주담대']), 'title or description includes 주담대', `${title} / ${description}`),
    pass(containsAny(titleDesc, ['원리금']), 'title or description includes 원리금', `${title} / ${description}`),
    pass(
      containsAny(titleDesc, ['아파트 담보대출', '주택담보대출']),
      'title or description includes apartment/mortgage loan wording',
      `${title} / ${description}`
    ),
    pass(
      upperText.includes('DSR') && upperText.includes('LTV') && upperText.includes('주담대'),
      'H1 or upper subtitle includes DSR/LTV/주담대 intent',
      `${h1} / ${lead}`
    ),
    pass(page.includes('주담대 원리금 계산기는 무엇을 확인하나요?'), 'FAQ includes 주담대 원리금 question'),
    pass(page.includes('DSR 계산기와 LTV 계산기는 무엇이 다른가요?'), 'FAQ includes DSR/LTV difference question'),
    pass(page.includes('const pageUrl = "/tools/dsr-ltv-calculator"') && page.includes('url={pageUrl}'), 'canonical self via SeoHead url', TARGET_PATH),
    pass(!/noindex/i.test(page), 'noindex absent in page source'),
    pass(sitemapKo.includes(`<loc>${TARGET_URL}</loc>`), 'sitemap-ko.xml includes target URL', TARGET_URL),
    pass(component.includes('trackGaEvent("dsr_ltv_calculate"'), 'GA4 dsr_ltv_calculate string maintained'),
    pass(component.includes('trackGaEvent("tool_calculate"'), 'GA4 tool_calculate string maintained'),
    pass(resultCta.includes('tool_result_cta_view'), 'GA4 tool_result_cta_view string maintained'),
    pass(resultCta.includes('tool_result_cta_click'), 'GA4 tool_result_cta_click string maintained'),
    pass(backlinkKit.includes('related_calculator_click'), 'GA4 related_calculator_click string maintained'),
    pass(pageAndComponents.includes('source_tool: "dsr_ltv"') && pageAndComponents.includes('sourceTool="dsrLtv"'), 'DSR/LTV source_tool values maintained'),
  ];

  console.log('# DSR/LTV Naver Keyword Alignment Verification');
  console.log('');
  console.log(`Target: ${TARGET_URL}`);
  console.log(`Title: ${title || '-'}`);
  console.log(`Description: ${description || '-'}`);
  console.log(`H1: ${h1 || '-'}`);
  console.log('');
  printTable(checks);

  const failed = checks.filter((check) => !check.ok);
  if (failed.length) {
    console.error('');
    console.error(`[verify-dsr-ltv-naver-keyword-alignment] FAIL: ${failed.map((check) => check.name).join(', ')}`);
    process.exitCode = 1;
    return;
  }

  console.log('');
  console.log('[verify-dsr-ltv-naver-keyword-alignment] PASS');
}

main();
