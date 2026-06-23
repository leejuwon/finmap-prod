#!/usr/bin/env node

const {
  makePlan,
  resolveFromCwd,
  readJson,
  validateImages,
} = require('./lib/post_image_system');

function printUsage() {
  console.log('Usage: node scripts/validate_generated_images.js <markdown-path> [--mode auto|new|replace-existing] [--date YYYYMMDD] [--plan reports/post-image-plan.json]');
}

function parseArgs(argv) {
  const args = { markdownPath: null, planPath: null, mode: 'auto', dateStamp: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    if (token === '--plan') {
      args.planPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (token.startsWith('--plan=')) {
      args.planPath = token.slice('--plan='.length);
      continue;
    }
    if (token === '--mode') {
      args.mode = argv[i + 1];
      i += 1;
      continue;
    }
    if (token.startsWith('--mode=')) {
      args.mode = token.slice('--mode='.length);
      continue;
    }
    if (token === '--date') {
      args.dateStamp = argv[i + 1];
      i += 1;
      continue;
    }
    if (token.startsWith('--date=')) {
      args.dateStamp = token.slice('--date='.length);
      continue;
    }
    if (!args.markdownPath) {
      args.markdownPath = token;
      continue;
    }
    throw new Error(`Unknown argument: ${token}`);
  }
  return args;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.markdownPath) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }
  const plan = args.planPath ? readJson(resolveFromCwd(args.planPath)) : makePlan(args.markdownPath, { mode: args.mode, dateStamp: args.dateStamp });
  const { report, reportPath } = await validateImages(plan);
  console.log(`Validation report: ${reportPath}`);
  console.log(`Status: ${report.status}`);
  if (report.errors.length) {
    for (const error of report.errors) console.error(`- ${error}`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(`validate_generated_images failed: ${err.stack || err.message || err}`);
  process.exit(1);
});
