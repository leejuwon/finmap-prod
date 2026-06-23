# Finmap ToolResultCta Browser QA

Date: 2026-06-23

## Scope

- `_components/ToolResultCta.js`
- `_components/CTABar.js`
- `_components/PDFGenerator.js`
- Tool pages using `ToolResultCta` and `CTABar`

No calculator formula, ad slot, canonical, hreflang, robots, sitemap, or SeoHead policy was changed.

## Changes Applied

| Area | Result |
| --- | --- |
| CTABar file boundary | PASS. `_components/CTABar.js` contains only the shared sticky CTA component; no page-level calculator code was mixed into the file. |
| PRO navigation guard | Added a defensive `try/catch` around `onNavigate?.(key)` so missing section targets cannot break the sticky CTA. |
| Result PDF duplicate clicks | Added a `resultDownloadLockRef` and `resultPdfDownloading` state. The result PDF button is disabled and shows a loading label while exporting. |
| Lead magnet render timing | Changed from always rendering all four PDF templates to rendering only the selected lead magnet template while a download is being prepared. |
| Lead magnet export position | Removed `left: "-10000px"` and `zIndex: -1`. The template is rendered only during export, positioned outside the visible viewport, and normalized inside the html2canvas clone. |
| Lead magnet duplicate clicks | Kept the `useRef` lock and disabled selection/download controls while `leadDownloading=true`. The form also exposes `aria-busy`. |
| Email privacy | The raw email value is not sent to GA4, localStorage, or CustomEvent payloads. Events only use `email_provided` and `storage_mode`. |
| PDFGenerator cleanup | Wrapped html2canvas work in `try/finally` so scroll position is restored even when PDF rendering fails. |

## Lead Magnet PDF Rendering

Previous risk:

- All four `LeadMagnetPdfTemplate` nodes were always mounted in the DOM.
- The hidden PDF DOM used `left: "-10000px"` and `zIndex: -1`, which can make html2canvas capture unstable in some browsers.

Current behavior:

- `leadPdfRenderId` controls export rendering.
- Only one PDF template is mounted during download preparation.
- `waitForNextPaint()` waits for the export DOM to be committed before calling `downloadPDF`.
- Missing export DOM is treated as a download error.
- `PDFGenerator` uses `onclone` to normalize lead magnet export nodes to `left: 0`, `top: 0`, `zIndex: 0` inside the cloned document only.

## CTABar / CTA Duplication State

| Page group | State |
| --- | --- |
| Compound / CAGR / DCA / FIRE / Goal | Sticky `CTABar` keeps navigation/share behavior and uses `showDownload={false}` so the main result PDF action stays in `ToolResultCta`. |
| DSR/LTV | Uses `ToolResultCta` in the calculator component. No sticky PDF duplication was introduced. |
| Result ad slot | Existing result ad slot positions were not moved. |

## KO / EN Copy Check

| UI | KO | EN |
| --- | --- | --- |
| Result PDF idle | `PDF 저장` | `Save PDF` |
| Result PDF loading | `PDF 저장 중` | `Saving PDF` |
| Lead magnet heading | `무료 체크리스트/PDF 받기` | `Get a free checklist/PDF` |
| Lead magnet no-email mode | 이메일 입력 없이 바로 다운로드 | Download without entering an email |
| Lead magnet loading | `다운로드 준비 중` | `Preparing download` |

`enableLeadCapture=false` remains the default. Email input, consent checkbox, and privacy placeholder copy are only rendered when `enableLeadCapture=true`.

## Mobile Sticky / Safe Area Check

- `CTABar` remains `fixed bottom-0 left-0 right-0 z-50`.
- The inner wrapper keeps `paddingBottom: calc(0.625rem + env(safe-area-inset-bottom))`.
- On tool pages with result CTAs, `showDownload={false}` reduces sticky action density and avoids a second PDF button.
- `ToolResultCta` remains in normal document flow after the result area; no ad slot was repositioned.
- Pages using `CTABar` should continue reserving bottom space with their existing `.fm-safe-bottom` pattern where needed.

## Manual Browser QA Checklist

Run after local build/server start. For each URL:

1. Enter a normal sample input and run the calculator.
2. Confirm the result area appears before `ToolResultCta`.
3. Click `PDF 저장` / `Save PDF`; confirm the button becomes disabled/loading and recovers afterward.
4. Click `결과 URL 복사` / `Copy result URL`; confirm feedback text appears.
5. Open the free file panel.
6. Select each visible lead magnet once; confirm duplicate clicking is blocked during generation.
7. Confirm no email field appears in the default production path.
8. On mobile viewport, confirm the sticky `CTABar`, result ad slot, and `ToolResultCta` do not visually overlap.

| URL | Result CTA | Result PDF | URL copy | Lead magnet | Mobile overlap |
| --- | --- | --- | --- | --- | --- |
| `/tools/compound-interest` | Manual check | Manual check | Manual check | Manual check | Manual check |
| `/en/tools/compound-interest` | Manual check | Manual check | Manual check | Manual check | Manual check |
| `/tools/cagr-calculator` | Manual check | Manual check | Manual check | Manual check | Manual check |
| `/en/tools/cagr-calculator` | Manual check | Manual check | Manual check | Manual check | Manual check |
| `/tools/dca-calculator` | Manual check | Manual check | Manual check | Manual check | Manual check |
| `/en/tools/dca-calculator` | Manual check | Manual check | Manual check | Manual check | Manual check |
| `/tools/fire-calculator` | Manual check | Manual check | Manual check | Manual check | Manual check |
| `/en/tools/fire-calculator` | Manual check | Manual check | Manual check | Manual check | Manual check |
| `/tools/goal-simulator` | Manual check | Manual check | Manual check | Manual check | Manual check |
| `/en/tools/goal-simulator` | Manual check | Manual check | Manual check | Manual check | Manual check |
| `/tools/dsr-ltv-calculator` | Manual check | Manual check | Manual check | Manual check | Manual check |
| `/en/tools/dsr-ltv-calculator` | Manual check | Manual check | Manual check | Manual check | Manual check |

## Verification Results

| Command | Result |
| --- | --- |
| `node --check _components/ToolResultCta.js` | PASS |
| `node --check _components/CTABar.js` | PASS |
| `node --check _components/PDFGenerator.js` | PASS |
| `npm.cmd run build` | PASS. Next.js build completed and postbuild regenerated channel sitemaps. Generated sitemap artifacts were restored after verification. |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS. `sitemap-0.xml` 204 URLs, `sitemap-ko.xml` 106 URLs, `sitemap-en.xml` 98 URLs, `/en/sitemap.xml` 98 URLs, forbidden loc patterns PASS. |
| `rg -n -- 'left: "-10000px"\|zIndex: -1\|enableLeadCapture\|lead_magnet_download_success\|result_pdf_download_success' _components pages` | PASS. No old offscreen/z-index risk pattern remained; expected lead capture/event references remained. |
| `rg -n -- '<toolcta\|left: "-10000px"\|zIndex: -1' .next\server\pages _components pages` | PASS. No raw `<toolcta>` or old offscreen/z-index risk pattern found in built pages/components. |

## Remaining Manual Checks

- Browser download dialogs and actual saved PDF files should still be checked manually in Chrome or Edge because automated download confirmation was not enabled in this pass.
- The default MVP remains no-email download. Do not enable `enableLeadCapture=true` in production until a real privacy, storage, and email delivery path is implemented.
