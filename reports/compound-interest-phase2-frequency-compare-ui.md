# 복리 계산기 Phase 2-2B 월복리/연복리 비교 UI 보고서

- 작업일: 2026-07-07 (KST)
- 최종 판정: **PASS - Phase 2-2B 월복리/연복리 비교 UI 배포 가능**

## 1. 작업 목적

기존 기본 결과와 입력 기준은 월복리로 유지하면서, 같은 입력 조건의 보수적 연복리 결과를 결과 화면에서 직접 비교할 수 있도록 연결했다. 입력 폼에 복리 주기 선택 기능은 추가하지 않았다.

## 2. 변경 파일

- `_components/CompoundFrequencyComparePanel.js`: KO/EN 비교 패널과 GA4 view 이벤트 추가
- `pages/tools/compound-interest.js`: 연복리 helper 호출 및 두 결과 분기 배치
- `scripts/verify_compound_frequency_compare.js`: Phase 2-2A helper/fixture 안정성 검증 책임으로 정리하고 새 page baseline 반영
- `scripts/verify_compound_phase2_frequency_ui.js`: Phase 2-2B UI 연결 전용 verifier 추가
- `reports/compound-interest-phase2-frequency-compare-ui.md`: 본 보고서

전역 CSS와 기존 계산 core, 연복리 helper, Quick Comparison, 입력 폼, 상세 요약 컴포넌트는 수정하지 않았다.

## 3. UI 배치

두 런타임 분기 모두 다음 순서를 유지한다.

1. Summary
2. Chart
3. PRO Mobile에서는 Key Insights
4. Quick Comparison
5. Monthly vs Annual Comparison
6. ToolResultCta 및 관련 계산기
7. 기존 상세/고급 분석
8. FAQ

`CompoundResultActions`는 분기별 JSX에 존재하지만 조건부 분기이므로 런타임에는 1개만 렌더된다. 브라우저 검사에서도 1개를 확인했다.

## 4. 계산 기준

### 월복리

화면의 기본 결과는 기존 `calcCompound` 월복리·월말 납입 기준을 그대로 사용한다. URL preset의 `compounding=monthly`와 세금/수수료 toggle의 effective value도 유지한다.

### 연복리 비교

`calcAnnualCompoundForComparison`을 결과가 있을 때만 호출한다. 원금과 이전 연도 말 잔액에 연 1회 순수익률을 적용한 뒤 해당 연도의 월 납입액 12개월분을 연말에 합산하며, 그해 납입분에는 그해 수익률을 적용하지 않는 교육용 보수적 비교다.

입력값은 현재 결과의 원금, 월 적립금, 수익률, 기간, 물가, 통화, base year와 세금/수수료 effective state를 사용한다. 세금/수수료 OFF에서는 0이 전달된다.

## 5. 표시 항목

월복리와 연복리 카드 각각에 다음 항목을 표시한다.

- 세후 최종금액
- 총 납입원금
- 세후 수익
- 현재가치

모바일에서는 두 카드를 세로로 배치하고 `md` 이상에서는 2열로 배치한다. 현재 월복리 결과와 보수적 연복리 비교 badge를 구분했다.

## 6. 차이 계산

- 차이 금액: `monthlyResult.afterTaxFinalAmount - annualResult.afterTaxFinalAmount`
- 차이율: `difference / annualResult.afterTaxFinalAmount * 100`
- 월복리 우위, 연복리 우위, 동일 상태를 각각 처리한다.

기본 fixture 조건의 화면 결과는 월복리가 연복리보다 약 `193.9만원`, 연복리 비교 대비 `3%` 높게 표시됐다.

## 7. GA4 이벤트

새 이벤트: `tool_frequency_compare_view`

파라미터:

- `source_tool: compound`
- `locale`
- `currency`
- `location: result_frequency_compare`
- `comparison_type: monthly_vs_annual`

IntersectionObserver에서 패널이 50% 이상 보일 때 결과 signature별 최초 1회 발송한다. 입력만 변경할 때는 결과 props가 바뀌지 않아 발송되지 않는다. 브라우저에서 최초 노출 1회와 재스크롤 후에도 총 1회임을 확인했다. 실제 GA4 DebugView 수신은 배포 후 확인 대상이다.

## 8. PDF

