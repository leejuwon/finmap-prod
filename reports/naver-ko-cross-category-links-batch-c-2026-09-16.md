# FinMap KO Cross-category Links Batch C Verification

Generated: 2026-09-17T05:46:07.515Z

## Final Verdict

PASS_CROSS_CATEGORY_BATCH_C

## Baseline Metric Semantics

- ORIGINAL_STEP4_BASELINE: core->spoke missing 19, spoke->core missing 19. This is the original Step 4 report denominator.
- BATCH_B_RECONCILED_BASELINE: core->spoke 31 -> 5, spoke->core 13 -> 5, parent/child 7 -> 1. This used the execution-time approved-link-plan denominator.
- CURRENT_AFTER_BATCH_B: use the current audit logic and the Batch C pre-edit snapshot for future monitoring. Old reports were not retrofixed.

## Deferred Opportunity Reconciliation

| Total | Apply | Already | Skip | Market Defer | Hub Defer | Review |
| --- | --- | --- | --- | --- | --- | --- |
| 4 | 2 | 2 | 0 | 0 | 0 | 0 |

| Topic | Source | Target | Bridge Role | Anchor | Context | Status |
| --- | --- | --- | --- | --- | --- | --- |
| ASSET_ALLOCATION | investingInfo/modern-6040-risk-budget | economicInfo/gold-geopolitics-real-rates-dollar-uncertainty | portfolio_role_to_gold_macro_drivers | 실질금리·달러·불확실성으로 금을 보는 글 | (선택) 금 대신 원자재를 넣을 때: “헤지”의 성격을 다시 확인하자 | APPLY |
| FX | economicInfo/fx-basics | investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions | fx_concept_to_hedge_decision | 기간·현금흐름 통화·헤지 비용으로 환헤지 여부를 정하는 글 | 8. 투자자가 꼭 기억해야 할 환율 체크리스트 | APPLY |
| REAL_ESTATE_DATA | investingInfo/rates-discount-mortgage-demand-apt-prices | personalFinance/apt-dashboard-home-goal-roadmap | market_rate_real_estate_signal_to_home_goal | 대시보드 숫자를 내 집 마련 목표로 바꾸는 3단계 로드맵 | 함께 보면 좋은 글/도구 | ALREADY_SATISFIED |
| REAL_ESTATE_DATA | investingInfo/seoul-gyeonggi-incheon-risk-budget-framework | personalFinance/apt-dashboard-home-goal-roadmap | regional_risk_signal_to_home_goal | 대시보드 숫자를 내 집 마련 목표로 바꾸는 3단계 로드맵 | 함께 보면 좋은 글/도구 | ALREADY_SATISFIED |

## Applied Cross-category Links

| Topic | Source | Target | Bridge Role | Anchor | Context | Status |
| --- | --- | --- | --- | --- | --- | --- |
| ASSET_ALLOCATION | investingInfo/modern-6040-risk-budget | economicInfo/gold-geopolitics-real-rates-dollar-uncertainty | portfolio_role_to_gold_macro_drivers | 실질금리·달러·불확실성으로 금을 보는 글 | (선택) 금 대신 원자재를 넣을 때: “헤지”의 성격을 다시 확인하자 | APPLY |
| FX | economicInfo/fx-basics | investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions | fx_concept_to_hedge_decision | 기간·현금흐름 통화·헤지 비용으로 환헤지 여부를 정하는 글 | 8. 투자자가 꼭 기억해야 할 환율 체크리스트 | APPLY |

## Modified Posts

| Post | File | dateModified | OK |
| --- | --- | --- | --- |

## Category Direction Summary

| Direction | Applied in Batch C | Before Explicit | After Explicit |
| --- | --- | --- | --- |
| economicInfo -> investingInfo | 1 | 81 | 82 |
| investingInfo -> economicInfo | 1 | 104 | 103 |
| economicInfo -> personalFinance | 0 | 5 | 5 |
| personalFinance -> economicInfo | 0 | 14 | 14 |
| investingInfo -> personalFinance | 0 | 9 | 5 |
| personalFinance -> investingInfo | 0 | 26 | 17 |

