#!/usr/bin/env node

const {
  makePlan,
  defaultPlanPath,
  defaultInventoryPath,
  resolveFromCwd,
  relativePath,
  readJson,
  writeJson,
  generateImages,
} = require('./lib/post_image_system');

function printUsage() {
  console.log('Usage: node scripts/generate_post_images.js <markdown-path> [--mode auto|new|replace-existing] [--date YYYYMMDD] [--plan reports/post-image-plan.json] [--out-plan reports/post-image-plan.json]');
}

function parseArgs(argv) {
  const args = { markdownPath: null, planPath: null, outPlan: null, mode: 'auto', dateStamp: null, help: false };
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
    if (token === '--out-plan') {
      args.outPlan = argv[i + 1];
      i += 1;
      continue;
    }
    if (token.startsWith('--out-plan=')) {
      args.outPlan = token.slice('--out-plan='.length);
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

  let plan = args.planPath ? readJson(resolveFromCwd(args.planPath)) : makePlan(args.markdownPath, { mode: args.mode, dateStamp: args.dateStamp });
  if (!args.planPath || args.outPlan) {
    const planPath = args.outPlan ? resolveFromCwd(args.outPlan) : defaultPlanPath(plan);
    const inventoryPath = defaultInventoryPath(plan);
    writeJson(inventoryPath, plan.inventory);
    writeJson(planPath, plan);
    console.log(`Inventory written: ${relativePath(inventoryPath)}`);
    console.log(`Plan written: ${relativePath(planPath)}`);
    plan = readJson(planPath);
  }

  const result = await generateImages(plan);
  console.log(`Mode: ${plan.mode}`);
  console.log(`Generated ${result.imageCount} PNG files in ${result.outputDir}`);
  console.log(`Layout manifest: ${result.layoutManifest}`);
}

run().catch((err) => {
  console.error(`generate_post_images failed: ${err.stack || err.message || err}`);
  process.exit(1);
});