새 패널은 `pdf-target` 내부에 있으며 export 제외 class를 사용하지 않아 PDF에 포함된다. `CompoundResultActions`와 관련 CTA는 기존 `fm-export-exclude` 및 `data-html2canvas-ignore="true"` 상태를 유지한다.

390px 실제 다운로드 결과:

- 파일: `compound-result.pdf`
- 크기: 774,930 bytes
- Header: `%PDF`
- EOF: `%%EOF`
- export 전후 details 상태 복원: PASS
- export 후 `fm-exporting` 제거: PASS

## 9. 계산 결과 보존

- 기존 기본 월복리: `6,600.2만원` 유지
- 세금/수수료 OFF 월복리: `7,202.2만원` 유지
- 연복리 Sample A: `64,063,196원` 유지
- 연복리 Sample B: `69,410,726원` 유지
- 연복리 A~F fixture 전체: PASS
- `lib/compoundCore.js`, `lib/compound.js`, `lib/compoundFrequencyCompare.js`: hash 유지

## 10. Page Baseline

Phase 2-2B UI 연결로 `pages/tools/compound-interest.js`가 의도적으로 변경되어 page baseline을 새 정상값으로 갱신했다.

- 새 SHA-256: `4e3a59b59d29f9996b9df1e65bd8f77e9244fdf515cf335fe9e6f1c4f8890c75`
- `scripts/verify_compound_frequency_compare.js`에서 page hash 값만 새 기준으로 갱신
- Phase 2-2A의 기존 UI 미연결 검사는 helper가 UI 모듈을 역참조하지 않는 독립성 검사로 전환
- 실제 UI 연결·배치 책임은 신규 Phase 2-2B verifier로 분리
- core hash, fixture 기대값, 계산 기대값 및 SEO/FAQ 검증 조건은 완화하지 않음

## 11. SEO/FAQ

- KO/EN SEO title 변경 없음
- KO/EN SEO description 변경 없음
- canonical, hreflang, sitemap 정책, robots, noindex 변경 없음
- FAQ KO 24개, EN 8개 유지
- FAQPage JSON-LD 1개 유지

## 12. Verifier 및 Build

| 명령 | 결과 |
| --- | --- |
| `node scripts\verify_compound_calculator.js` | PASS, 기존 A~D |
| `node scripts\verify_compound_phase1_seo_faq.js` | PASS |
| `node scripts\verify_compound_phase2_quick_compare.js` | PASS |
| `node scripts\verify_compound_frequency_compare.js` | PASS, 25개 체크 |
| `node scripts\verify_compound_phase2_frequency_ui.js` | PASS, 30개 체크 |
| `npm.cmd run build` | PASS, 214/214 페이지 |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS, main 204 / KO 106 / EN 98 URL |
| `git diff --check` | PASS |

Build 및 SEO 검증이 갱신한 범위 밖 sitemap과 기존 자동 보고서는 원복했다.

## 13. 브라우저 확인

Puppeteer/Chrome production build 검사 결과:

| Viewport | 모드 | 패널 | 순서 | 가로 overflow | GA4 호출 |
| ---: | --- | --- | --- | --- | --- |
| 320px | PRO Mobile | PASS | PASS | 없음 | 1회 |
| 390px | PRO Mobile | PASS | PASS | 없음 | 1회 |
| 768px | Basic/Desktop | PASS | PASS | 없음 | 1회 |
| 1024px | Basic/Desktop | PASS | PASS | 없음 | 1회 |
| 390px EN | PRO Mobile | PASS | PASS | 없음 | 1회 |

KO/EN 제목, 비교 카드 2개, CTA 런타임 1개, PDF target 포함, CTA PDF 제외를 확인했다. 최종 차이율 라벨 적용 후 320px에서도 페이지와 패널 내부 overflow가 없었다.

## 14. 발견 이슈

차단 이슈는 없다. GA4 이벤트 호출과 중복 방지는 로컬에서 검증했으며, 실제 GA4 DebugView 수신은 배포 후 확인이 필요하다. 연복리 비교는 실제 상품 계산이 아닌 보수적 교육용 모델이므로 UI 하단 안내문을 유지해야 한다.

## 15. 배포 가능 여부

**PASS - Phase 2-2B 월복리/연복리 비교 UI 배포 가능**