## OIL / ENERGY Bridge

| Topic | Source | Target | Bridge Role | Anchor | Context | Status |
| --- | --- | --- | --- | --- | --- | --- |
| OIL_ENERGY | economicInfo/oil-shock-to-usdkrw-korea-transmission | investingInfo/wti-impact-on-korea-kospi | oil_fx_transmission_to_kospi_sector_impact | WTI 유가가 한국 물가·환율·기업이익으로 번지는 경로 | 중간에 퍼즐이 맞춰지는 두 개의 필수 연결 글 | ALREADY_SATISFIED |
| OIL_ENERGY | investingInfo/wti-impact-on-korea-kospi | economicInfo/oil-shock-to-usdkrw-korea-transmission | kospi_oil_impact_to_usdkrw_transmission | 유가 급등이 원/달러에 미치는 영향: 한국식 전파 경로(무역수지·물가·수급)로 읽기 | 5) 전이 경로 3: 달러 결제 구조 → 환율(USD/KRW) → 수급/실적의 ‘2중 효과’ | ALREADY_SATISFIED |
| OIL_ENERGY | economicInfo/hormuz-risk-oil-insurance-freight-premium | investingInfo/wti-impact-on-korea-kospi | chokepoint_transport_risk_to_korea_market_impact | WTI가 한국 경제에 미치는 5단 연결(핵심 요약) | 표 4: 한국 오버레이(유가·운임·환율이 국내로 들어오는 경로) | ALREADY_SATISFIED |
| OIL_ENERGY | economicInfo/war-risk-oil-supply-insurance-shipping | investingInfo/wti-impact-on-korea-kospi | war_risk_supply_chain_to_korea_market_impact | WTI 유가가 한국 물가·환율·기업이익으로 번지는 5단 연결 | 한국 오버레이: 유가 → 수입물가 → 원화/수급으로 번지는 2단 증폭 | ALREADY_SATISFIED |

## FX Bridge

| Topic | Source | Target | Bridge Role | Anchor | Context | Status |
| --- | --- | --- | --- | --- | --- | --- |
| FX | economicInfo/fx-basics | investingInfo/usd-krw-exchange-rate-and-kospi | fx_concept_to_kospi_flow | USD/KRW가 코스피·외국인 수급과 연결되는 구조 | intro | ALREADY_SATISFIED |
| FX | economicInfo/fx-basics | investingInfo/usd-krw-weak-won-sector-map-kospi | fx_concept_to_sector_map | 환율 상승 수혜주와 피해주 정리 | 5. 무역 구조와 한국 환율의 특수성 | ALREADY_SATISFIED |
| FX | economicInfo/fx-basics | investingInfo/fx-hedge-vs-fx-exposure-korea-3-conditions | fx_concept_to_hedge_decision | 기간·현금흐름 통화·헤지 비용으로 환헤지 여부를 정하는 글 | 8. 투자자가 꼭 기억해야 할 환율 체크리스트 | APPLY |

## Interest Rates / TNX / ETF Bridge

| Topic | Source | Target | Bridge Role | Anchor | Context | Status |
| --- | --- | --- | --- | --- | --- | --- |
| INTEREST_RATES_TNX_ETF | economicInfo/interest-rate-basics | investingInfo/tnx-basics | rate_concept_to_tnx_market_reference | TNX 미국 10년물 국채금리: 초보 투자자가 꼭 알아야 할 금리의 기준 | 19. 함께 읽으면 좋은 글 | ALREADY_SATISFIED |
| INTEREST_RATES_TNX_ETF | economicInfo/interest-rate-basics | personalFinance/interest-rate-1p-loan-limit-impact | rate_concept_to_household_loan_limit |  |  | SKIP_NOT_NATURAL |

## Inflation / Personal Finance Bridge

| Topic | Source | Target | Bridge Role | Anchor | Context | Status |
| --- | --- | --- | --- | --- | --- | --- |
| INFLATION_PERSONAL_FINANCE | economicInfo/inflation-basics | personalFinance/inflation-household-survival-strategy | inflation_concept_to_household_cashflow |  |  | DEFER_TO_HUB_BATCH |
| INFLATION_PERSONAL_FINANCE | personalFinance/inflation-household-survival-strategy | economicInfo/inflation-basics | household_cashflow_to_inflation_concept |  |  | DEFER_TO_HUB_BATCH |

