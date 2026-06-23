# Tool Result CTA Conversion Stabilization Audit

Date: 2026-06-23

## Summary

계산기 결과 화면의 중심 CTA를 `ToolResultCta`로 정리하고, 무료 자료 다운로드 MVP를 실제 개인정보 수집 전 단계에 맞게 조정했다.

기본 동작은 `enableLeadCapture={false}`이며, 이메일 입력 없이 무료 PDF 자료를 선택하면 바로 다운로드된다. 이메일 입력, 동의 체크, 개인정보 문구 placeholder는 `enableLeadCapture={true}`를 명시할 때만 렌더링된다.

계산 로직, canonical, hreflang, robots, sitemap 생성 정책, SeoHead 정책은 수정하지 않았다.

## Lead Magnet Behavior

| Mode | Behavior |
| --- | --- |
| `enableLeadCapture=false` | 무료 자료 CTA 클릭 → 자료 선택 → 즉시 PDF 다운로드 |
| `enableLeadCapture=true` | 무료 자료 CTA 클릭 → 자료 선택 → 이메일 입력 → 동의 체크 → PDF 다운로드 |

Email raw values are not sent to GA4 events, localStorage, or CustomEvent payloads.

## Events

Maintained existing events:

- `tool_result_cta_view`
- `tool_result_cta_click`
- `checklist_cta_click`
- `lead_magnet_cta_click`
- `lead_magnet_select`
- `lead_magnet_download_click`

Added stabilization events:

| Event | Trigger |
| --- | --- |
| `lead_magnet_download_success` | Lead magnet PDF generation succeeds |
| `lead_magnet_download_error` | Lead magnet PDF generation fails |
| `result_pdf_download_success` | Result PDF generation succeeds |
| `result_pdf_download_error` | Result PDF generation fails or target area is missing |

## CTA Cleanup

| Calculator | Cleanup |
| --- | --- |
| Compound interest | Removed immediate `CompoundCTA`; wrapped `ToolResultCta` as CTA section; reduced related `ToolCta` cards from 4 to 3; hid sticky CTABar PDF |
| Goal simulator | Removed immediate `CompoundCTA`; wrapped `ToolResultCta` as CTA section; reduced related `ToolCta` cards from 4 to 3; hid sticky CTABar PDF |
| FIRE calculator | Removed immediate `CompoundCTA`; wrapped `ToolResultCta` as CTA section; reduced related `ToolCta` cards from 4 to 3; hid sticky CTABar PDF |
| CAGR calculator | Removed immediate `CompoundCTA`; wrapped `ToolResultCta` as CTA section; reduced related `ToolCta` cards from 4 to 3; hid sticky CTABar PDF |
| DCA calculator | Removed immediate `CompoundCTA`; wrapped `ToolResultCta` as CTA section; reduced related `ToolCta` cards from 4 to 3; hid sticky CTABar PDF |
| DSR/LTV calculator | Kept existing `ToolResultCta` placement after result ad and before sensitivity table |

`CTABar` was not deleted. It now supports `showDownload={false}` so result PDF download is centered on `ToolResultCta`, while sticky share/section navigation can remain.

## Mobile / Ads

- `ToolResultCta` remains in normal document flow, not sticky.
- Existing result ad slots were not moved.
- The CTA block keeps internal spacing with `mt-4`, `pt-4`, and normal card spacing.
- Sticky CTABar no longer duplicates the PDF button on the updated tool pages.

## Verification

| Command/check | Result |
| --- | --- |
| `node --check _components\ToolResultCta.js` | PASS |
| `node --check _components\CTABar.js` | PASS |
| `rg -n "CompoundCTA\|<ToolCta\|<ToolResultCta\|showDownload=\{false\}" pages\tools _components\DsrLtvCalculator.js` | PASS: no result-page `CompoundCTA`; `ToolCta` groups max 3 |
| `rg -n "lead_magnet_download_success\|lead_magnet_download_error\|result_pdf_download_success\|result_pdf_download_error" _components\ToolResultCta.js` | PASS |
| `npm.cmd run build` | PASS |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| Bundle check for lead magnet success/error events and no-email default copy | PASS |

`npm.cmd run build` and SEO verification regenerated sitemap/report artifacts. Generated sitemap files and `reports/seo-channel-split-url-check.md` were restored after validation because they are outside this task scope.

## Notes

- `_components/CompoundCTA.js` itself was not deleted; only immediate result-screen usage was removed from the updated tool pages.
- The MVP still uses client-side PDF generation and local browser events only.
- Real lead capture should remain disabled until final privacy copy, consent logging, storage policy, retention period, and spam/rate limiting are implemented.
