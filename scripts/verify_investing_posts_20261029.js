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
const SLUGS = ['etf-real-cost-tracking-error-premium', 'monthly-dividend-etf-total-return-trap', 'korea-listed-vs-us-listed-etf-tax-cost'];
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
    if (lang === 'en' && slug === SLUGS[2]) continue;
    const url = `${lang === 'en' ? '/en' : ''}/posts/investingInfo/${slug}`;
    const file = urls.get(url);
    assert.ok(file, `Missing ${url}`);
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const $ = cheerio.load(marked.parse(content));
    for (const k of ['title', 'description', 'tags', 'cover']) assert.ok(data[k]?.length, `Missing ${k}`);
    assert.deepEqual(data.tool, []);
    for (const [key, expected] of Object.entries({ slug, lang, link: url, postCategory: 'investingInfo',
      category: lang === 'ko' ? '투자정보' : 'Investing Info', datePublished: '2026-10-29', dateModified: '2026-10-29' })) assert.equal(data[key], expected);
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
    assert.equal($('h3').toArray().filter((h) => /^(사례|Case) [12]:/.test($(h).text())).length, 2);
    assert.equal($('.callout').first().find('strong').length, 3);
    assert.ok(content.includes('- [ ]'), 'Execution checklist');
    const core = content.split('class="callout"')[1]?.split('</div>')[0] || '';
    for (const pattern of [/정의:|계산:|Definition:|Calculation:/g,/관측:|Observe:/g,/한계:|Limit:/g]) assert.equal((core.match(pattern)||[]).length,3);
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
    assert.ok(visible.length >= 8000 && visible.length <= (lang === 'ko' ? 15000 : 20000), `${url}: length ${visible.length}`);
    const keyword = slug === SLUGS[0] ? /ETF.*총보수|ETF expense ratio/i : slug === SLUGS[1] ? /월배당 ETF|monthly dividend ETF/i : /국내 상장 미국 ETF/i;
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
  const {distributionPlan,routes}=require('./investing_examples_20261029'), cases=[];
  const check=(label,actual,expected,tolerance=1e-7)=>{
    assert.ok(Math.abs(actual-expected)<tolerance,`${label}: ${actual} != ${expected}`);
    cases.push({label,actual,expected,tolerance});
  };
  const contains=(lang,slug,value)=>{
    const raw=fs.readFileSync(path.join(ROOT,`content/posts/investingInfo/${lang}/${slug}.md`),'utf8');
    assert.ok(raw.includes(value),`Missing display ${lang}/${slug}: ${value}`);
  };
  check('NAV100 price101 premium %',(101/100-1)*100,1);
  check('NAV100 price99 discount %',(99/100-1)*100,-1);
  check('101 to100 purchase loss %',(100/101-1)*100,-.9900990099);
  check('Fund A operating components',.03+.04,.07);
  check('Fund B operating components',.08+.01,.09);
  check('KO headline-only annual saving',1e7*(.0008-.0003),5000);
  check('EN total operating annual saving',1e4*(.0009-.0007),2);
  check('KO headline-only simple payback years',.003/.0005,6);
  check('EN total operating simple payback years',.003/.0002,15);
  for(const [ask,bid,loss] of [[100.03,99.97,6],[100.2,99.8,40],[100.05,99.95,10]]) {
    check('EN 100-share spread loss '+ask,(ask-bid)*100,loss);
    check('KO 100-share spread loss '+ask,(ask*100-bid*100)*100,loss*100);
  }
  check('Stressed spread vs outlay %',40/10020*100,.3992015968);
  check('Ex-distribution value conservation',99+1,100);
  for(const [end,result] of [[100,12],[85,-3],[110,22]]) check('TR with12cash end'+end,(end+12-100)/100*100,result);
  for(const lang of ['ko','en']) {
    const initial=lang==='ko'?3e7:30000,t=lang==='ko'?.154:.2,r=.01*(1-t)*.999;
    for(const years of [1,3,5]) {
      const n=years*12,geometric=((1+r)**n-1)/r;
      const expected={withdrawFund:initial,withdrawCash:initial*.01*(1-t)*n,reinvestFund:initial*(1+r)**n,tax:initial*.01*t*geometric,fees:initial*.01*(1-t)*.001*geometric};
      const loop=distributionPlan(initial,t,years);
      for(const [field,value] of Object.entries(expected)) {
        check(`${lang} ${years}y ${field}: loop vs closed form`,loop[field],value,.00001);
        if(field!=='withdrawFund') contains(lang,SLUGS[1],value.toLocaleString('en-US',{minimumFractionDigits:lang==='en'?2:0,maximumFractionDigits:lang==='en'?2:0}).replace(/\.00$/,''));
      }
    }
  }
  // Independent sequential cash flows compared with the helper's product formula.
  for(const principal of [1e7,1e8]) for(const years of [1,5]) {
    let local=principal-principal*.0005,us=(principal-principal*.001)*.9995;
    for(let y=0;y<years;y++) {local+=local*.08;local-=local*.002;us+=us*.08;us-=us*.001;}
    local-=local*.0005;us-=us*.0005;us-=us*.001;
    const actual=routes(principal,1,years);
    check(`Local flows ${principal}/${years}`,actual.local,local,.00001);
    check(`US flows ${principal}/${years}`,actual.us,us,.00001);
    if(principal===1e7) for(const v of [local,us]) contains('ko',SLUGS[2],Math.round(v).toLocaleString('en-US'));
    if(years===1) {
      const localTax=(local-principal)*.154,usTax=Math.max(us-principal-2500000,0)*.22;
      check('Local illustrative tax '+principal,actual.localTax,localTax,.00001);
      check('US illustrative tax '+principal,actual.usTax,usTax,.00001);
      for(const v of [local-localTax,us-usTax]) contains('ko',SLUGS[2],Math.round(v).toLocaleString('en-US'));
    }
  }
  check('10m domestic illustrative net',routes(1e7).localNet,10649410.1532316,.001);
  check('100m routes net difference',routes(1e8).localNet-routes(1e8).usNet,40535.432,.01);
  check('Monthly300k domestic purchase cost',300000*.0005,150);
  check('Monthly300k US FX and purchase cost',300000*.001+299700*.0005,449.85);
  for(const [fx,expected] of [[1,8],[.9,-2.8],[1.1,18.8]]) check('FX ratio '+fx,(1.08*fx-1)*100,expected);
  return cases;
}