## Cross-category Before / After

- Explicit contextual cross-category post links: 239 -> 226
- Topic audit graph explicit contextual post links: 663 -> 665
- Topic audit cross-category weak posts: 27 -> 27

## Skipped / Deferred Candidates

| Topic | Source | Target | Bridge Role | Anchor | Context | Status |
| --- | --- | --- | --- | --- | --- | --- |
| INTEREST_RATES_TNX_ETF | economicInfo/interest-rate-basics | personalFinance/interest-rate-1p-loan-limit-impact | rate_concept_to_household_loan_limit |  |  | SKIP_NOT_NATURAL |
| INFLATION_PERSONAL_FINANCE | economicInfo/inflation-basics | personalFinance/inflation-household-survival-strategy | inflation_concept_to_household_cashflow |  |  | DEFER_TO_HUB_BATCH |
| INFLATION_PERSONAL_FINANCE | personalFinance/inflation-household-survival-strategy | economicInfo/inflation-basics | household_cashflow_to_inflation_concept |  |  | DEFER_TO_HUB_BATCH |

## Step 6A Regression

- verdict: PASS_QUERY_BOUNDARY_BATCH_A
- clear pairs: 7/7
- status: PASS

## Step 6B Regression

- verdict: PASS_TOPIC_LINK_BATCH_B
- applied links: 40
- status: PASS

## Preservation Check

| Check | Value |
| --- | --- |
| brokenInternalPostLinks | 0 |
| selfLinks | 0 |
| duplicateNewContextualLinks | 0 |
| titleChanges | 0 |
| descriptionChanges | 0 |
| h1Changes | 0 |
| h2Changes | 0 |
| h3Changes | 0 |
| faqChanges | 0 |
| tagChanges | 0 |
| canonicalHreflangChanges | 0 |
| schemaStructuralChanges | 0 |
| marketLinkAdditions | 0 |
| toolLinkAdditions | 0 |
| relatedBlockAppliedLinks | 0 |
| exactAnchorStuffing | 0 |
| dateModifiedOk | true |
| step6ABoundaryClear | true |
| step6BRegressionOk | true |
| reviewLimitRows | 0 |
| batchDScopeActive | true |
| batchDScopeVerdict | PASS_TOPIC_HUB_BATCH_D_WITH_HOUSEHOLD_DEFERRED |
| batchDAllowedFileCount | 10 |
| batchEScopeActive | true |
| batchEScopeVerdict | PASS_MARKET_FUNNEL_BATCH_E |
| batchEAllowedFileCount | 21 |
| batchFScopeActive | true |
| batchFScopeVerdict | PASS_100M_QUERY_BOUNDARY_IMPROVED |
| batchFAllowedFileCount | 10 |
| batchGScopeActive | true |
| batchGScopeVerdict | PASS_TECHNICAL_SEO_BATCH_G |
| batchGAllowedFileCount | 69 |

Schema preservation allows dateModified value sync only; JSON-LD structural signatures are compared with dateModified masked.

## Build / Validation

Run externally after content changes:
- node --check scripts/verify_naver_ko_cross_category_links_batch_c.js
- node scripts/verify_naver_ko_cross_category_links_batch_c.js
- node scripts/audit_naver_ko_post_search_inventory.js
- node scripts/audit_naver_ko_post_topic_links.js
- node scripts/verify_naver_ko_query_boundary_batch_a.js
- node scripts/verify_naver_ko_topic_links_batch_b.js
- npm.cmd run build
- git diff --check
- git status --short

## Files Changed

Generated files:
- `reports/naver-ko-cross-category-links-batch-c-2026-09-16.md`
- `reports/naver-ko-cross-category-links-batch-c-2026-09-16.json`
- `reports/naver-ko-cross-category-links-batch-c-preedit-2026-09-16.json`

Modified posts are listed above.

## Important Review Items

- None
