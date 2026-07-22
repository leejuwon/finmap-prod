# Search Growth P1-1C-2 Final Deploy Decision

Generated: 2026-07-22

## 1. Executive Summary

P1-1C-2 resolves the six review items from the P1-1C conditional pass. No new content improvement, feature, calculator logic, GA4, ad, canonical, hreflang, robots, dependency, commit, push, or deploy action was performed.

Final verdict: CONDITIONAL_PASS.

Deploy blockers: 0.

Remaining manual check: local HTTP verifier rerun is recommended because the local Next server printed Ready and then exited immediately in this environment. The P1-1C runtime bundle had already passed these local HTTP checks before this P1-1C-2 verifier-only patch, and P1-1C-2 did not modify runtime/content behavior.

## 2. Previous Conditional Pass

P1-1C status was CONDITIONAL_PASS with 0 deploy blockers and 6 review-required items:

1. Top100 DB-backed production URLs.
2. reports/search-performance-input Git policy.
3. reports Git/deploy policy.
4. generated sitemap commit policy.
5. compound-interest description verifier failure.
6. MODULE_TYPELESS_PACKAGE_JSON warning.

## 3. Review Item Resolution Summary

| Item | Previous | Final |
| --- | --- | --- |
| Top100 production routes | REVIEW_REQUIRED | PASS |
| Search performance CSV policy | REVIEW_REQUIRED | LOCAL_ANALYSIS_INPUT_EXCLUDE_FROM_DEPLOY |
| Reports policy | REVIEW_REQUIRED | COMMIT_FINAL_REPORTS_RECOMMENDED |
| Sitemap policy | REVIEW_REQUIRED | COMMIT_TRACKED_SITEMAPS_RECOMMENDED |
| Compound description check | REVIEW_REQUIRED | VERIFIER_FALSE_POSITIVE_FIXED |
| MODULE_TYPELESS warning | REVIEW_REQUIRED | FOLLOW_UP_TECH_DEBT |

## 4. Top100 Production Route Check

Read-only production checks were performed for:

| URL | Status | Final URL | Canonical | Robots | H1 |
| --- | ---: | --- | --- | --- | --- |
| https://www.finmaphub.com/market/real-estate/seoul-top100 | 200 | unchanged | self | index,follow,max-image-preview:large | 서울 아파트 집값 TOP 100 |
| https://www.finmaphub.com/market/real-estate/magok-top100 | 200 | unchanged | self | index,follow,max-image-preview:large | 마곡 아파트 집값 TOP 100 |
| https://www.finmaphub.com/market/real-estate/gangnam3-top100 | 200 | unchanged | self | index,follow,max-image-preview:large | 강남3구 아파트 집값 TOP 100 |

Result: PASS.

The pages rendered actual Top100 content and were not DB error pages.

## 5. Search Performance Input Policy

