const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const matter = require('gray-matter');
const { marked } = require('marked');
const cheerio = require('cheerio');
const sharp = require('sharp');
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.finmaphub.com';
const SLUGS = ['inflation-down-prices-still-high', 'usdkrw-100won-rise-household-cost', 'low-unemployment-hard-to-find-job'];
const compact = (s) => s.replace(/\s+/g, ' ').trim();
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function checkContent() {
  const files = walk(path.join(ROOT, 'content/posts')).filter((f) => f.endsWith('.md'));
  const urls = new Map();
  const titles = new Map();
  const descriptions = new Map();
  for (const file of files) {
    const [category, lang, filename] = path.relative(path.join(ROOT, 'content/posts'), file).split(path.sep);
    const url = `${lang === 'en' ? '/en' : ''}/posts/${category}/${filename.replace(/\.md$/, '')}`;
    assert.ok(!urls.has(url), `Duplicate route ${url}`);
    urls.set(url, file);
    const { data } = matter(fs.readFileSync(file, 'utf8'));
    for (const [map, value] of [[titles, data.seoTitle || data.title], [descriptions, data.seoDescription || data.description]]) {
      if (!map.has(value)) map.set(value, []);
      map.get(value).push(url);
    }
  }
  const registry = fs.readFileSync(path.join(ROOT, 'docs/blog-contents.md'), 'utf8');
  const result = [];
  const external = new Set();
  for (const lang of ['ko', 'en']) for (const slug of SLUGS) {
    const url = `${lang === 'en' ? '/en' : ''}/posts/economicInfo/${slug}`;
    const file = urls.get(url);
    assert.ok(file, `Missing ${url}`);
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const $ = cheerio.load(marked.parse(content));
    for (const k of ['title', 'description', 'tags', 'cover']) assert.ok(data[k]?.length, `Missing ${k}`);
    assert.deepEqual(data.tool, []);
    for (const [key, expected] of Object.entries({ slug, lang, link: url, postCategory: 'economicInfo',
      category: lang === 'ko' ? '경제정보' : 'Economic Info', datePublished: '2026-10-29', dateModified: '2026-10-29' })) assert.equal(data[key], expected);
    assert.equal(titles.get(data.title).length, 1, 'Unique title');
    assert.equal(descriptions.get(data.description).length, 1, 'Unique description');
    assert.ok(registry.includes(`url: ${url}`));
    assert.equal($('h1').length, 0);
    for (const cls of ['hero-grid', 'hero-main', 'hero-kicker', 'hero-card']) assert.equal($('.' + cls).length, 1);
    const heroIndex = content.indexOf('<div class="hero-grid">');
    assert.ok(heroIndex < content.indexOf('\n## '));
    const summaryCount = (content.slice(0, heroIndex).match(/^- /gm) || []).length;
    assert.ok(summaryCount >= 8 && summaryCount <= 10);
    assert.ok($('table').length >= 2 && $('table').length <= 4);
    for (const table of $('table').toArray()) assert.ok($(table).next('p').text().length > 25, 'Interpret every table');
    assert.ok($('table').toArray().some((t) => $(t).find('tbody tr').length === 3 && /시나리오|scenario/i.test($(t).find('thead').text())), 'Three scenarios');
    assert.equal($('h3').toArray().filter((h) => /^(오해|Misconception) [1-5]:/.test($(h).text())).length, 5);
    const checkpoints = $('blockquote').length + $('strong').toArray().filter((el) => /중간 점검|첫 번째 정리|두 번째 정리/.test($(el).text())).length;
    assert.ok(checkpoints >= 2 && checkpoints <= 3, `${url}: checkpoints ${checkpoints}`);
    assert.equal($('figure').length, 3, url);
    const images = [data.cover];
    $('figure').each((i, f) => {
      const img = $(f).find('img');
      assert.equal(img.attr('src'), `/images/posts/${slug}/img${i + 1}.png`);
      assert.ok(img.attr('alt').length > 25);
      assert.ok($(f).find('figcaption').text().length > 25);
      images.push(img.attr('src'));
    });
    assert.equal($('img').length, 3, 'No duplicated cover');
    const imageInfo = [];
    for (const [i, src] of images.entries()) {
      const target = path.join(ROOT, 'public', src.slice(1));
      const meta = await sharp(target).metadata();
      assert.equal(meta.format, 'png');
      assert.equal(meta.width, i === 0 ? 1200 : 1600);
      assert.equal(meta.height, i === 0 ? 630 : 900);
      imageInfo.push({ src, width: meta.width, height: meta.height, bytes: fs.statSync(target).size });
    }
    const internal = $('a[href^="/"]').map((_, e) => $(e).attr('href')).get();
    assert.ok(internal.length >= 4 && internal.length <= 6, `${url}: internal links ${internal.length}`);
    for (const href of internal) {
      assert.equal(href.startsWith('/en/'), lang === 'en', 'Correct link locale');
      if (href.includes('/posts/')) assert.ok(urls.has(href), `Missing ${href}`);
      else assert.ok(fs.existsSync(path.join(ROOT, 'pages', href.replace(/^\/en\//, '/').slice(1) + '.js')));
    }
    const jsonld = $('script[type="application/ld+json"]').map((_, e) => JSON.parse($(e).html())).get();
    assert.equal(jsonld.length, 1);
    assert.equal(jsonld[0]['@type'], 'FAQPage');
    assert.equal(jsonld[0]['@id'], SITE + url + '#faq');
    assert.equal(jsonld[0].inLanguage, lang);
    const faq = $('h2').last().nextAll('h3').map((_, h) => ({ question: $(h).text().trim(),
      answer: compact($(h).nextUntil('h3,h2,script').text()) })).get();
    assert.equal(faq.length, 8);
    assert.deepEqual(jsonld[0].mainEntity.map((q) => ({ question: q.name, answer: compact(q.acceptedAnswer.text) })), faq);
    $('script').remove();
    const visible = compact($.root().text());
    assert.ok(visible.length >= 8000 && visible.length <= 15000, `${url}: length ${visible.length}`);
    const keyword = slug === SLUGS[0] ? /소비자물가|inflation/i : slug === SLUGS[1] ? /원달러|USD\/KRW/ : /실업률|unemployment/i;
    assert.ok(keyword.test(visible.slice(0, 100)), 'Primary topic in first 100 characters');
    assert.ok(!/noindex|^## (Internal Links|Img-row|Hero|Summary Images)/mi.test(content));
    $('a[href^="https://"]').each((_, a) => external.add($(a).attr('href')));
    result.push({ lang, slug, url, title: data.title, visibleCharacters: visible.length, summaryCount,
      tables: $('table').length, faq: faq.length, internalLinks: internal, images: imageInfo });
  }
  const imageHashes = new Set(SLUGS.flatMap((slug) => ['cover', 'img1', 'img2', 'img3'].map((f) => hash(path.join(ROOT, `public/images/posts/${slug}/${f}.png`)))));
  assert.equal(imageHashes.size, 12, 'Twelve distinct generated assets');
  return { posts: result, externalUrls: [...external] };
}

function checkNumbers() {
  const cases = [];
  const check = (label, actual, expected, tolerance = 1e-8) => {
    assert.ok(Math.abs(actual - expected) < tolerance, `${label}: ${actual}`);
    cases.push({ label, actual, expected });
  };
  check('price index after 5% and 2%', 100 * 1.05 * 1.02, 107.1);
  check('deflation from 105', 105 * .98, 102.9);
  check('basket A', .35 * 6 + .15 * 2 + .5, 2.9);
  check('basket B', .15 * 6 + .35 * 2 + .5, 2.1);
  for (const [w, p, shown] of [[3, 2, .98], [3, 5, -1.90], [1, -1, 2.02]]) check('real income ' + w + '/' + p, ((1 + w / 100) / (1 + p / 100) - 1) * 100, shown, .005);
  for (const usd of [100, 2000, 10000]) {
    check(`FX delta for USD${usd}`, usd * 1400 - usd * 1300, usd * 100);
    for (const rate of [1300, 1400]) for (const lang of ['ko', 'en']) {
      const text = fs.readFileSync(path.join(ROOT, `content/posts/economicInfo/${lang}/${SLUGS[1]}.md`), 'utf8');
      assert.ok(text.includes((usd * rate).toLocaleString('en-US')) || text.includes(`${usd * rate / 10000}만원`), `Display conversion ${usd * rate}`);
    }
  }
  check('1300→1400 percent', 100 / 1300 * 100, 7.69, .005);
  check('fee example', 100 * 1400 * 1.012, 141680);
  check('fee example at1410', 100 * 1410 * 1.012, 142692);
  check('remaining travel exposure', (2000 - 1200) * 100, 80000);
  check('oil and FX rise', (88 * 1400 / (80 * 1300) - 1) * 100, 18.46, .005);
  check('oil offset', (72 * 1400 / (80 * 1300) - 1) * 100, -3.08, .005);
  for (const [e, u, outside] of [[570, 30, 400], [380, 20, 600]]) {
    check('labor population total', e + u + outside, 1000);
    check('same unemployment, different employment', u / (e + u) * 100, 5);
  }
  check('employment hiring scenario', 590 / 1000 * 100, 59);
  check('unemployment hiring scenario', 10 / 600 * 100, 1.67, .005);
  check('unemployment exit scenario', 10 / 580 * 100, 1.72, .005);
  check('participation exit scenario', 580 / 1000 * 100, 58);
  check('youth employment falls, aggregate flat', 90 + 480, 570);
  check('youth employment ratio', 90 / 200 * 100, 45);
  return cases;
}

function checkPreservation() {
  const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports/economics-posts-2026-10-29-baseline.json')));
  for (const [file, expected] of Object.entries(baseline.files)) assert.equal(hash(path.join(ROOT, file)), expected, `Protected file changed: ${file}`);
  const locs = (xml) => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  const before = locs(baseline.sitemap);
  const after = locs(fs.readFileSync(path.join(ROOT, 'public/sitemap-0.xml'), 'utf8'));
  assert.equal(new Set(after).size, after.length);
  assert.deepEqual(before.filter((url) => !after.includes(url)), [], 'No old sitemap URL removed');
  const added = after.filter((url) => !before.includes(url));
  assert.equal(added.length, 6);
  for (const lang of ['ko', 'en']) for (const slug of SLUGS) assert.ok(added.includes(`${SITE}${lang === 'en' ? '/en' : ''}/posts/economicInfo/${slug}`));
  for (const [file, expected] of [['sitemap-ko.xml', 118], ['sitemap-en.xml', 105], ['en/sitemap.xml', 105]]) assert.equal(locs(fs.readFileSync(path.join(ROOT, 'public', file), 'utf8')).length, expected);
  return { protectedFiles: Object.keys(baseline.files).length, sitemapBefore: before.length, sitemapAfter: after.length, added };
}

async function checkBrowser(baseUrl, posts) {
  const puppeteer = require('puppeteer-core');
  const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true,
    args: ['--no-sandbox', '--disable-extensions', '--disable-background-networking'] });
  const results = [];
  try {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = new URL(req.url());
      if (url.origin === baseUrl && url.pathname.startsWith('/api/')) req.respond({ status: 200, contentType: 'application/json', body: '{"comments":[],"likes":0,"views":0}' });
      else if (url.origin === baseUrl || url.protocol === 'data:') req.continue();
      else req.abort();
    });
    const ready = async (pathname) => {
      const response = await page.goto(baseUrl + pathname, { waitUntil: 'domcontentloaded' });
      assert.equal(response.status(), 200, pathname);
      await page.waitForFunction(() => window.next?.router?.isReady === true);
    };
    for (const post of posts) {
      await ready(post.url);
      await page.evaluate(() => Promise.all([...document.querySelectorAll('article img')].map((img) => {
        img.loading = 'eager';
        return img.complete ? Promise.resolve() : new Promise((r) => { img.onload = r; img.onerror = r; });
      })));
      const state = await page.evaluate(() => {
        const body = document.querySelector('.fm-post-body');
        const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((el) => JSON.parse(el.textContent));
        return { canonical: document.querySelector('link[rel="canonical"]')?.href,
          alternates: [...document.querySelectorAll('link[hreflang]')].map((el) => ({ lang: el.hreflang, href: el.href })),
          robots: document.querySelector('meta[name="robots"]')?.content || '',
          h1: document.querySelectorAll('article h1').length, hero: body.querySelectorAll('.hero-grid').length,
          figures: body.querySelectorAll('figure').length, text: body.textContent,
          images: [...document.querySelectorAll('article img')].filter((img) => decodeURIComponent(img.currentSrc || img.src).includes('/images/posts/')).map((img) => ({ src: img.currentSrc || img.src, loaded: img.complete && img.naturalWidth > 0 })),
          schemas: ld.map((v) => v['@type']),
          articleSchema: ld.find((v) => v['@type'] === 'BlogPosting'),
          tools: [...document.querySelectorAll('article a[href*="/tools/"]')].map((el) => new URL(el.href).pathname),
        };
      });
      assert.equal(state.canonical, SITE + post.url);
      assert.equal(state.h1, 1); assert.equal(state.hero, 1); assert.equal(state.figures, 3);
      assert.equal(state.images.length, 4); assert.ok(state.images.every((i) => i.loaded));
      assert.deepEqual(state.tools, [], 'Explicit empty tools suppress inferred CTAs');
      assert.ok(!state.robots.includes('noindex'));
      for (const type of ['BlogPosting', 'BreadcrumbList', 'FAQPage']) assert.equal(state.schemas.filter((t) => t === type).length, 1);
      assert.ok(!state.schemas.includes('Article'));
      assert.equal(state.articleSchema.articleSection, post.lang === 'ko' ? '경제정보' : 'Economic Info');
      for (const lang of ['ko', 'en']) assert.ok(state.alternates.some((a) => a.lang === lang && a.href === `${SITE}${lang === 'en' ? '/en' : ''}/posts/economicInfo/${post.slug}`));
      const label = post.lang === 'ko' ? 'EN' : '한국어';
      await page.evaluate((text) => [...document.querySelectorAll('header button')].find((b) => b.textContent.trim() === text).click(), label);
      await page.waitForFunction((expected) => location.pathname === expected, {}, `${post.lang === 'ko' ? '/en' : ''}/posts/economicInfo/${post.slug}`);
      const viewports = [];
      for (const width of [390, 1440]) {
        await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
        await ready(post.url);
        await page.evaluate(() => Promise.all([...document.querySelectorAll('article img')].map((img) => {
          img.loading = 'eager';
          return img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
        })));
        await page.waitForFunction(() => [...document.querySelectorAll('article img')].filter((img) => decodeURIComponent(img.currentSrc || img.src).includes('/cover.png')).every((img) => img.complete && img.naturalWidth > 0));
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow: ${post.url} ${width}`);
        const screenshot = `reports/economics-${post.lang}-${post.slug}-${width}.png`;
        await page.screenshot({ path: path.join(ROOT, screenshot), fullPage: true });
        if ((post.lang === 'ko' && post.slug === SLUGS[0] && width === 1440) ||
            (post.lang === 'en' && post.slug === SLUGS[1] && width === 390)) {
          await page.screenshot({ path: path.join(ROOT, screenshot.replace('.png', '-top.png')), fullPage: false });
        }
        viewports.push({ width, overflow: false, screenshot });
      }
      const { text, articleSchema, ...metadata } = state;
      results.push({ path: post.url, status: 200, ...metadata, languageSwitch: 'PASS', viewports });
    }
    const finance = ['four-account-salary-automation', 'compound-vs-dca-calculator-guide', 'home-price-by-monthly-mortgage-payment'];
    for (const lang of ['ko', 'en']) for (const slug of finance) {
      const pathname = `${lang === 'en' ? '/en' : ''}/posts/personalFinance/${slug}`;
      if (lang === 'en' && slug === finance[2]) {
        assert.equal((await page.goto(baseUrl + pathname, { waitUntil: 'domcontentloaded' })).status(), 404);
        results.push({ path: pathname, regression: 'PASS: remains 404' }); continue;
      }
      await ready(pathname);
      const links = await page.$$eval('article a[href*="/tools/"]', (els) => els.map((e) => new URL(e.href).pathname));
      const expected = slug === finance[0] ? ['goal-simulator'] : slug === finance[1] ? ['compound-interest', 'dca-calculator'] : ['mortgage-loan-calculator', 'home-buying-budget-calculator', 'dsr-ltv-calculator'];
      for (const tool of expected) assert.ok(links.includes(`${lang === 'en' ? '/en' : ''}/tools/${tool}`), `Regression CTA ${tool}`);
      if (slug === finance[2]) {
        const before = page.url();
        await page.evaluate(() => [...document.querySelectorAll('header button')].find((b) => b.textContent.trim() === 'EN').click());
        await page.waitForFunction(() => document.body.textContent.includes('이 글은 영어 버전이 아직 없습니다.'));
        assert.equal(page.url(), before);
      }
      results.push({ path: pathname, regression: 'PASS: prior finance CTA and translation behavior' });
    }
    for (const lang of ['ko', 'en']) for (const slug of ['inflation-basics', 'fx-basics', 'indicator-basics']) {
      const pathname = `${lang === 'en' ? '/en' : ''}/posts/economicInfo/${slug}`;
      await ready(pathname);
      assert.equal(await page.$eval('link[rel="canonical"]', (e) => e.href), SITE + pathname);
      assert.ok(await page.$('article a[href*="/tools/"]'), 'Existing inferred calculator preserved');
      results.push({ path: pathname, regression: 'PASS: existing economics canonical and inferred CTA' });
    }
    const links = [...new Set(posts.flatMap((p) => p.internalLinks))];
    for (const link of links) assert.equal((await fetch(baseUrl + link)).status, 200, `HTTP internal link ${link}`);
    assert.deepEqual(errors, [], 'Browser runtime errors');
    results.push({ internalDestinationsHttp200: links.length, runtimeErrors: errors, apiRequests: 'mocked; no DB writes', externalRequests: 'blocked' });
  } finally { await browser.close(); }
  return results;
}

async function main() {
  const content = await checkContent();
  const numbers = checkNumbers();
  const preservation = checkPreservation();
  const base = process.argv.find((s) => s.startsWith('--base-url='))?.slice(11).replace(/\/$/, '');
  const browser = base ? await checkBrowser(base, content.posts) : null;
  const report = path.join(ROOT, 'reports/economics-posts-2026-10-29-validation.json');
  fs.writeFileSync(report, JSON.stringify({ date: '2026-10-29', status: 'PASS', ...content, numbers, preservation, browser }, null, 2) + '\n');
  console.log(`PASS: ${content.posts.length} posts, 12 distinct PNGs, ${numbers.length} calculations, ${preservation.protectedFiles} protected files, sitemap +6`);
  console.log(browser ? `PASS: ${browser.length - 1} browser routes and internal destinations` : 'Browser not requested');
}
main().catch((error) => { console.error(error.stack); process.exitCode = 1; });
