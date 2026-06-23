# Tool Result CTA Download Hardening Audit

Date: 2026-06-23

## Summary

`ToolResultCta` 중심 CTA 구조는 유지하면서 PDF 다운로드 실패/중복 클릭 상황에서 UI 상태가 안전하게 복구되도록 보강했다.

계산 로직, canonical, hreflang, robots, sitemap 생성 정책, SeoHead 정책은 수정하지 않았다.

## Result PDF Cleanup

각 계산기 페이지의 `handleDownloadPDF`에 `try/finally`와 `useRef` 기반 중복 실행 방지 락을 추가했다.

| File | Hardening |
| --- | --- |
| `pages/tools/compound-interest.js` | `exportLockRef`, `try/finally`, duplicate guard, cleanup always runs |
| `pages/tools/goal-simulator.js` | `exportLockRef`, `try/finally`, duplicate guard, cleanup always runs |
| `pages/tools/fire-calculator.js` | `exportLockRef`, `try/finally`, duplicate guard, cleanup always runs |
| `pages/tools/cagr-calculator.js` | `exportLockRef`, `try/finally`, duplicate guard, cleanup always runs |
| `pages/tools/dca-calculator.js` | `exportLockRef`, `try/finally`, duplicate guard, cleanup always runs |
| `_components/DsrLtvCalculator.js` | `isExporting`, `exportLockRef`, `try/finally`, duplicate guard, cleanup always runs |

Cleanup now always attempts to run after download success or failure:

- Restore previous `details.open` state.
- `document.body.classList.remove("fm-exporting")`.
- `setIsExporting(false)`.
- Clear the ref lock.

When a duplicate result PDF request is blocked, `handleDownloadPDF` returns `false`; `ToolResultCta` does not emit a false success event for that blocked duplicate.

## Lead Magnet Download Lock

`_components/ToolResultCta.js` now uses `leadDownloadLockRef` to block duplicate free-material downloads while a download is already running.

When `leadDownloading=true`:

- Free-material selection buttons are disabled.
- Lead-capture submit button is disabled when `enableLeadCapture=true`.
- Disabled buttons keep mobile-safe dimensions and use `opacity` plus `cursor-not-allowed`.
- Function-level guards also stop direct duplicate calls.

## Events

Maintained:

- `lead_magnet_download_success`
- `lead_magnet_download_error`
- `result_pdf_download_success`
- `result_pdf_download_error`
- Existing CTA events such as `tool_result_cta_view`, `tool_result_cta_click`, and `checklist_cta_click`

Email raw values are still not sent to GA4, localStorage, or CustomEvent payloads.

## Verification

| Command/check | Result |
| --- | --- |
| `node --check _components\ToolResultCta.js` | PASS |
| `node --check _components\DsrLtvCalculator.js` | PASS |
| `rg -n "exportLockRef\|finally\|setIsExporting\(false\)\|return false\|return true" ...` | PASS |
| `rg -n "classList\.remove" ...` | PASS |
| `rg -n "leadDownloadLockRef\|disabled=\{leadDownloading\}\|aria-disabled=\{leadDownloading\}" _components\ToolResultCta.js` | PASS |
| `npm.cmd run build` | PASS |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| Bundle check for lead magnet lock/disabled and success/error events | PASS |

Build and SEO verification regenerated sitemap artifacts through postbuild. Generated sitemap files and `reports/seo-channel-split-url-check.md` were restored after validation because they are outside this task scope.

## Remaining Notes

- Result PDF buttons are still visible through `ToolResultCta`; sticky `CTABar` PDF duplication remains disabled on the updated calculator pages from the previous stabilization pass.
- If a future real lead-capture API is added, keep the current no-email default and enable email capture only through an explicit `enableLeadCapture={true}` path with final privacy copy and server-side safeguards.
