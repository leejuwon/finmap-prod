#!/usr/bin/env node

const {
  makePlan,
  defaultPlanPath,
  defaultInventoryPath,
  resolveFromCwd,
  relativePath,
  writeJson,
} = require('./lib/post_image_system');

function printUsage() {
  console.log('Usage: node scripts/plan_post_images.js <markdown-path> [--mode auto|new|replace-existing] [--date YYYYMMDD] [--out reports/post-image-plan.json] [--inventory-out reports/post-image-inventory-slug.json]');
}

function parseArgs(argv) {
  const args = { markdownPath: null, out: null, inventoryOut: null, mode: 'auto', dateStamp: null };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    if (token === '--out') {
      args.out = argv[i + 1];
      i += 1;
      continue;
    }
    if (token.startsWith('--out=')) {
      args.out = token.slice('--out='.length);
      continue;
    }
    if (token === '--inventory-out') {
      args.inventoryOut = argv[i + 1];
      i += 1;
      continue;
    }
    if (token.startsWith('--inventory-out=')) {
      args.inventoryOut = token.slice('--inventory-out='.length);
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

function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.markdownPath) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }
  const plan = makePlan(args.markdownPath, { mode: args.mode, dateStamp: args.dateStamp });
  const outPath = args.out ? resolveFromCwd(args.out) : defaultPlanPath(plan);
  const inventoryPath = args.inventoryOut ? resolveFromCwd(args.inventoryOut) : defaultInventoryPath(plan);
  writeJson(inventoryPath, plan.inventory);
  writeJson(outPath, plan);
  console.log(`Inventory written: ${relativePath(inventoryPath)}`);
  console.log(`Plan written: ${relativePath(outPath)}`);
  console.log(`Mode: ${plan.mode}`);
  console.log(`Images: ${plan.expectedFiles.join(', ')}`);
  console.log(`Output dir: ${plan.outputDir}`);
}

try {
  run();
} catch (err) {
  console.error(`plan_post_images failed: ${err.message || err}`);
  process.exit(1);
}
