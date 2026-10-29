// 2026-10-29 신규 글의 콘텐츠·계산 수치·렌더링을 재검증합니다.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { marked } = require('marked');
const cheerio = require('cheerio');
const sharp = require('sharp');
const { simulateCompoundPlan } = require('../lib/compoundCore');
const { simulateDcaPlan } = require('../lib/dcaCore');

const SLUGS = [
  'four-account-salary-automation',
  'compound-vs-dca-calculator-guide',
  'home-price-by-monthly-mortgage-payment',
];
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.finmaphub.com';
const DATE = '2026-10-29';
const compact = (text) => text.replace(/\s+/g, ' ').trim();

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function postPath(lang, slug) {
  return path.join(ROOT, 'content', 'posts', 'personalFinance', lang, `${slug}.md`);
}

function readPost(lang, slug) {
  const file = postPath(lang, slug);
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  return { file, data, content, $: cheerio.load(marked.parse(content)) };
}

function almost(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) < Math.max(0.01, Math.abs(expected) * 1e-9),
    `${label}: ${actual} != ${expected}`);
}

function futureByDeposits(initial, contribution, annual, years, begin = false) {
  // 각 납입금의 남은 운용기간을 직접 합산해 제품의 공식과 독립 검산.
  const i = annual / 12;
  const n = years * 12;
  let total = initial * (1 + i) ** n;
  for (let month = 1; month <= n; month += 1) {
    total += contribution * (1 + i) ** (n - month + (begin ? 1 : 0));
  }
  return total;
}

function payment(principal, annual, years) {
  const i = annual / 12;
  return i === 0 ? principal / (years * 12) : principal * i / (1 - (1 + i) ** (-years * 12));
}

function principalByPayments(amount, annual, years) {
  let total = 0;
  for (let month = 1; month <= years * 12; month += 1) {
    total += amount / (1 + annual / 12) ** month;
  }
  return total;
}