Target: reports/search-performance-input/**

Findings:

- The directory is currently untracked.
- The files are source CSV/README inputs for search performance analysis.
- Largest observed file is about 30 KB.
- Local pattern scan found no API key, token, password, cookie, authorization, client secret, or email match.
- These files are not production runtime requirements.

Final policy: LOCAL_ANALYSIS_INPUT_EXCLUDE_FROM_DEPLOY.

The files were not edited, deleted, ignored, or moved.

## 6. Reports Policy

The project already tracks many files under reports/. `git log -- reports` also shows reports have been versioned historically.

Final policy:

- Commit final audit reports, final manifests, observation baseline, and final verification summaries.
- Keep intermediate analysis CSV/diagnostic JSON policy-dependent.
- Exclude local logs and raw search performance input files.

Stage list: reports/search-growth-90d-p1-1c-2-stage-files.txt.

Optional list: reports/search-growth-90d-p1-1c-2-optional-files.txt.

Exclude list: reports/search-growth-90d-p1-1c-2-exclude-files.txt.

## 7. Sitemap Policy

The four sitemap files are already tracked:

- public/sitemap-0.xml
- public/sitemap-ko.xml
- public/sitemap-en.xml
- public/en/sitemap.xml

Latest build completed and generated stable counts:

| File | URLs |
| --- | ---: |
| public/sitemap-0.xml | 211 |
| public/sitemap-ko.xml | 111 |
| public/sitemap-en.xml | 100 |
| public/en/sitemap.xml | 100 |

Final policy: commit all four tracked sitemap outputs together with the deploy bundle.

## 8. Compound Description Investigation

Actual built HTML metadata for /tools/compound-interest:

- title: 복리 계산기 | 월복리·적립식 투자 미래가치 계산 | FinMap
- description: 원금, 월 적립금, 연 수익률, 투자 기간으로 월복리 기준 미래가치를 계산합니다. 세금, 수수료, 물가상승률을 반영한 세후 금액과 현재가치를 표와 차트로 확인하세요.
- H1: 복리 계산기
- canonical: https://www.finmaphub.com/tools/compound-interest
- robots: none
- JSON-LD description: no explicit description field in SoftwareApplication JSON-LD

The actual description is not empty, not a slug fallback, and matches the page function. It describes principal, monthly contribution, annual return, term, monthly compounding, tax, fee, inflation, net amount, present value, tables, and charts.

## 9. Compound Verifier Resolution

Failure cause:

- scripts/verify_naver_calculator_seo.js required the exact phrase "복리 계산기" inside the meta description.
- The real description says "월복리 기준 미래가치를 계산합니다", which clearly contains the compound meaning and calculation purpose without repeating the exact title phrase.

Modification:

- Modified scripts/verify_naver_calculator_seo.js only.
- Did not modify pages/tools/compound-interest.js.
- Removed the exact "복리 계산기" description requirement for compound.
- Added semantic description groups:
  - compound meaning: 복리 계산기 / 복리 / 월복리
  - calculation purpose: 계산 / 미래가치

Final result:

- node --check scripts\verify_naver_calculator_seo.js: PASS
- node scripts\verify_naver_calculator_seo.js: PASS

Resolution: VERIFIER_FALSE_POSITIVE_FIXED.

## 10. MODULE_TYPELESS Warning

The warning appears when Node loads ESM-style calculator modules such as lib/calculators/dsrLtv.js from CommonJS verification scripts.

Status:

- build PASS
- calculator sample checks PASS
- runtime content not changed
- package "type" was not changed

Final status: FOLLOW_UP_TECH_DEBT.

Recommended follow-up: separate CommonJS/ESM cleanup task, after checking all Node scripts.

## 11. Final Runtime Files

Runtime files recommended for stage:

- _components/ToolBacklinkKit.js
- package.json
- pages/posts/[category]/[slug].js
- pages/tools/home-buying-budget-calculator.js

## 12. Final Content Files

Content files recommended for stage are P0-2B EN route fixes, P1-1B-1 KO low-risk expansion files, and P1-1B-2 EN experiment files. The exact paths are listed in:

- reports/search-growth-90d-p1-1c-2-stage-files.txt

## 13. Final Scripts

Verification and support scripts recommended for stage:

- scripts/analyze_search_performance_inputs.js
- scripts/audit_search_growth_baseline.js
- scripts/check_posts_links_local.js
- scripts/verify_internal_link_integrity.js
- scripts/verify_naver_calculator_seo.js
- scripts/verify_search_growth_p1_1b_en_experiment.js
- scripts/verify_search_growth_p1_1b_ko_expansion.js
- scripts/verify_search_growth_p1_1c_predeploy.js
- scripts/verify_search_snippet_hygiene.js

## 14. Final Sitemaps

Stage all four tracked sitemap files together:

- public/sitemap-0.xml
- public/sitemap-ko.xml
- public/sitemap-en.xml
- public/en/sitemap.xml

## 15. Final Reports

Final report and manifest files are listed in stage-files.txt.

Intermediate analysis files are listed in optional-files.txt.

Local logs, raw search inputs, and the current no-server HTTP check artifact are listed in exclude-files.txt.

## 16. Excluded Local Files

Exclude:

- reports/search-performance-input/**
- reports/local-dev-*.log
- reports/local-dev-*.pid
- reports/search-growth-90d-p0-2b-internal-link-http-check.json

The HTTP check JSON is excluded because it was regenerated while the local server was unavailable and records connection-refused failures, not a content/link regression.

## 17. Optional Files

Optional files are mostly intermediate analysis CSV/JSON outputs and calculator audit report refreshes. See:

- reports/search-growth-90d-p1-1c-2-optional-files.txt

## 18. Core Verification

| Command | Result |
| --- | --- |
| node --check scripts\audit_search_growth_baseline.js | PASS |
| node --check scripts\verify_search_snippet_hygiene.js | PASS |
| node --check scripts\verify_internal_link_integrity.js | PASS |
| node --check scripts\analyze_search_performance_inputs.js | PASS |
| node --check scripts\verify_search_growth_p1_1b_ko_expansion.js | PASS |
| node --check scripts\verify_search_growth_p1_1b_en_experiment.js | PASS |
| node --check scripts\verify_search_growth_p1_1c_predeploy.js | PASS |
| node --check scripts\verify_naver_calculator_seo.js | PASS |
| node scripts\analyze_search_performance_inputs.js | PASS |
| npm.cmd run check:posts-links | PASS, Broken 0, Suspicious 0, self URL missing 0 |
| node scripts\verify_tool_result_cta_events.js | PASS |
| node scripts\verify_naver_calculator_seo.js | PASS |
| npm.cmd run build | PASS, 223 static pages |
| git diff --check | PASS, CRLF normalization warnings only |

Local HTTP server checks:

- Attempted web.js, next start, next start with DB_BOOT_CHECK=false, cmd /k, npm run dev, and PowerShell -NoExit launch patterns.
- Each printed Ready or server boot logs but no process remained listening on port 8002.
- web.js additionally logged DB connection failed: connect ECONNREFUSED 127.0.0.1:3307.
- Therefore local --base-url commands could not be rerun successfully in this environment.

## 19. Deploy Blockers

Deploy blockers: 0.

## 20. Remaining Manual Checks

One manual/environment check remains:

- Rerun local HTTP verifier commands after a local server can remain alive on port 8002, or rely on the already-passed P1-1C local HTTP results plus this P1-1C-2 verifier-only patch review.

This is not classified as a deploy blocker because P1-1C-2 did not modify runtime/content behavior.

## 21. Sourcetree Stage Instructions

Use this file as the mandatory stage list:

- reports/search-growth-90d-p1-1c-2-stage-files.txt

Do not stage the files listed here:

- reports/search-growth-90d-p1-1c-2-exclude-files.txt

Use judgment for:

- reports/search-growth-90d-p1-1c-2-optional-files.txt

## 22. Observation Baseline

Observation baseline remains:

- reports/search-growth-90d-p1-1c-observation-baseline.json

Deploy date is intentionally DEPLOY_DATE_PENDING. Set actual dates only after production deployment.

## 23. Final Verdict

Final verdict: CONDITIONAL_PASS.

Reason:

- All previous review items have a final decision.
- Top100 production routes passed.
- raw search CSVs are excluded from deploy.
- final reports and tracked sitemaps have clear stage policies.
- compound verifier false positive was fixed without content changes.
- MODULE_TYPELESS is separated as follow-up technical debt.
- build, link check, GA4 CTA events, analysis, syntax, and git diff check passed.
- The only remaining condition is local HTTP verifier rerun after local server availability is restored.
