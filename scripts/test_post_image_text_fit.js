#!/usr/bin/env node

const assert = require('assert');
const { fitTextToBox, getCategoryPalette } = require('./lib/post_image_system');

function assertNoKoreanOrphan(result, label) {
  for (const line of result.lines.slice(1)) {
    assert(!/^[가-힣]$/.test(line.trim()), `${label}: orphan Korean syllable line: ${result.lines.join(' / ')}`);
  }
}

function assertNoBadSplit(result, label) {
  const joined = result.lines.join(' / ');
  assert(!joined.includes('거래 / 량'), `${label}: bad split ${joined}`);
  assert(!joined.includes('수익 / 률'), `${label}: bad split ${joined}`);
  assert(!joined.includes('거래 / 량'), `${label}: bad split ${joined}`);
}

function fitKo(text, boxWidth) {
  return fitTextToBox({
    text,
    boxWidth,
    maxLines: 2,
    initialFontSize: 34,
    minFontSize: 22,
    lang: 'ko',
    fontWeight: 900,
  });
}

const oneLine = fitKo('1~6개월 거래량', 260);
assert.deepStrictEqual(oneLine.lines, ['1~6개월 거래량']);
assert.strictEqual(oneLine.overflow, false);
assert.strictEqual(oneLine.wrapApplied, false);

const wrapped = fitKo('1~6개월 거래량', 120);
assert.deepStrictEqual(wrapped.lines, ['1~6개월', '거래량']);
assert.strictEqual(wrapped.overflow, false);
assert.strictEqual(wrapped.wrapApplied, true);
assertNoKoreanOrphan(wrapped, '1~6개월 거래량 narrow');
assertNoBadSplit(wrapped, '1~6개월 거래량 narrow');

const koCases = [
  '연봉별 대출한도',
  '월 50만원',
  '10년 후 예상금액',
  '복리 수익률',
  'DSR 40% 기준',
  'CAGR 계산',
  '거래량 변화',
  '환율과 유가',
];

for (const text of koCases) {
  const result = fitKo(text, 180);
  assert.strictEqual(result.overflow, false, `${text}: should fit within 2 lines`);
  assert(result.lines.length <= 2, `${text}: too many lines: ${result.lines.join(' / ')}`);
  assertNoKoreanOrphan(result, text);
  assertNoBadSplit(result, text);
}

const dsr = fitKo('DSR 40% 기준', 112);
assert.deepStrictEqual(dsr.lines, ['DSR 40%', '기준']);
assert.strictEqual(dsr.overflow, false);

const english = fitTextToBox({
  text: 'Portfolio growth rate',
  boxWidth: 210,
  maxLines: 2,
  initialFontSize: 30,
  minFontSize: 20,
  lang: 'en',
  fontWeight: 900,
});
assert.strictEqual(english.overflow, false);
assert(english.lines.length <= 2);

const longEnglish = fitTextToBox({
  text: 'Supercalifragilisticexpialidocious',
  boxWidth: 120,
  maxLines: 2,
  initialFontSize: 30,
  minFontSize: 20,
  lang: 'en',
  fontWeight: 900,
});
assert.strictEqual(longEnglish.overflow, true, 'long English words should fail instead of splitting');

assert.strictEqual(getCategoryPalette('economicInfo').categoryLabel, '경제');
assert.strictEqual(getCategoryPalette('investingInfo').categoryLabel, '투자');
assert.strictEqual(getCategoryPalette('personalFinance').categoryLabel, '재테크');
assert.strictEqual(getCategoryPalette('unknown').categoryLabel, 'unknown');

console.log('post image text fit tests PASS');