function checkNumbers() {
  const table = [];
  for (const monthly of [300000, 500000, 1000000, 300, 500, 1000]) {
    for (const years of [5, 10, 20]) {
      const end = futureByDeposits(0, monthly, 0.05, years);
      const begin = futureByDeposits(0, monthly, 0.05, years, true);
      const compound = simulateCompoundPlan({ initialAmount: 0, monthlyContribution: monthly,
        annualReturn: 5, years, taxRate: 0, feeRate: 0, inflationRate: 0 });
      assert.equal(compound.ok, true);
      const dca = simulateDcaPlan({ initial: 0, monthly, annualRate: 5, years,
        taxRate: 0, feeRate: 0, annualIncrease: 0, contributionFrequency: 'monthly', compounding: 'monthly' });
      almost(compound.futureValueNet, end, 'compound deposits');
      almost(dca.rows.at(-1).valueNet, begin, 'DCA deposits');
      const article = readPost(monthly >= 300000 ? 'ko' : 'en', SLUGS[1]).content;
      const displayed = monthly >= 300000
        ? (end / 10000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        : Math.round(end).toLocaleString('en-US');
      assert.ok(article.includes(displayed), `Missing investment table value: ${displayed}`);
      table.push({ monthly, years, end, begin });
    }
  }
  const taxExamples = [];
  for (const scale of [1, 0.001]) {
    const initial = 10000000 * scale;
    const monthly = 500000 * scale;
    const beforeTax = futureByDeposits(initial, monthly, 0.045, 10);
    const expectedCompound = beforeTax - (beforeTax - initial - monthly * 120) * 0.154;
    const expectedDca = futureByDeposits(initial, monthly, 0.05 * (1 - 0.154) - 0.005, 10, true);
    const c = simulateCompoundPlan({ initialAmount: initial, monthlyContribution: monthly,
      annualReturn: 5, years: 10, taxRate: 15.4, feeRate: 0.5, inflationRate: 0 });
    const d = simulateDcaPlan({ initial, monthly, annualRate: 5, years: 10,
      taxRate: 15.4, feeRate: 0.5, annualIncrease: 0 });
    almost(c.futureValueNet, expectedCompound, 'compound tax');
    almost(d.rows.at(-1).valueNet, expectedDca, 'DCA tax');
    const article = readPost(scale === 1 ? 'ko' : 'en', SLUGS[1]).content;
    for (const value of [expectedCompound, expectedDca]) {
      const shown = scale === 1 ? (value / 10000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        : Math.round(value).toLocaleString('en-US');
      assert.ok(article.includes(shown), `Missing tax example: ${shown}`);
    }
    taxExamples.push({ scale, compound: expectedCompound, dca: expectedDca });
  }
  const mortgage = readPost('ko', SLUGS[2]).content;
  for (const rate of [0.03, 0.04, 0.05, 0.06]) for (const years of [20, 30]) {
    const amount = payment(200000000, rate, years);
    almost(principalByPayments(amount, rate, years), 200000000, 'mortgage present value');
    let outstanding = 200000000;
    for (let month = 0; month < years * 12; month += 1) outstanding = outstanding * (1 + rate / 12) - amount;
    almost(outstanding, 0, 'amortization final balance');
    assert.ok(mortgage.includes((amount / 10000).toFixed(1)), 'Missing payment table amount');
  }
  for (const amount of [700000, 1100000, 1500000]) {
    const principal = principalByPayments(amount, 0.04, 30);
    almost(payment(principal, 0.04, 30), amount, 'inverse loan');
    const formatted = (principal / 10000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    // 본문은 억 단위와 만원 단위를 함께 사용합니다.
    const remainder = ((principal % 100000000) / 10000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    assert.ok(mortgage.includes(formatted) || mortgage.includes(remainder), 'Missing inverse loan amount');
  }
  for (const [income, allocations] of [
    [250, [10, 120, 70, 50]], [350, [10, 150, 90, 100]], [500, [20, 210, 130, 140]],
    [3000, [100, 1500, 800, 600]], [4500, [100, 2000, 1100, 1300]], [6500, [200, 2800, 1500, 2000]],
  ]) assert.equal(allocations.reduce((sum, value) => sum + value, 0), income);
  return { investmentCases: table, taxExamples, mortgageCases: 8, inverseMortgageCases: 3, salaryAllocations: 6 };
}

async function checkContent() {
  const existingPosts = new Map();
  for (const file of walk(path.join(ROOT, 'content', 'posts')).filter((f) => f.endsWith('.md'))) {
    const rel = path.relative(path.join(ROOT, 'content', 'posts'), file).split(path.sep);
    const [category, lang] = rel;
    const slug = path.basename(file, '.md');
    const url = `${lang === 'en' ? '/en' : ''}/posts/${category}/${slug}`;
    assert.ok(!existingPosts.has(url), `Duplicate URL ${url}`);
    existingPosts.set(url, file);
  }
  const registry = fs.readFileSync(path.join(ROOT, 'docs', 'blog-contents.md'), 'utf8');
  const result = [];
  for (const lang of ['ko', 'en']) for (const slug of SLUGS) {
    if (lang === 'en' && slug === SLUGS[2]) {
      assert.equal(fs.existsSync(postPath(lang, slug)), false, 'Mortgage post must remain Korean only');
      continue;
    }
    const { file, data, content, $ } = readPost(lang, slug);
    const prefix = lang === 'en' ? '/en' : '';
    const url = `${prefix}/posts/personalFinance/${slug}`;
    for (const key of ['title', 'description', 'tags', 'cover', 'tool']) assert.ok(data[key]?.length, `${file}: missing ${key}`);
    assert.equal(data.slug, slug);
    assert.equal(data.lang, lang);
    assert.equal(data.category, lang === 'ko' ? '재테크' : 'Personal Finance');
    assert.equal(data.postCategory, 'personalFinance');
    assert.equal(data.link, url);
    assert.equal(data.datePublished, DATE);
    assert.equal(data.dateModified, DATE);
    assert.ok(registry.split(/\r?\n/).some((line) => line.trim() === `url: ${url}`), `Missing registry URL: ${url}`);
    assert.equal($('h1').length, 0);
    assert.equal($('.hero-grid').length, 1);
    assert.equal($('.hero-main').length, 1);
    assert.equal($('.hero-card').length, 1);
    const heroIndex = content.indexOf('<div class="hero-grid">');
    assert.ok(heroIndex < content.indexOf('\n## '));
    const summaryCount = (content.slice(0, heroIndex).match(/^- /gm) || []).length;
    assert.ok(summaryCount >= 8 && summaryCount <= 10);
    assert.ok($('table').length >= 2 && $('table').length <= 4);
    assert.ok($('table').toArray().some((el) => $(el).find('tbody tr').length === 3 &&
      /상태|시나리오|State|state|scenario/.test($(el).find('thead').text())), 'Three scenarios and triggers required');
    assert.equal(($('h3').text().match(/사례 [12]:|Case [12]:/g) || []).length, 2);
    assert.equal($('figure').length, 3);
    assert.equal($('figure img').length, 3);
    for (const [i, figure] of $('figure').toArray().entries()) {
      assert.ok($(figure).find('img').attr('alt')?.length > 20);
      assert.ok($(figure).find('figcaption').text().trim().length > 20);
      assert.equal($(figure).find('img').attr('src'), `/images/posts/${slug}/img${i + 1}.png`);
    }
    const images = [data.cover, ...$('figure img').map((_, el) => $(el).attr('src')).get()];
    const imageInfo = [];
    for (const [i, src] of images.entries()) {
      const target = path.join(ROOT, 'public', src.replace(/^\//, ''));
      assert.ok(fs.existsSync(target), `Missing image ${src}`);
      const meta = await sharp(target).metadata();
      assert.equal(meta.format, 'png');
      assert.equal(meta.width, i === 0 ? 1200 : 1600);
      assert.equal(meta.height, i === 0 ? 630 : 900);
      imageInfo.push({ src, width: meta.width, height: meta.height, bytes: fs.statSync(target).size });
    }
    const internal = $('a[href^="/"]').map((_, el) => $(el).attr('href')).get();
    assert.ok(internal.length >= 4 && internal.length <= 6, `Internal link count: ${internal.length}`);
    for (const href of internal) {
      const pathname = href.split(/[?#]/)[0];
      if (pathname.includes('/posts/')) assert.ok(existingPosts.has(pathname), `Broken post ${href}`);
      else assert.ok(fs.existsSync(path.join(ROOT, 'pages', pathname.replace(/^\/en\//, '/').slice(1) + '.js')), `Broken page ${href}`);
      if (lang === 'en') assert.ok(href.startsWith('/en/'), `Unlocalized link ${href}`);
    }
    const jsonld = $('script[type="application/ld+json"]').toArray().map((el) => JSON.parse($(el).html()));
    assert.equal(jsonld.length, 1, 'Only FAQ JSON-LD belongs in Markdown');
    assert.equal(jsonld[0]['@type'], 'FAQPage');
    assert.equal(jsonld[0]['@id'], SITE + url + '#faq');
    assert.equal(jsonld[0].inLanguage, lang);
    const faqHtml = cheerio.load(marked.parse(content.slice(content.lastIndexOf('\n## ')).replace(/<script[\s\S]*?<\/script>/g, '')));
    const visibleFaq = faqHtml('h3').toArray().map((el) => ({
      question: faqHtml(el).text(), answer: compact(faqHtml(el).nextUntil('h3,h2').text()),
    }));
    assert.equal(visibleFaq.length, 8);
    assert.deepEqual(jsonld[0].mainEntity.map((q) => ({ question: q.name, answer: compact(q.acceptedAnswer.text) })), visibleFaq);
    assert.ok(!/noindex|^##? (Internal Links|Img-row|Summary Images|Hero Section|CTA Section)/mi.test(content));
    const visibleText = compact($('body').clone().find('script').remove().end().text());
    if (lang === 'ko') assert.ok(visibleText.length >= 8000 && visibleText.length <= 15000, `Korean length ${visibleText.length}`);
    result.push({ lang, slug, url, visibleCharacters: visibleText.length, summaryCount,
      tables: $('table').length, faq: visibleFaq.length, internalLinks: internal, images: imageInfo });
  }
  return result;
}

async function checkBrowser(baseUrl) {
  const puppeteer = require('puppeteer-core');
  const executablePath = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].find((candidate) => fs.existsSync(candidate));
  assert.ok(executablePath, 'A local Chrome or Edge is required');
  const browser = await puppeteer.launch({ executablePath, headless: true,
    args: ['--no-sandbox', '--disable-extensions', '--disable-background-networking'] });
  const results = [];
  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const target = new URL(request.url());
      // 외부 광고·분석·폰트를 요청하지 않고 로컬 페이지를 검증.
      if (target.origin === new URL(baseUrl).origin && target.pathname.startsWith('/api/')) {
        // 화면 검증이 조회수·댓글 DB에 접근하지 않도록 더미 응답.
        request.respond({ status: 200, contentType: 'application/json', body: '{"comments":[],"likes":0,"views":0}' });
      } else if (target.origin === new URL(baseUrl).origin || target.protocol === 'data:') request.continue();
      else request.abort();
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const lang of ['ko', 'en']) for (const slug of SLUGS) {
      const pathname = `${lang === 'en' ? '/en' : ''}/posts/personalFinance/${slug}`;
      const response = await page.goto(baseUrl + pathname, { waitUntil: 'domcontentloaded' });
      if (lang === 'en' && slug === SLUGS[2]) {
        assert.equal(response.status(), 404, 'No English fallback for Korean-only post');
        results.push({ path: pathname, status: 404 });
        continue;
      }
      assert.equal(response.status(), 200);
      await page.waitForFunction(() => window.next?.router?.isReady === true);
      await page.evaluate(() => Promise.all(Array.from(document.querySelectorAll('article img')).map((img) => {
        img.loading = 'eager';
        return img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
      })));
      const state = await page.evaluate(() => {
        const body = document.querySelector('.fm-post-body');
        const articleImages = Array.from(document.querySelectorAll('article img')).filter((img) => /\/images\/posts\//.test(decodeURIComponent(img.currentSrc || img.src)));
        const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).flatMap((script) => {
          const value = JSON.parse(script.textContent); return Array.isArray(value) ? value : [value];
        });
        return {
          canonical: document.querySelector('link[rel="canonical"]')?.href,
          alternates: Array.from(document.querySelectorAll('link[hreflang]')).map((el) => ({ lang: el.hreflang, href: el.href })),
          robots: document.querySelector('meta[name="robots"]')?.content || '',
          summaryText: document.querySelector('article > section')?.textContent || '',
          h1: document.querySelectorAll('article h1').length,
          hero: body.querySelectorAll('.hero-grid').length,
          figures: body.querySelectorAll('figure').length,
          images: articleImages.map((img) => ({ src: img.currentSrc || img.src, loaded: img.complete && img.naturalWidth > 0 })),
          schemaTypes: ld.map((item) => item['@type']),
          toolPaths: Array.from(document.querySelectorAll('article a[href*="/tools/"]')).map((a) => new URL(a.href).pathname),
        };
      });
      assert.equal(state.canonical, SITE + pathname);
      assert.equal(state.h1, 1);
      assert.equal(state.hero, 1);
      assert.equal(state.figures, 3);
      assert.equal(state.images.length, 4, 'Cover plus three body images exactly once');
      assert.ok(state.images.every((img) => img.loaded), 'All images must load');
      assert.ok(!state.robots.includes('noindex'));
      assert.ok(!/\b(mortgageLoan|homeBuying)\b/.test(state.summaryText), 'Display user-facing calculator names');
      for (const type of ['BlogPosting', 'BreadcrumbList', 'FAQPage']) assert.equal(state.schemaTypes.filter((value) => value === type).length, 1);
      assert.ok(!state.schemaTypes.includes('Article'));
      const expectedTools = slug === SLUGS[0] ? ['/tools/goal-simulator'] : slug === SLUGS[1]
        ? ['/tools/compound-interest', '/tools/dca-calculator']
        : ['/tools/mortgage-loan-calculator', '/tools/home-buying-budget-calculator', '/tools/dsr-ltv-calculator'];
      for (const tool of expectedTools) assert.ok(state.toolPaths.includes(`${lang === 'en' ? '/en' : ''}${tool}`), `Missing CTA ${tool}`);
      if (slug === SLUGS[2]) {
        assert.equal(state.alternates.some((item) => item.lang === 'en'), false);
        const before = page.url();
        await page.evaluate(() => Array.from(document.querySelectorAll('header button')).find((el) => el.textContent.trim() === 'EN').click());
        await page.waitForFunction(() => document.body.textContent.includes('이 글은 영어 버전이 아직 없습니다.'));
        assert.equal(page.url(), before);
        state.languageSwitch = 'blocked with existing missing-translation message';
      } else {
        assert.ok(state.alternates.some((item) => item.lang === 'ko' && item.href === SITE + `/posts/personalFinance/${slug}`));
        assert.ok(state.alternates.some((item) => item.lang === 'en' && item.href === SITE + `/en/posts/personalFinance/${slug}`));
        const target = lang === 'ko' ? 'EN' : '한국어';
        await Promise.all([
          page.waitForFunction((expected) => window.location.pathname === expected,
            {}, `${lang === 'ko' ? '/en' : ''}/posts/personalFinance/${slug}`),
          page.evaluate((label) => Array.from(document.querySelectorAll('header button')).find((el) => el.textContent.trim() === label).click(), target),
        ]);
        state.languageSwitch = `${lang} -> ${lang === 'ko' ? 'en' : 'ko'} passed`;
      }
      for (const width of [390, 1440]) {
        await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
        await page.goto(baseUrl + pathname, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => window.next?.router?.isReady === true);
        await page.waitForFunction(() => Array.from(document.querySelectorAll('article img')).filter((img) =>
          decodeURIComponent(img.currentSrc || img.src).includes('/cover.png')).every((img) => img.complete && img.naturalWidth > 0));
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        assert.equal(overflow, false, `Horizontal overflow at ${width}px`);
        if (lang === 'ko') await page.screenshot({ path: path.join(ROOT, 'reports', `${slug}-${width}.png`), fullPage: false });
      }
      results.push({ path: pathname, status: response.status(), ...state });
    }
    // 기존에 서로 다른 slug를 사용하는 한·영 매핑도 유지되는지 확인.
    for (const [lang, slug] of [['ko', 'is-dca-better-in-bear-market'], ['en', 'is-dca-better-in-a-bear-market']]) {
      const pathname = `${lang === 'en' ? '/en' : ''}/posts/personalFinance/${slug}`;
      await page.goto(baseUrl + pathname, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.next?.router?.isReady === true);
      const alternates = await page.$$eval('link[hreflang]', (items) => items.map((el) => ({ lang: el.hreflang, href: el.href })));
      const expectedKo = '/posts/personalFinance/is-dca-better-in-bear-market';
      const expectedEn = '/en/posts/personalFinance/is-dca-better-in-a-bear-market';
      assert.ok(alternates.some((el) => el.lang === 'ko' && el.href === SITE + expectedKo));
      assert.ok(alternates.some((el) => el.lang === 'en' && el.href === SITE + expectedEn));
      const label = lang === 'ko' ? 'EN' : '한국어';
      await page.evaluate((text) => Array.from(document.querySelectorAll('header button')).find((el) => el.textContent.trim() === text).click(), label);
      await page.waitForFunction((expected) => window.location.pathname === expected, {}, lang === 'ko' ? expectedEn : expectedKo);
      results.push({ path: pathname, existingMappedTranslation: 'PASS' });
    }
    assert.deepEqual(errors, [], 'Browser runtime errors');
    await page.close();
  } finally {
    await browser.close();
  }
  return results;
}

async function main() {
  const content = await checkContent();
  const numbers = checkNumbers();
  const baseArg = process.argv.find((arg) => arg.startsWith('--base-url='));
  const browser = baseArg ? await checkBrowser(baseArg.slice('--base-url='.length).replace(/\/$/, '')) : null;
  const result = { date: DATE, status: 'PASS', content, numbers, browser };
  const report = path.join(ROOT, 'reports', 'finance-posts-2026-10-29-validation.json');
  // 정적 검사만 다시 실행할 때 기존 브라우저 결과를 보존.
  if (!browser && fs.existsSync(report)) {
    const previous = JSON.parse(fs.readFileSync(report, 'utf8'));
    if (previous.browser) result.browser = previous.browser;
  }
  fs.writeFileSync(report, JSON.stringify(result, null, 2) + '\n');
  console.log(`PASS: ${content.length} posts, 12 unique images, ${numbers.investmentCases.length} growth cases, 8 mortgage cases`);
  console.log(browser ? `PASS: ${browser.length} browser routes, language switching, metadata, schemas, images, mobile layout` : 'Browser checks not requested; run with --base-url=http://127.0.0.1:8002');
  console.log(path.relative(ROOT, report));
}

main().catch((error) => { console.error(error.stack); process.exitCode = 1; });
