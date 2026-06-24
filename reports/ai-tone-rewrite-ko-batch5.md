# Finmap AI-like Prose Rewrite - KO Batch 5

## Scope

- Date: 2026-06-24
- Rewrite dateModified target: 2026-06-23
- Scope: KO content only
- No changes made to EN content, routing, canonical, hreflang, robots, sitemap policy, or SeoHead.
- No `<ToolCta ... />` tags were added.

## Modified files

| File | Main changes |
|---|---|
| `content/posts/economicInfo/ko/hormuz-risk-oil-insurance-freight-premium.md` | Replaced long one-line conclusion style intro with insurance/freight/inventory/USD-KRW observation table. Converted 10-minute checklist into an observation-order table. Updated description and Article JSON-LD dateModified. |
| `content/posts/economicInfo/ko/eu-russia-gas-phaseout-price-channel.md` | Reframed EU gas phaseout as a price channel: gas price -> power price -> industrial cost -> Eurozone inflation/rates -> Korea import cost/FX/sectors. Added Korea transmission table and reduced checklist/routine labels. Updated description and Article JSON-LD dateModified. |
| `content/posts/personalFinance/ko/personal-finance-3pillars.md` | Replaced 10-sentence summary with a household budget example. Added monthly income allocation table and changed 30-day checklist into payday D+1/D+3/D+7 workflow. Synced Article JSON-LD datePublished/dateModified with frontmatter. |
| `content/posts/personalFinance/ko/fire-sequence-risk-first-5-years.md` | Added 500M KRW retirement asset / 20M KRW annual spending sequence-risk example. Replaced 12-item checklist with if/then execution conditions for spending floor, flexible spending, buffer, and guardrail restoration. Updated Article JSON-LD dateModified. |
| `content/posts/investingInfo/ko/rates-discount-mortgage-demand-apt-prices.md` | Added mortgage payment sensitivity example for 300M KRW loan at 4/5/6%. Replaced separate checklists with execution conditions linked to DSR/LTV calculator. Fixed Article JSON-LD mainEntityOfPage absolute URL and dateModified. |

## Repetition cleanup

| Pattern | Result |
|---|---|
| `여기까지 한 줄 결론` | Removed from target files |
| `요약 (10문장)` / `한 문단 요약` | Removed from target files |
| `체크리스트` | Only remains in `personal-finance-3pillars.md` frontmatter tag; no target body hit |
| `루틴` | Removed from target body hits |
| `핵심은` / `중요합니다` / `도움이 됩니다` | Removed from target body hits |
| `<ToolCta` | Not found in `content/posts` |

## Added concrete elements

- Hormuz: insurance/freight/inventory/USD-KRW observation order and premium-vs-supply-shock decision table.
- EU gas: gas -> electricity -> industrial cost -> inflation/rates -> Korea FX/sector impact channel table.
- Personal finance: 3.2M KRW monthly take-home budget allocation table and payday D+1/D+3/D+7 workflow.
- FIRE: 500M KRW asset, 20M KRW spending, -20% early drawdown withdrawal-rate table.
- Rates/real estate: 300M KRW mortgage monthly payment table at 4%, 5%, and 6%; DSR/LTV calculator link retained as plain link.

## Metadata and structured data

| File | dateModified | Article JSON-LD | FAQ JSON-LD |
|---|---|---|---|
| `hormuz-risk-oil-insurance-freight-premium.md` | `2026-06-23` | description/dateModified synced | visible FAQ 8 / JSON-LD 8, matched |
| `eu-russia-gas-phaseout-price-channel.md` | `2026-06-23` | description/dateModified synced | visible FAQ 8 / JSON-LD 8, matched |
| `personal-finance-3pillars.md` | `2026-06-23` | datePublished/dateModified/description synced | visible FAQ 5 / JSON-LD 5, matched |
| `fire-sequence-risk-first-5-years.md` | `2026-06-23` | dateModified synced | visible FAQ 8 / JSON-LD 8, matched |
| `rates-discount-mortgage-demand-apt-prices.md` | `2026-06-23` | description/dateModified/mainEntityOfPage synced | visible FAQ 8 / JSON-LD 8, matched |

## Tool metadata and links

- `rates-discount-mortgage-demand-apt-prices.md`: kept `tool: ["goal","cagr"]` because the main tool CTA block remains goal/CAGR oriented. DSR/LTV is used as a contextual plain link for mortgage affordability checks; no new tool id was introduced.
- Hormuz and FIRE calculator links remain plain Markdown/HTML links, not raw `<ToolCta>`.

## Validation results

| Command | Result |
|---|---|
| `rg -n "<ToolCta" content/posts` | PASS: no matches |
| `npm.cmd run build` | PASS |
| `rg -n "<toolcta" .next/server/pages` | PASS: no matches |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| `node scripts\verify_post_publish_urls.js --local-server <5 target KO URLs>` | PASS: all 5 returned HTTP 200, self canonical, no noindex, sitemap included, RSS included, hreflang pair present |
| FAQ/JSON-LD parse check | PASS: all 5 target files matched visible FAQ count and JSON-LD question names |
| repeated phrase `rg` check | PASS for target body; only `체크리스트` remains as a frontmatter tag in `personal-finance-3pillars.md` |

## Build artifact handling

- `npm.cmd run build` regenerated sitemap files through postbuild.
- Generated sitemap/report outputs were restored after validation and are not part of the intended change set.

## Remaining notes

- The five content files still keep existing slugs, links, categories, language, canonical role, hreflang role, robots behavior, sitemap policy, and existing internal links.
- No EN files were changed.
