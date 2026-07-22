#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const SITE_URL = "https://www.finmaphub.com";
const DEFAULT_BASE_URL = "http://127.0.0.1:8002";
const DEFAULT_REPORT = path.join("reports", "posts.linkcheck.json");
const DEFAULT_TARGETS = path.join("reports", "search-growth-90d-p0-2b-internal-link-targets.json");
const OUT_JSON = path.join("reports", "search-growth-90d-p0-2b-internal-link-http-check.json");

function arg(name, fallback = null) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((value) => value.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

function normalizePathname(value) {
  const input = String(value || "").trim();
  if (!input) return "";
  try {
    const parsed = new URL(input, SITE_URL);
    if (parsed.origin !== SITE_URL) return "";
    let pathname = parsed.pathname || "/";
    if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
    return pathname;
  } catch {
    let pathname = input.split("#")[0].split("?")[0];
    if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
    return pathname;
  }
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readSitemapLocs() {
  const files = [
    "public/sitemap-0.xml",
    "public/sitemap-ko.xml",
    "public/sitemap-en.xml",
    "public/en/sitemap.xml",
  ];
  const locs = new Set();
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const xml = fs.readFileSync(file, "utf8");
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      locs.add(match[1].trim());
    }
  }
  return locs;
}

async function fetchFollow(url, maxRedirects = 5) {
  let current = url;
  const redirects = [];
  for (let i = 0; i <= maxRedirects; i += 1) {
    const res = await fetch(current, {
      redirect: "manual",
      headers: { "user-agent": "FinMap internal link integrity verifier" },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      const next = new URL(res.headers.get("location"), current).toString();
      redirects.push({ status: res.status, from: current, to: next });
      current = next;
      continue;
    }
    return { res, finalUrl: current, redirects, html: await res.text() };
  }
  throw new Error(`Too many redirects for ${url}`);
}

function collectTargets(manifest) {
  const out = [];
  for (const item of manifest.linkFixTargets || []) {
    const pathValue = normalizePathname(item.afterHref);
    if (pathValue) {
      out.push({
        source: "linkFixTargets",
        type: item.type || "link_fix",
        path: pathValue,
        beforeHref: item.beforeHref || "",
        reason: item.reason || "",
      });
    }
  }
  for (const item of manifest.registryAdditions || []) {
    const pathValue = normalizePathname(item);
    if (pathValue) {
      out.push({
        source: "registryAdditions",
        type: "registry_addition",
        path: pathValue,
        beforeHref: "",
        reason: "Added to docs/blog-contents.md after file, sitemap, and route existence checks.",
      });
    }
  }

  const byPath = new Map();
  for (const item of out) {
    if (!byPath.has(item.path)) byPath.set(item.path, { ...item, sources: [item.source], reasons: [item.reason] });
    else {
      const current = byPath.get(item.path);
      current.sources.push(item.source);
      if (item.reason) current.reasons.push(item.reason);
    }
  }
  return Array.from(byPath.values()).sort((a, b) => a.path.localeCompare(b.path));
}

function inspectHtml(target, html, status, finalUrl, sitemapLocs) {
  const $ = cheerio.load(html);
  const canonical = String($('link[rel="canonical"]').attr("href") || "").trim();
  const robots = String($('meta[name="robots"]').attr("content") || "").trim();
  const h1 = $("h1").first().text().replace(/\s+/g, " ").trim();
  const title = $("title").first().text().replace(/\s+/g, " ").trim();
  const expectedCanonical = `${SITE_URL}${target.path}`;
  const sitemapMembership = sitemapLocs.has(expectedCanonical);
  const checks = [
    { name: "http_200", pass: status === 200, details: String(status) },
    { name: "self_canonical", pass: canonical === expectedCanonical, details: canonical || "(missing)" },
    { name: "no_noindex", pass: !/noindex/i.test(robots), details: robots || "(none)" },
    { name: "sitemap_membership", pass: sitemapMembership, details: expectedCanonical },
    { name: "h1_exists", pass: Boolean(h1), details: h1 || "(missing)" },
    { name: "title_exists", pass: Boolean(title), details: title || "(missing)" },
  ];
  return {
    ...target,
    status,
    finalUrl,
    canonical,
    robots,
    title,
    h1,
    checks,
    pass: checks.every((check) => check.pass),
  };
}

async function main() {
  const baseUrl = String(arg("base-url", DEFAULT_BASE_URL) || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const reportPath = arg("report", DEFAULT_REPORT);
  const targetsPath = arg("targets", DEFAULT_TARGETS);
  const report = readJson(reportPath);
  const manifest = readJson(targetsPath);
  const sitemapLocs = readSitemapLocs();
  const targets = collectTargets(manifest);

  const reportChecks = [
    { name: "broken_zero", pass: Number(report.summary?.brokenCount || 0) === 0, details: String(report.summary?.brokenCount ?? "missing") },
    { name: "suspicious_zero", pass: Number(report.summary?.suspiciousCount || 0) === 0, details: String(report.summary?.suspiciousCount ?? "missing") },
    { name: "self_missing_zero", pass: Number(report.summary?.selfUrlMissingCount || 0) === 0, details: String(report.summary?.selfUrlMissingCount ?? "missing") },
  ];

  for (const check of reportChecks) {
    console.log(`${check.pass ? "PASS" : "FAIL"}\t${check.name}\t${check.details}`);
  }

  const httpResults = [];
  for (const target of targets) {
    try {
      const fetched = await fetchFollow(`${baseUrl}${target.path}`);
      const result = inspectHtml(target, fetched.html, fetched.res.status, fetched.finalUrl, sitemapLocs);
      httpResults.push(result);
      console.log(`${result.pass ? "PASS" : "FAIL"}\t${target.path}\t${result.status}\t${result.canonical || "-"}`);
      for (const check of result.checks.filter((item) => !item.pass)) {
        console.log(`  FAIL\t${check.name}\t${check.details}`);
      }
    } catch (error) {
      const result = {
        ...target,
        status: 0,
        finalUrl: `${baseUrl}${target.path}`,
        checks: [{ name: "fetch", pass: false, details: error.message }],
        pass: false,
        error: error.message,
      };
      httpResults.push(result);
      console.log(`FAIL\t${target.path}\tFETCH\t${error.message}`);
    }
  }

  const output = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    reportPath,
    targetsPath,
    summary: {
      reportChecksPass: reportChecks.every((check) => check.pass),
      targets: targets.length,
      targetPass: httpResults.filter((item) => item.pass).length,
      targetFail: httpResults.filter((item) => !item.pass).length,
    },
    reportChecks,
    httpResults,
  };

  ensureDir(OUT_JSON);
  fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2), "utf8");
  console.log(`Wrote ${OUT_JSON}`);

  if (!output.summary.reportChecksPass || output.summary.targetFail > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
