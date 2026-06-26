#!/usr/bin/env node

const os = require('os');
const path = require('path');
const { generateImages, makePlan, validateImages } = require('./lib/post_image_system');

function smokePlans() {
  const base = path.join(os.tmpdir(), 'finmap-post-image-smoke');
  const realNew = makePlan('content/posts/personalFinance/ko/salary-50m-dsr-40-loan-limit.md', {
    mode: 'new',
    dateStamp: '20260626',
  });
  realNew.slug = 'post-image-textfit-real-new';
  realNew.outputDir = path.join(base, 'real-new');

  const realReplace = makePlan('content/posts/economicInfo/ko/inflation-basics.md', {
    mode: 'replace-existing',
    dateStamp: '20260626-textfit',
  });
  realReplace.slug = 'post-image-textfit-real-replace';
  realReplace.outputDir = path.join(base, 'real-replace');

  return [
    {
      version: 'smoke',
      slug: 'post-image-textfit-new',
      lang: 'ko',
      category: 'personalFinance',
      categoryLabel: '재테크',
      paletteName: 'personal-finance-card',
      mode: 'new',
      outputDir: path.join(base, 'new'),
      expectedFiles: ['cover.png', 'img1.png'],
      images: [
        {
          slot: 'cover',
          fileName: 'cover.png',
          width: 1600,
          height: 900,
          template: 'cover',
          title: '텍스트 자동맞춤 테스트',
          subtitle: '1~6개월 거래량과 DSR 40% 기준을 자연스럽게 줄바꿈합니다.',
          keyword: '재테크 테스트',
          cards: ['1~6개월 거래량', 'DSR 40% 기준', '복리 수익률'],
          expected: { kind: 'cover', boxCount: 4, connectorCount: 0 },
        },
        {
          slot: 'img1',
          fileName: 'img1.png',
          width: 1200,
          height: 675,
          template: 'flow',
          title: '줄바꿈 검증',
          subtitle: '연봉별 대출한도 → 월 50만원 → 10년 후 예상금액',
          keyword: '단계별 흐름',
          items: ['1~6개월 거래량', '연봉별 대출한도', '10년 후 예상금액', '복리 수익률'],
          expected: { kind: 'flow', stepCount: 4, boxCount: 4, connectorCount: 3 },
        },
      ],
    },
    {
      version: 'smoke',
      slug: 'post-image-textfit-replace',
      lang: 'ko',
      category: 'economicInfo',
      categoryLabel: '경제',
      paletteName: 'economic-macro',
      mode: 'replace-existing',
      outputDir: path.join(base, 'replace'),
      expectedFiles: ['slot-001-cover.png', 'slot-002-chart.png'],
      images: [
        {
          slot: 'frontmatter-cover',
          fileName: 'slot-001-cover.png',
          width: 1600,
          height: 900,
          template: 'cover',
          title: '경제 팔레트 테스트',
          subtitle: '환율과 유가, 거래량 변화가 카드 안에서 어색하게 쪼개지지 않아야 합니다.',
          keyword: '경제 테스트',
          cards: ['환율과 유가', '거래량 변화', 'CAGR 계산'],
          expected: { kind: 'cover', boxCount: 4, connectorCount: 0 },
        },
        {
          slot: 'html-001',
          fileName: 'slot-002-chart.png',
          width: 1200,
          height: 675,
          template: 'comparison',
          title: '지표 카드 검증',
          subtitle: 'DSR 40% 기준과 1~6개월 거래량을 검증합니다.',
          keyword: '대시보드 신호',
          items: ['DSR 40% 기준', '1~6개월 거래량', '환율과 유가'],
          expected: { kind: 'comparison', panelCount: 3, boxCount: 3, connectorCount: 0 },
        },
      ],
    },
    realNew,
    realReplace,
  ];
}

async function run() {
  for (const plan of smokePlans()) {
    await generateImages(plan);
    const { report, reportPath } = await validateImages(plan);
    console.log(`${plan.slug}: ${report.status} ${reportPath}`);
    if (report.status !== 'PASS') {
      for (const error of report.errors) console.error(`- ${error}`);
      process.exitCode = 1;
    }
  }
}

run().catch((err) => {
  console.error(err.stack || err.message || err);
  process.exit(1);
});
