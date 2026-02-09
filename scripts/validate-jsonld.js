// scripts/validate-jsonld.js
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(['node_modules', 'docs', '.git', '.next', 'out', 'dist', 'build']);

const exts = new Set([
  '.js', '.jsx', '.ts', '.tsx',
  '.md', '.mdx',
  '.html'
]);

function walk(dir, files) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of list) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (!IGNORE_DIRS.has(ent.name)) walk(p, files);
    } else {
      const ext = path.extname(ent.name).toLowerCase();
      if (exts.has(ext)) files.push(p);
    }
  }
  return files;
}

// JSON-LD script extractor
const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

function cleanJsonText(s) {
  // remove HTML comments if someone wrapped JSON with <!-- -->
  return s.replace(/^\s*<!--/, '').replace(/-->\s*$/, '').trim();
}

function main() {
  const files = walk(ROOT, []);
  let found = 0;
  let bad = 0;

  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    let m;
    while ((m = re.exec(content)) !== null) {
      found += 1;
      const raw = cleanJsonText(m[1]);

      try {
        JSON.parse(raw);
      } catch (e) {
        bad += 1;
        const start = Math.max(0, m.index - 80);
        const end = Math.min(content.length, m.index + m[0].length + 80);
        const ctx = content.slice(start, end);

        console.error('\n[JSON-LD PARSE ERROR]');
        console.error('File:', f);
        console.error('Message:', e.message);
        console.error('Context snippet:\n', ctx);
      }
    }
  }

  console.log('\nDone.');
  console.log('JSON-LD blocks found:', found);
  console.log('Invalid JSON-LD blocks:', bad);

  process.exit(bad > 0 ? 1 : 0);
}

main();