function checkPreservation() {
  const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports/investing-posts-2026-10-29-baseline.json')));
  for (const [file, expected] of Object.entries(baseline.hashes)) assert.equal(hash(path.join(ROOT, file)), expected, `Protected file changed: ${file}`);
  const locs = (xml) => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  const before = locs(baseline.sitemap);
  const after = locs(fs.readFileSync(path.join(ROOT, 'public/sitemap-0.xml'), 'utf8'));
  assert.equal(new Set(after).size, after.length);
  assert.deepEqual(before.filter((url) => !after.includes(url)), [], 'No old sitemap URL removed');
  const added = after.filter((url) => !before.includes(url));
  assert.equal(added.length, 5);
  for (const lang of ['ko', 'en']) for (const slug of SLUGS) {
    const url = `${SITE}${lang === 'en' ? '/en' : ''}/posts/investingInfo/${slug}`;
    if (lang === 'en' && slug === SLUGS[2]) assert.ok(!after.includes(url));
    else assert.ok(added.includes(url));
  }
  assert.ok(!fs.existsSync(path.join(ROOT, `content/posts/investingInfo/en/${SLUGS[2]}.md`)));
  for (const [file, expected] of [['sitemap-ko.xml', 121], ['sitemap-en.xml', 107], ['en/sitemap.xml', 107]]) assert.equal(locs(fs.readFileSync(path.join(ROOT, 'public', file), 'utf8')).length, expected);
  return { protectedFiles: Object.keys(baseline.hashes).length, sitemapBefore: before.length, sitemapAfter: after.length, added };
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
      assert.deepEqual(state.tools, post.slug === SLUGS[0] ? [`${post.lang === 'en' ? '/en' : ''}/tools/cagr-calculator`] : [], 'Only relevant manual CAGR link; inferred CTAs suppressed');
      assert.ok(!state.robots.includes('noindex'));
      for (const type of ['BlogPosting', 'BreadcrumbList', 'FAQPage']) assert.equal(state.schemas.filter((t) => t === type).length, 1);
      assert.ok(!state.schemas.includes('Article'));
      assert.equal(state.articleSchema.articleSection, post.lang === 'ko' ? '투자정보' : 'Investing Info');
      const koOnly = post.slug === SLUGS[2];
      for (const lang of ['ko', 'en']) {
        const expected = `${SITE}${lang === 'en' ? '/en' : ''}/posts/investingInfo/${post.slug}`;
        if (koOnly && lang === 'en') assert.ok(!state.alternates.some(a => a.lang === 'en'));
        else assert.ok(state.alternates.some(a => a.lang === lang && a.href === expected));
      }
      const label = post.lang === 'ko' ? 'EN' : '한국어', before = page.url();
      await page.evaluate(text => [...document.querySelectorAll('header button')].find(b=>b.textContent.trim()===text).click(), label);
      if (koOnly) {
        await page.waitForFunction(() => document.body.textContent.includes('이 글은 영어 버전이 아직 없습니다.'));
        assert.equal(page.url(), before);
        assert.equal((await page.goto(baseUrl + '/en/posts/investingInfo/' + post.slug, {waitUntil:'domcontentloaded'})).status(), 404);
      } else await page.waitForFunction(expected => location.pathname === expected, {}, `${post.lang === 'ko' ? '/en' : ''}/posts/investingInfo/${post.slug}`);
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
        const layout = await page.evaluate(() => {
          const tables = [...document.querySelectorAll('.fm-post-body table')].map(table => {
            const overflowing = table.scrollWidth > table.clientWidth + 2;
            table.scrollLeft = table.scrollWidth;
            const reachable = !overflowing || table.scrollLeft > 0;
            table.scrollLeft = 0;
            return {overflowing, reachable, overflowX:getComputedStyle(table).overflowX};
          });
          const imageRatios = [...document.querySelectorAll('.fm-post-body figure img')].map(img => {
            const rect=img.getBoundingClientRect();
            return rect.width/rect.height;
          });
          return {tables,imageRatios};
        });
        assert.ok(layout.tables.every(t=>t.reachable),'All table columns can be reached');
        assert.ok(layout.imageRatios.every(r=>Math.abs(r-16/9)<.01),'Body images preserve aspect ratio');
        const screenshot = `reports/investing-${post.lang}-${post.slug}-${width}.png`;
        await page.screenshot({ path: path.join(ROOT, screenshot), fullPage: true });
        if ((post.lang === 'ko' && post.slug === SLUGS[0] && width === 1440) ||
            (post.lang === 'en' && post.slug === SLUGS[1] && width === 390)) {
          await page.screenshot({ path: path.join(ROOT, screenshot.replace('.png', '-top.png')), fullPage: false });
        }
        viewports.push({ width, overflow: false, screenshot, ...layout });
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
    for (const lang of ['ko', 'en']) {
      for (const slug of ['why-check-cagr-etf','fx-hedge-vs-fx-exposure-korea-3-conditions']) {
        const pathname = `${lang === 'en' ? '/en' : ''}/posts/investingInfo/${slug}`;
        await ready(pathname);
        assert.equal(await page.$eval('link[rel="canonical"]', e=>e.href), SITE+pathname);
        assert.ok(await page.$('article a[href*="/tools/"]'), 'Existing inferred calculators preserved');
        results.push({path:pathname,regression:'PASS: existing investing inferred CTA'});
      }
      for (const slug of ['inflation-down-prices-still-high','usdkrw-100won-rise-household-cost','low-unemployment-hard-to-find-job']) {
        const pathname = `${lang === 'en' ? '/en' : ''}/posts/economicInfo/${slug}`;
        await ready(pathname);
        assert.equal((await page.$$('article a[href*="/tools/"]')).length,0);
        results.push({path:pathname,regression:'PASS: prior economics tool suppression'});
      }
      const own = lang === 'ko' ? '/posts/personalFinance/is-dca-better-in-bear-market' : '/en/posts/personalFinance/is-dca-better-in-a-bear-market';
      const other = lang === 'ko' ? '/en/posts/personalFinance/is-dca-better-in-a-bear-market' : '/posts/personalFinance/is-dca-better-in-bear-market';
      await ready(own);
      assert.equal(await page.$eval(`link[hreflang="${lang === 'ko' ? 'en' : 'ko'}"]`,e=>e.href),SITE+other);
      await page.evaluate(label=>[...document.querySelectorAll('header button')].find(b=>b.textContent.trim()===label).click(),lang==='ko'?'EN':'한국어');
      await page.waitForFunction(expected=>location.pathname===expected,{},other);
      results.push({path:own,regression:'PASS: different-slug language mapping'});
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
  const report = path.join(ROOT, 'reports/investing-posts-2026-10-29-validation.json');
  fs.writeFileSync(report, JSON.stringify({ date: '2026-10-29', status: 'PASS', ...content, numbers, preservation, browser }, null, 2) + '\n');
  console.log(`PASS: ${content.posts.length} posts, 12 distinct PNGs, ${numbers.length} calculations, ${preservation.protectedFiles} protected files, sitemap +5`);
  console.log(browser ? `PASS: ${browser.length - 1} browser routes and internal destinations` : 'Browser not requested');
}
main().catch((error) => { console.error(error.stack); process.exitCode = 1; });
