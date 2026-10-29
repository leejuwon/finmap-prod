const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const matter = require('gray-matter');
const { marked } = require('marked');
const cheerio = require('cheerio');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const date = '2026-10-29';
const slugs = ['etf-real-cost-tracking-error-premium', 'monthly-dividend-etf-total-return-trap', 'korea-listed-vs-us-listed-etf-tax-cost'];
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
async function main() {
  const mode = process.argv[2];
  const report = name => path.join(root, `reports/investing-posts-${date}-${name}.json`);
  if (mode === 'baseline') {
    if (fs.existsSync(report('baseline'))) throw Error('Baseline already exists');
    for (const slug of slugs) for (const lang of ['ko', 'en']) if (fs.existsSync(path.join(root, `content/posts/investingInfo/${lang}/${slug}.md`))) throw Error('Slug collision');
    const files = [...walk(path.join(root, 'content/posts')), ...['pages/posts/[category]/[slug].js','_components/Header.js','_components/SeoHead.js','_components/ToolBacklinkKit.js','lib/posts.js','lib/compoundCore.js','lib/dcaCore.js'].map(p => path.join(root,p))];
    const hashes = Object.fromEntries(files.map(f => [path.relative(root,f), crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
    const inventory = files.filter(f => /content[\\/]posts[\\/]investingInfo/.test(f)).map(f => {
      const {data,content} = matter(fs.readFileSync(f,'utf8'));
      return {file:path.relative(root,f),...data,headings:content.split('\n').filter(s=>/^#{2,3} /.test(s)),opening:content.replace(/<script[\s\S]*?<\/script>/g,'').slice(0,2200)};
    });
    fs.writeFileSync(report('baseline'),JSON.stringify({date,hashes,inventory,sitemap:fs.readFileSync(path.join(root,'public/sitemap-0.xml'),'utf8')},null,2)+'\n');
    console.log(`Baseline: ${files.length} protected files, ${inventory.length} investing files`);
  } else if (mode === 'assets') {
    const jobs = JSON.parse(fs.readFileSync(report('images'),'utf8'));
    for (const j of jobs) {
      j.destination = `public/images/posts/${j.slug}/${j.file}`;
      const target=path.join(root,j.destination),width=j.file==='cover.png'?1200:1600,height=j.file==='cover.png'?630:900;
      if (!fs.existsSync(target)) {
        fs.mkdirSync(path.dirname(target),{recursive:true});
        await sharp(j.source).resize(width,height,{fit:'contain',background:'#101827'}).png().toFile(target);
      }
      const m=await sharp(target).metadata();
      if(m.width!==width||m.height!==height||m.format!=='png')throw Error(target);
      Object.assign(j,{width,height,review:'Visual and numerical review; aspect ratio preserved'});
    }
    fs.writeFileSync(report('images'),JSON.stringify(jobs,null,2)+'\n');
    console.log(`Assets: ${jobs.length} PNGs`);
  } else if (mode === 'metadata') {
    const entries=[];
    for(const lang of ['ko','en']) for(const slug of slugs) {
      if(lang==='en'&&slug===slugs[2])continue;
      const file=path.join(root,`content/posts/investingInfo/${lang}/${slug}.md`);
      let raw=fs.readFileSync(file,'utf8').replace(/\n\n<script type="application\/ld\+json">[\s\S]*?<\/script>\s*$/,'\n');
      const {data,content}=matter(raw),$=cheerio.load(marked.parse(content));
      const questions=$('h2').last().nextAll('h3').map((_,h)=>({'@type':'Question',name:$(h).text().trim(),acceptedAnswer:{'@type':'Answer',text:$(h).nextUntil('h3,h2,script').text().replace(/\s+/g,' ').trim()}})).get();
      if(questions.length!==8)throw Error('Expected eight FAQs: '+file);
      raw=raw.trimEnd()+'\n\n<script type="application/ld+json">\n'+JSON.stringify({'@context':'https://schema.org','@type':'FAQPage','@id':'https://www.finmaphub.com'+data.link+'#faq',inLanguage:lang,mainEntity:questions},null,2)+'\n</script>\n';
      fs.writeFileSync(file,raw);
      console.log(`${lang}/${slug}: ${$.root().text().replace(/\s+/g,' ').trim().length} visible chars`);
      entries.push(`### ${slug} (${lang.toUpperCase()})\ntitle: ${JSON.stringify(data.title)}\ndescription: ${JSON.stringify(data.description)}\nurl: ${data.link}`);
    }
    const registry=path.join(root,'docs/blog-contents.md'),raw=fs.readFileSync(registry,'utf8');
    if(!raw.includes('# 2026-10-29 신규 투자정보 포스트'))fs.writeFileSync(registry,raw.trimEnd()+'\n\n# 2026-10-29 신규 투자정보 포스트\n\n'+entries.join('\n\n')+'\n');
  } else throw Error('Use baseline, assets or metadata');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
