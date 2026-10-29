const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { marked } = require('marked');
const cheerio = require('cheerio');
const root = path.resolve(__dirname, '..');
const slugs = ['inflation-down-prices-still-high', 'usdkrw-100won-rise-household-cost', 'low-unemployment-hard-to-find-job'];
const entries = [];
for (const lang of ['ko', 'en']) for (const slug of slugs) {
  const file = path.join(root, 'content/posts/economicInfo', lang, slug + '.md');
  let raw = fs.readFileSync(file, 'utf8');
  raw = raw.replace(/\n\n<script type="application\/ld\+json">[\s\S]*?<\/script>\s*$/, '\n');
  if (!raw.includes('"@type": "FAQPage"')) {
    const { content } = matter(raw);
    const $ = cheerio.load(marked.parse(content));
    const questions = $('h2').last().nextAll('h3').map((_, h) => ({
      '@type': 'Question', name: $(h).text().trim(),
      acceptedAnswer: { '@type': 'Answer', text: $(h).nextUntil('h3,h2,script').text().replace(/\s+/g, ' ').trim() },
    })).get();
    if (questions.length !== 8) throw Error('Expected eight FAQ: ' + file);
    raw = raw.trimEnd() + '\n\n<script type="application/ld+json">\n' + JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      '@id': `https://www.finmaphub.com${lang === 'en' ? '/en' : ''}/posts/economicInfo/${slug}#faq`,
      inLanguage: lang, mainEntity: questions,
    }, null, 2) + '\n</script>\n';
    fs.writeFileSync(file, raw);
  }
  const { data, content } = matter(raw);
  const $ = cheerio.load(marked.parse(content));
  $('script').remove();
  console.log(`${lang}/${slug}: ${$.root().text().replace(/\s+/g, ' ').trim().length} visible chars`);
  entries.push(`### ${slug} (${lang.toUpperCase()})\ntitle: ${JSON.stringify(data.title)}\ndescription: ${JSON.stringify(data.description)}\nurl: ${data.link}`);
}
const registry = path.join(root, 'docs/blog-contents.md');
const original = fs.readFileSync(registry, 'utf8');
if (!original.includes('# 2026-10-29 신규 경제정보 포스트')) {
  fs.writeFileSync(registry, original.trimEnd() + '\n\n# 2026-10-29 신규 경제정보 포스트\n\n' + entries.join('\n\n') + '\n');
}
