# Lead Magnet MVP Audit

Date: 2026-06-23

## Summary

계산기 결과 화면 공통 CTA 컴포넌트에 무료 체크리스트/PDF 리드 수집 MVP를 추가했다.

이번 MVP는 실제 이메일 발송 API나 서버 저장 API를 만들지 않는다. 사용자가 이메일과 개인정보 수집 문구 placeholder 확인 체크를 입력하면, GA4 이벤트와 브라우저 로컬 이벤트를 발생시키고 클라이언트에서 PDF를 생성해 다운로드한다.

## Implementation

| Area | Detail |
| --- | --- |
| Component | `_components/ToolResultCta.js` |
| Placement | 기존 계산기 결과 이후 공통 CTA 영역 내부 |
| API/server storage | not implemented |
| Local mock behavior | `localStorage.finmapLeadMagnetMvpLast`에 이메일 제외 메타데이터만 저장 |
| Browser event | `finmap_lead_magnet_download` CustomEvent dispatch |
| PDF generation | 기존 `_components/PDFGenerator.js`의 `downloadPDF()` 재사용 |
| Privacy placeholder | 이메일 입력 폼 하단에 개인정보 수집·이용 문구 placeholder 추가 |

## Download Items

| ID | KO label | EN label | Default source tool |
| --- | --- | --- | --- |
| `homeBudget` | 주택구매 예산 체크리스트 | Home purchase budget checklist | `dsrLtv` |
| `salaryBudget` | 월급관리 예산표 | Salary budget sheet | `goal` |
| `dcaPlan` | 적립식 투자 계획표 | DCA investment plan | `compound`, `cagr`, `dca` |
| `retirementChecklist` | 은퇴자금 체크리스트 | Retirement fund checklist | `fire` |

The user can select any of the four files from any calculator result screen.

## Events

| Event | Trigger | Params |
| --- | --- | --- |
| `lead_magnet_cta_click` | Free download CTA opened | `source_tool`, `locale`, `location`, `lead_magnet_id` |
| `lead_magnet_select` | Download item selected | `source_tool`, `locale`, `location`, `lead_magnet_id` |
| `lead_magnet_download_click` | Valid email + placeholder consent submitted | `source_tool`, `locale`, `location`, `lead_magnet_id`, `email_provided`, `storage_mode` |
| `tool_result_cta_click` | Existing shared result CTA tracking | includes `open_lead_magnet` and `download_lead_magnet` actions |

Email addresses are not sent to GA4. The MVP sends only `email_provided: true`.

## Calculator Coverage

The MVP is added through the existing shared `ToolResultCta` component, which is mounted in:

- `/tools/compound-interest`
- `/tools/goal-simulator`
- `/tools/fire-calculator`
- `/tools/cagr-calculator`
- `/tools/dca-calculator`
- `/tools/dsr-ltv-calculator`

No calculation formulas, result objects, canonical, hreflang, sitemap, robots, or SeoHead logic were changed for this MVP.

## Validation

| Command/check | Result |
| --- | --- |
| `rg -n "lead_magnet_cta_click\|lead_magnet_download_click\|finmap_lead_magnet_download" _components\ToolResultCta.js` | PASS |
| `rg -n "ToolResultCta" pages\tools _components\DsrLtvCalculator.js` | PASS: six calculators wired |
| `npm.cmd run build` | PASS |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |
| Bundle check in `.next` for lead magnet events/text | PASS |

Build generated sitemap files through `postbuild`; those generated artifacts were restored because sitemap output is outside this task scope.

## Remaining Work

- Replace the privacy placeholder with a final legal/privacy copy before production lead capture.
- Add a real API endpoint only after deciding storage, retention period, unsubscribe/contact policy, and consent log requirements.
- Add server-side spam/rate limiting before accepting real submissions.
- Optionally replace the MVP PDF templates with designed downloadable assets later.
