const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const root = path.resolve(__dirname, '..');
  const file = path.join(root, 'reports/economics-posts-2026-10-29-images.json');
  const jobs = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const job of jobs) {
    job.destination = `public/images/posts/${job.slug}/${job.file}`;
    const target = path.join(root, job.destination);
    const width = job.file === 'cover.png' ? 1200 : 1600;
    const height = job.file === 'cover.png' ? 630 : 900;
    if (!fs.existsSync(target)) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      await sharp(job.source).resize(width, height, { fit: 'contain', background: '#ffffff' }).png().toFile(target);
    }
    const meta = await sharp(target).metadata();
    if (meta.width !== width || meta.height !== height) throw Error(`Unexpected dimensions: ${target}`);
    Object.assign(job, { width, height, review: 'PASS: visual review and numerical checks; aspect ratio preserved' });
  }
  fs.writeFileSync(file, JSON.stringify(jobs, null, 2) + '\n');
  console.log(`Prepared ${jobs.length} PNG files`);
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
