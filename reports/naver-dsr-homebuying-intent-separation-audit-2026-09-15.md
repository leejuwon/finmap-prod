# FinMap Naver DSR-LTV vs Home-Buying Intent Separation Audit - 2026-09-15

## Final Verdict

**INTENT_OVERLAP_HIGH**

`/tools/dsr-ltv-calculator`와 `/tools/home-buying-budget-calculator`는 기술적으로는 별도 URL, 별도 canonical, 별도 title/H1을 갖고 있지만, 실제 visible text와 result UX 기준으로는 검색 의도 분리가 약하다.

핵심 이유:

- 두 페이지가 `_components/DsrLtvCalculator.js`를 같은 visible text로 렌더링한다.
- Home-buying 페이지의 title/description/lead가 `주담대 한도`, `DSR`, `LTV`, `월상환액`을 강하게 포함한다.
- DSR/LTV 페이지도 title/H1/FAQ/본문에서 `아파트 구매 가능액`, `보유 현금`, `부대비용`, `구매 가능 가격`을 강하게 포함한다.
- Home-buying에서 렌더링되는 공유 CTA가 `sourceTool="dsrLtv"`로 고정되어 visible heading이 `DSR/LTV 계산기 결과...` 문맥으로 나온다.
- KO 내부 링크는 DSR/LTV 쪽으로 훨씬 강하게 쏠려 있고, Home-buying 앵커는 적지만 대체로 DSR/LTV와 같은 포스트에서 함께 노출된다.

이번 작업은 **AUDIT ONLY**다. 소스 수정은 하지 않았다.

## 1. Intended Intent

| Page | Ideal primary intent | Current source-level risk |
| --- | --- | --- |
| `/tools/dsr-ltv-calculator` | LTV 계산, DSR 계산, 주택담보대출 한도, 대출 가능액 | `아파트 구매 가능액`, `보유 현금`, `부대비용`, `구매 가능 가격`까지 강하게 포함 |
| `/tools/home-buying-budget-calculator` | 아파트 구매 예산, 보유 현금 기준 구매 가능 가격, 자기자본, 취득비용 포함 총 구매 예산 | shared DSR/LTV calculator 때문에 DSR/LTV, 주담대 한도, 월상환액 의도가 강하게 섞임 |
| `/tools/mortgage-loan-calculator` | 주담대 원리금, 월 상환액, 대출 이자 | control로 적합. 월상환액/원리금 중심이 비교적 선명함 |

## 2. Source Extraction - DSR/LTV

Source:

- `pages/tools/dsr-ltv-calculator.js`
- `_components/DsrLtvCalculator.js`
- `_components/ToolResultCta.js`
- `_components/ToolBacklinkKit.js`
- `_components/SeoHead.js`

| Field | Extracted value |
| --- | --- |
| title | `LTV DSR 계산기 - 주택담보대출 한도와 아파트 구매 가능액 계산` |
| description | `연소득, 기존대출 월상환액, 주택담보대출 금리, 대출기간, 아파트 가격, 보유 현금을 입력해 LTV·DSR 기준 주담대 한도, 대출 가능액, 원리금 월상환액, 아파트 구매 가능액을 계산합니다.` |
| H1 | `LTV DSR 계산기: 주담대 한도와 아파트 구매 가능액 계산` |
| first visible text | `계산 기준일: 2026-05-21`, H1, `주담대 한도, 아파트 구매 가능액, 월상환액, 보유 현금을 한 화면에서 계산합니다... LTV, DSR, 후보 아파트 가격... 매수 가능 여부...` |
| JSON-LD name | `LTV DSR 계산기: 주담대 한도와 아파트 구매 가능액 계산` |
| JSON-LD description | same as page description |
| OG title | same as title, emitted by `SeoHead` |
| OG description | same as description, emitted by `SeoHead` |

H2/H3 and section headings:

| Type | Text | Intent signal |
| --- | --- | --- |
| H2 | `주담대 원리금·DSR·LTV를 함께 보는 이유` | mortgage + DSR/LTV + payment |
| H3 | `1. DSR 기준 월 원리금` | DSR + payment |
| H3 | `2. LTV 기준 대출 한도` | LTV + loan limit |
| H3 | `3. 아파트 구매 가능 금액` | home-buying overlap |
| H2 | `DSR 계산식과 DSR 40% 예시` | DSR primary |
| H2 | `주택담보대출 계산기` | mortgage overlap |
| H2 | `대출 가능액 계산기` | loan capacity primary |
| H2 | `LTV 계산기` | LTV primary |
| H2 | `부동산 대시보드와 함께 쓰기` | real-estate exploration |
| H2 | `DSR 계산기 FAQ` | DSR primary |

Shared calculator labels rendered on DSR/LTV:

| Area | Labels |
| --- | --- |
| input labels | `보유자산`, `연소득`, `후보 주택 가격`, `기존대출 월상환액`, `신규 주담대 금리(연 %)`, `대출기간(년)`, `LTV(%)`, `DSR(%)`, `부대비용률(%)`, `최소 남길 현금` |
| preset headings | `네이버 유입 빠른 프리셋`, `검증 샘플 프리셋` |
| result labels | `최종 구매 가능 가격`, `DSR 기준 대출 가능액`, `신규 월상환 여력`, `최종 가격 기준 월상환액`, `안전 탐색 가격대`, `병목 원인` |
| candidate labels | `후보 집값 판정`, `후보 필요 대출액`, `후보 LTV상 최대 대출액`, `후보 월상환액`, `후보 DSR 사용률`, `후보 필요 현금`, `보유 현금`, `현금 부족/여유` |
| checks | `DSR 조건`, `LTV 조건`, `현금 조건` |
| sensitivity labels | `민감도 분석`, `시나리오`, `DSR 기준 대출 가능액`, `최종 구매 가능 가격`, `최종 가격 기준 월상환액`, `안전 탐색 가격대`, `후보 집값 판정` |

FAQ questions and answer intent:

| Q | Answer intent |
| --- | --- |
| `DSR 계산기는 무엇인가요?` | DSR definition, existing debt + new mortgage payment, loan capacity |
| `DSR 40%는 어떻게 계산하나요?` | income-based repayment capacity |
| `기존 신용대출도 DSR에 포함되나요?` | existing debt inclusion |
| `주담대 원리금 계산기는 무엇을 확인하나요?` | monthly payment and mortgage payment overlap |
| `DSR 계산기와 LTV 계산기는 무엇이 다른가요?` | DSR/LTV contrast plus cash and purchase-price limit |
| `실제 대출 가능액과 계산 결과가 다른 이유는 무엇인가요?` | loan review caveat |
| `LTV와 DSR 값은 자동으로 반영되나요?` | policy input caveat |
| `아파트 담보대출 계산기는 어떤 순서로 봐야 하나요?` | apartment price, cash, LTV, monthly payment |
| `아파트 구매 계산기로도 사용할 수 있나요?` | home-buying overlap, but excludes some costs |
| `안전 탐색 가격대는 무엇인가요?` | purchase-price search range |

CTA and related anchors:

| Location | Anchor/label |
| --- | --- |
| share panel | `이 계산기 공유하기`, `canonical URL 복사` |
| result dashboard CTA | `부동산 대시보드에서 보기` |
| related tools | `주담대 원리금 계산기`, `아파트 구매 계산기` |
| related articles | `DSR 계산기 연봉별 한도표`, `금리 1%p 영향 보기`, `주택담보대출 계산기 체크리스트`, `내 집 마련 목표 로드맵`, `DSR은 통과했는데 집을 못 사는 이유`, `아파트 구매 전 부대비용 확인`, `주택담보대출 가능액 계산기 예산표` |
| ToolResultCta | `DSR/LTV 계산기 결과를 저장하고 다음 계산으로 이어가세요`, `PDF 저장`, `결과 URL 복사`, `체크리스트 보기`, `아파트 구매 계산기`, `무료 자료 받기` |
| ToolCitationBox recommended anchors | `DSR/LTV 계산기`, `주택담보대출 가능액 계산기`, `아파트 구매 가능 금액 계산기`, `대출 한도 계산기` |

DSR/LTV finding:

- Ideal DSR/LTV intent is present and strong.
- But home-buying intent is also very strong because `아파트 구매 가능액`, `보유 현금`, `부대비용`, `후보 집값`, `안전 탐색 가격대` appear in title, H1/lead, result labels, FAQ, and CTAs.

## 3. Source Extraction - Home-buying

Source:

- `pages/tools/home-buying-budget-calculator.js`
- `_components/DsrLtvCalculator.js`
- `_components/ToolResultCta.js`
- `_components/ToolBacklinkKit.js`
- `_components/SeoHead.js`

| Field | Extracted value |
| --- | --- |
| title | `아파트 구매 계산기 - 보유 현금·주담대 한도·DSR LTV 예산 계산` |
| description | `집값, 보유 현금, 연소득, 기존 대출, 금리, 대출기간을 입력해 아파트 구매 가능 여부, 필요 현금, 주담대 한도, DSR, LTV, 월상환액을 계산합니다.` |
| H1 | `아파트 구매 계산기` |
| first visible text | `부동산 구매 예산`, H1, `아파트 가격을 보기 전에 보유 현금, 부대비용, 주담대 한도, DSR, LTV를 한 번에 점검하세요... 월상환액은 주담대 원리금 계산기로 이어서 확인...` |
| JSON-LD name | `아파트 구매 계산기` |
| JSON-LD description | same as page description |
| OG title | same as title, emitted by `SeoHead` |
| OG description | same as description, emitted by `SeoHead` |

H2/H3 and section headings:

| Type | Text | Intent signal |
| --- | --- | --- |
| H2 | `계산 결과를 읽는 순서` | buying workflow |
| H2 | `집값을 보기 전에 확인할 6가지` | buying checklist |
| H2 | `계산 후 함께 볼 페이지` | funnel links |
| shared H2 | `입력값`, `핵심 결과`, `민감도 분석` | identical DSR/LTV calculator UX |
| shared H3 | `네이버 유입 빠른 프리셋`, `왜 이 금액인가`, `후보 집값 판정`, `이 가격대로 실거래를 확인해보세요`, `같이 보면 좋은 자료` | identical DSR/LTV calculator UX |

Home-buying custom flow items:

| Item | Intent signal |
| --- | --- |
| `보유 현금에서 부대비용과 최소 남길 현금을 뺀 뒤 현금 부족/여유를 봅니다.` | cash / costs |
| `DSR/LTV 계산기로 연소득, 기존부채, 후보 집값 기준 대출 가능 한도를 다시 점검합니다.` | DSR/LTV secondary but strong |
| `대출금액이 정해지면 주담대 원리금 계산기로 월상환액과 총이자를 따로 확인합니다.` | mortgage control link |
| `안전 탐색 가격대는 부동산 대시보드에서 거래량과 실거래 가격 분포로 비교합니다.` | market exploration |

Home-buying six checks:

`집값`, `보유 현금`, `연소득`, `기존 대출`, `금리·대출기간`, `DSR·LTV`

CTA and related anchors:

| Location | Anchor/label |
| --- | --- |
| related tools | `LTV/DSR 계산기 열기`, `주담대 원리금 계산하기` |
| related market pages | `서울 집값 순위`, `마곡 집값 순위`, `강남3구 집값 순위` |
| shared ToolResultCta | `DSR/LTV 계산기 결과를 저장하고 다음 계산으로 이어가세요`, `PDF 저장`, `결과 URL 복사`, `체크리스트 보기`, `아파트 구매 계산기`, `무료 자료 받기` |

Home-buying finding:

- H1 is cleanly home-buying.
- But title, description, lead, and shared calculator result labels heavily expose DSR/LTV and mortgage terms.
- The shared ToolResultCta is especially problematic for independence because the Home-buying page visibly says `DSR/LTV 계산기 결과...`.

## 4. Source Extraction - Mortgage Control

Source:

- `pages/tools/mortgage-loan-calculator.js`
- `_components/MortgageLoanCalculator.js`
- `_components/ToolResultCta.js`

| Field | Extracted value |
| --- | --- |
| title | `주담대 원리금 계산기 - 아파트 담보대출 월상환액 계산` |
| description | `대출금액, 금리, 대출기간, 상환방식을 입력해 주택담보대출 원리금 월상환액, 총이자, 총상환액을 계산하고 DSR/LTV 계산기로 대출 가능성을 함께 확인합니다.` |
| H1 | `주담대 원리금 계산기: 아파트 담보대출 월상환액 계산` |
| first visible text | `주담대·월상환액`, H1, `대출금액을 먼저 정해 놓고 월상환액, 총이자, 첫 달과 마지막 달 상환액을 확인하는 계산기입니다...` |
| JSON-LD name | `주담대 원리금 계산기` |
| JSON-LD description | same as page description |
| OG title/description | same as title/description via `SeoHead` |

Calculator labels:

- input: `대출금액`, `연이자율`, `대출기간`, `상환방식`, `거치기간`, `기존 월상환액`, `연소득`
- result: `예상 월상환액`, `총이자`, `총상환액`, `첫 달 상환액`, `마지막 달 상환액`, `금리 +1%p 월상환액 변화`, `DSR 참고값`
- related: `DSR/LTV 계산기로 대출 가능성 확인`, `아파트 구매 계산기로 현금 기준 점검`

Control finding:

- Mortgage page has some DSR/LTV and Home-buying cross-links, but its main UI begins with `대출금액` and returns `월상환액/총이자/상환표`.
- It does not reuse the DSR/LTV affordability calculator.
- This makes it a much cleaner control page.

## 5. Overlap Matrix

Classification key:

- `PRIMARY`: page title/H1/lead/result UX or repeated sections make the concept a main query target.
- `SECONDARY`: concept is clearly present but supports another main task.
- `INCIDENTAL`: mentioned mainly in a cross-link, caveat, or supporting sentence.
- `ABSENT`: not materially present.

| Concept | DSR/LTV page | Home-buying page | Mortgage control |
| --- | --- | --- | --- |
| LTV | PRIMARY | SECONDARY | INCIDENTAL |
| DSR | PRIMARY | SECONDARY | INCIDENTAL |
| 주담대 | PRIMARY | SECONDARY | PRIMARY |
| 대출 한도 | PRIMARY | SECONDARY | INCIDENTAL |
| 대출 가능액 | PRIMARY | SECONDARY | INCIDENTAL |
| 구매 가능액 | PRIMARY | PRIMARY | INCIDENTAL |
| 아파트 구매 | SECONDARY | PRIMARY | INCIDENTAL |
| 구매 예산 | INCIDENTAL | PRIMARY | INCIDENTAL |
| 보유 현금 | SECONDARY | PRIMARY | INCIDENTAL |
| 자기자본 | SECONDARY | SECONDARY | ABSENT |
| 취득비용 / 부대비용 | SECONDARY | SECONDARY | ABSENT |
| 원리금 | SECONDARY | SECONDARY | PRIMARY |
| 월상환액 | SECONDARY | SECONDARY | PRIMARY |

Matrix interpretation:

- DSR/LTV has at least six concepts at `PRIMARY`: LTV, DSR, 주담대, 대출 한도, 대출 가능액, 구매 가능액.
- Home-buying has a clean H1 but still carries DSR/LTV and mortgage terms as `SECONDARY` across title, description, lead, shared input/result labels, and related links.
- Mortgage remains a cleaner control because DSR/LTV and Home-buying are mostly downstream links rather than the core calculator UX.

## 6. Internal Anchor Audit

Method:

- Counted explicit KO Markdown/HTML anchors under `content/posts/**/ko/*.md`.
- Separately reviewed page-level JSX links in `pages/tools`, `_components/MortgageLoanCalculator.js`, `_components/RealEstateSeoLanding.js`, `_components/RealEstateTop100Landing.js`, and `pages/market/real-estate.js`.
- Separately estimated dynamic post-bottom calculator CTA counts using the same inference pattern in `_components/ToolBacklinkKit.js`.

### 6.1 Explicit KO Content Anchors To DSR/LTV

Total explicit KO content anchors: **54**

| Anchor text | Count |
| --- | ---: |
| `DSR/LTV 계산기` | 23 |
| `DSR LTV 계산기로 대출 한도와 주택 가격 범위 점검하기` | 7 |
| `LTV/DSR 계산기 열기` | 5 |
| `주택담보대출 계산기` | 3 |
| `DSR 계산기` | 3 |
| `LTV DSR 계산기` | 2 |
| `LTV DSR 계산기 열기` | 2 |
| `대출 가능액 계산기에서 연봉 5000만원 조건 입력하기` | 1 |
| `주택담보대출 가능액 계산기` | 1 |
| `주택담보대출 가능액 계산기에서 내 주담대 한도 계산하기` | 1 |
| `DSR/LTV 계산기로 갈아타기 후보 집값 판정하기` | 1 |
| `DSR/LTV 계산기로 대출 한도와 주택 가격 범위 점검하기` | 1 |
| `DSR/LTV 계산기로 부대비용률까지 넣어 보기` | 1 |
| `DSR/LTV 계산기로 생애최초 예산 점검하기` | 1 |
| `DSR/LTV 계산기에서 보유현금·연소득·기존부채·LTV를 함께 입력하기` | 1 |
| `DSR/LTV 계산기에서 연소득·기존부채·현금·LTV를 함께 입력하기` | 1 |

Semantic distribution:

- DSR/LTV direct anchors dominate.
- Loan-limit anchors are also strong.
- But several anchors describe `주택 가격 범위`, `보유현금`, `부대비용률`, `생애최초 예산`, `후보 집값 판정`, which are closer to Home-buying.

### 6.2 Explicit KO Content Anchors To Home-buying

Total explicit KO content anchors: **9**

| Anchor text | Count |
| --- | ---: |
| `아파트 구매 가능액 계산하기` | 5 |
| `아파트 구매 계산기` | 2 |
| `아파트 구매 계산기 열기` | 2 |

Semantic distribution:

- Home-buying anchors are conceptually clean.
- But link volume is much lower than DSR/LTV.
- These anchors commonly appear in the same posts that also link to DSR/LTV, so Home-buying is often presented as a sibling or continuation rather than an independent first-choice page.

### 6.3 Explicit KO Content Anchors To Mortgage Control

Total explicit KO content anchors: **5**

| Anchor text | Count |
| --- | ---: |
| `주담대 원리금 계산기` | 3 |
| `대출금액별 월상환액 계산하기` | 1 |
| `대출금액별 월상환액과 총이자 계산하기` | 1 |

Semantic distribution:

- Low volume, but the anchor semantics are cleanly about monthly repayment and interest.
- This matches the control behavior where Mortgage retained stronger ranking stability.

### 6.4 Dynamic Post-bottom Calculator CTA

The blog detail template renders `RelatedCalculatorCtaGrid` from `getPostRelatedToolIds`.

Estimated KO post-bottom dynamic CTA counts:

| Target | Dynamic anchor | Estimated count |
| --- | --- | ---: |
| DSR/LTV | `DSR/LTV 계산기` | 19 |
| Home-buying | `아파트 구매 계산기` | 11 |
| Mortgage | `주담대 원리금 계산기` | 11 |

Important note:

- The inference pattern prioritizes `mortgageLoan -> dsrLtv -> homeBuying` when mortgage terms are present.
- It prioritizes `homeBuying -> dsrLtv` when home-buying terms are present.
- That means DSR/LTV frequently co-occurs as a related calculator even on home-buying or mortgage-like posts.

### 6.5 Page-level JSX Anchors

| Source | Target | KO anchor |
| --- | --- | --- |
| `pages/tools/index.js` | DSR/LTV | `DSR LTV 계산기` |
| `pages/tools/index.js` | Mortgage | `주담대 원리금 계산기` |
| `pages/tools/index.js` | Home-buying | `아파트 구매 계산기` |
| DSR/LTV page related section | Mortgage | `주담대 원리금 계산기` |
| DSR/LTV page related section | Home-buying | `아파트 구매 계산기` |
| Home-buying page related section | DSR/LTV | `LTV/DSR 계산기 열기` |
| Home-buying page related section | Mortgage | `주담대 원리금 계산하기` |
| Mortgage result related section | DSR/LTV | `DSR/LTV 계산기로 대출 가능성 확인` |
| Mortgage result related section | Home-buying | `아파트 구매 계산기로 현금 기준 점검` |
| Mortgage ToolResultCta | DSR/LTV | `DSR/LTV 계산기` |
| DSR/LTV shared ToolResultCta | Home-buying | `아파트 구매 계산기` |
| Home-buying shared ToolResultCta | Home-buying self-link | `아파트 구매 계산기` |
| Real-estate dashboard | DSR/LTV | `DSR/LTV 계산기 열기` |
| Real-estate Top100 CTA | DSR/LTV | `내 구매 가능액 계산하기` |
| Real-estate SEO landing cards | DSR/LTV | `DSR LTV 계산기` |

Anchor audit conclusion:

- DSR/LTV has stronger inbound volume and broader semantic coverage.
- Home-buying has cleaner explicit anchors but weaker volume and strong co-occurrence with DSR/LTV.
- The anchor graph reinforces DSR/LTV as the broader hub for both loan capacity and apartment affordability.

## 7. Shared Component Audit

Both pages render `_components/DsrLtvCalculator.js`.

| Shared text area | DSR/LTV page | Home-buying page | Independence impact |
| --- | --- | --- | --- |
| input section heading | `입력값` | same | identical |
| input explanation | `금액은 만원 단위로 입력합니다. LTV/DSR은 정책 자동 반영 없이 직접 입력한 값만 사용합니다.` | same | high overlap |
| quick preset heading | `네이버 유입 빠른 프리셋` | same | high overlap |
| quick preset explanation | `연봉, 집값, 보유 현금 조건을 한 번에 넣고 주담대 한도와 아파트 구매 가능액을 바로 확인합니다.` | same | directly blends both intents |
| input labels | `보유자산`, `연소득`, `후보 주택 가격`, `기존대출 월상환액`, `신규 주담대 금리`, `LTV`, `DSR`, `부대비용률`, `최소 남길 현금` | same | high overlap |
| result heading | `핵심 결과` | same | identical |
| result labels | `최종 구매 가능 가격`, `DSR 기준 대출 가능액`, `신규 월상환 여력`, `최종 가격 기준 월상환액`, `안전 탐색 가격대`, `병목 원인` | same | high overlap |
| candidate heading | `후보 집값 판정` | same | high overlap |
| check labels | `DSR 조건`, `LTV 조건`, `현금 조건` | same | high overlap |
| dashboard CTA | `이 가격대로 실거래를 확인해보세요`, `부동산 대시보드에서 보기` | same | high overlap |
| related reading | `DSR 40% 소득별 한도표`, `금리 1%p 상승 시 대출한도 영향`, `주담대 리스크 체크리스트`, `대시보드로 내 예산대 아파트 찾는 방법`, `현금 1억·2억·3억 아파트 예산표` | same | high overlap |
| sensitivity section | `민감도 분석` and same table columns | same | high overlap |
| disclaimer | DSR/LTV input caveat | same | high overlap |

Props differ:

| Prop | DSR/LTV page | Home-buying page |
| --- | --- | --- |
| `initialPresetKey` | region query mapping or empty | `first_home_600m` |
| `calculateEventName` | default `dsr_ltv_calculate` | `home_buying_calculate` |
| `calculateSourceTool` | default `dsr_ltv` | `homeBuying` |
| `commonSourceTool` | default `dsrLtv` | `homeBuying` |
| `presetSourceTool` | default `dsrLtv` | default `dsrLtv` |
| ToolResultCta `sourceTool` | hard-coded `dsrLtv` | hard-coded `dsrLtv` |

Shared component conclusion:

- Analytics source differs partially.
- Visible UX does not meaningfully differ.
- Home-buying inherits DSR/LTV result semantics almost completely.
- The hard-coded ToolResultCta source is the clearest visible mismatch: Home-buying can display `DSR/LTV 계산기 결과...`.

## 8. Independence Score

| Dimension | DSR/LTV | Home-buying | Reason |
| --- | --- | --- | --- |
| A. Search intent independence | MEDIUM | LOW | DSR/LTV has strong own intent but also targets purchase affordability. Home-buying title/H1 is clean, but description/lead/shared UI strongly expose DSR/LTV and mortgage terms. |
| B. Visible content independence | MEDIUM | LOW | DSR/LTV has unique DSR sections and FAQ. Home-buying has short custom sections but the large shared calculator dominates visible content. |
| C. Result UX independence | LOW | LOW | Both pages show the same result cards, same candidate check, same sensitivity table, same dashboard CTA, same disclaimer. |
| D. Internal anchor independence | MEDIUM | LOW-MEDIUM | DSR/LTV receives many direct DSR/LTV anchors but also home-buying-like anchors. Home-buying anchors are clean but much fewer and commonly paired with DSR/LTV. |

Pair-level judgment:

| Dimension | Pair-level score |
| --- | --- |
| Search intent separation | LOW-MEDIUM |
| Visible content separation | LOW |
| Result UX separation | LOW |
| Anchor graph separation | LOW-MEDIUM |

## 9. Candidate Separation Plan

No modifications were made. This is only a candidate plan.

### DSR/LTV

Concepts to keep:

- LTV 계산
- DSR 계산
- 주택담보대출 한도
- 대출 가능액
- DSR 기준 월 원리금 여력
- LTV 기준 최대 대출액
- 기존부채 반영
- 정책값 직접 입력 caveat

Concepts to reduce:

- `아파트 구매 가능액` as a headline-level promise
- `보유 현금` as the central framing
- `부대비용/취득비용` as a main section
- `아파트 구매 예산` as a broad page identity
- `내 집 마련 목표` style journey language

Concepts to move toward Home-buying:

- 보유 현금 기준 구매 가능 가격
- 취득세/중개보수/등기비/이사비 등 부대비용
- 최소 남길 현금 / 비상금
- 자기자본
- 총 구매 예산
- 후보 가격대와 실제 매수 가능성

### Home-buying

Concepts to keep:

- 아파트 구매 예산
- 보유 현금 기준 구매 가능 가격
- 필요 현금
- 현금 부족/여유
- 부대비용 포함 판단
- 실거래 가격대 비교

Concepts to strengthen:

- 자기자본
- 취득비용 포함 총예산
- 보유 현금으로 볼 수 있는 집값
- 계약 전 필요 현금
- 잔금 후 남길 현금
- 매수 가능 가격대

Concepts to reduce:

- DSR/LTV as headline-level concepts
- 주담대 한도 as a primary promise
- 월상환액 as a primary promise
- DSR/LTV calculator result wording
- DSR/LTV shared result UX labels where Home-buying-specific labels would be clearer

### Mortgage

Mortgage should remain unchanged as the control page.

Keep:

- 주담대 원리금
- 월상환액
- 총이자
- 총상환액
- 상환방식
- 상환표

Avoid:

- Turning Mortgage into affordability or home-buying budget.

## 10. Hypothesis Evaluation

Hypothesis:

- DSR/LTV: `LTV/DSR 및 대출규제 기준으로 주담대 한도를 계산`
- Home-buying: `내 현금과 구매 부대비용까지 반영해 살 수 있는 아파트 가격을 계산`

Evaluation: **strongly supported.**

Why this separation would be clearer:

- DSR/LTV becomes a loan-regulation and borrowing-capacity page.
- Home-buying becomes a cash, cost, and total-budget page.
- Mortgage remains a payment and interest page.
- The three pages would map to three user questions:
  - `얼마까지 빌릴 수 있나?` -> DSR/LTV
  - `내 현금으로 얼마짜리 집을 살 수 있나?` -> Home-buying
  - `이 대출이면 매달 얼마를 내나?` -> Mortgage

Current blocker:

- The Home-buying page currently answers all three questions through the shared DSR/LTV component.
- The DSR/LTV page also answers the home-buying question in title/H1/result/FAQ.

Expected SEO effect if separated carefully:

- Better query-to-page matching for `ltv 계산기`, `dsr 계산기`, `주택담보대출 한도`, `대출 가능액`.
- Better query-to-page matching for `아파트 구매 예산`, `보유 현금 집값`, `필요 현금`, `취득비용 포함 구매 가능 가격`.
- Less internal competition on `아파트 구매 가능액`, `주담대 계산기`, `대출 가능액 계산기`.

Risk:

- If changed too broadly, existing DSR/LTV rankings can be disturbed.
- The safer path is a small A/B-style intent separation experiment after Naver query-URL data confirms which queries shifted.

## 11. Audit-only Modification Policy

No changes were made to:

- title
- H1
- description
- FAQ
- internal links
- components
- JSON-LD
- sitemap
- robots
- routing

Created only this report:

- `reports/naver-dsr-homebuying-intent-separation-audit-2026-09-15.md`

## 12. Commands Run

Key commands:

```powershell
git status --short
Get-Content -Encoding UTF8 -Path pages\tools\dsr-ltv-calculator.js
Get-Content -Encoding UTF8 -Path pages\tools\home-buying-budget-calculator.js
Get-Content -Encoding UTF8 -Path pages\tools\mortgage-loan-calculator.js
Get-Content -Encoding UTF8 -Path _components\DsrLtvCalculator.js
Get-Content -Encoding UTF8 -Path _components\MortgageLoanCalculator.js
Get-Content -Encoding UTF8 -Path _components\ToolResultCta.js
Get-Content -Encoding UTF8 -Path _components\ToolBacklinkKit.js
Get-Content -Encoding UTF8 -Path _components\SeoHead.js
rg -n "/tools/dsr-ltv-calculator|/tools/home-buying-budget-calculator|/tools/mortgage-loan-calculator" content pages _components --glob "*.js" --glob "*.md"
```

Anchor extraction:

- KO content Markdown/HTML anchors were counted with a temporary in-memory Node script.
- Dynamic post-bottom CTA counts were estimated by mirroring the inference rules in `_components/ToolBacklinkKit.js`.

Non-impacting command notes:

- One initial `node -e` anchor extraction attempt failed due PowerShell argument quoting. It was rerun via base64-encoded in-memory script.
- One `rg` attempt failed due shell quote escaping. It was rerun with a simpler literal URL pattern.

## 13. Recommended Next Action

Do not immediately rewrite both pages.

Recommended next step:

1. Export Naver Search Advisor query-URL data for the affected period.
2. Identify whether `아파트 구매 가능액`, `대출 가능액`, `LTV 계산기`, `DSR 계산기`, `주담대 계산기`, `아파트 구매 예산` queries are switching between the two URLs.
3. If confirmed, run a small controlled separation:
   - DSR/LTV: narrow visible promise toward `LTV/DSR 기준 주담대 한도`.
   - Home-buying: strengthen `보유 현금 + 부대비용 + 자기자본 + 총 구매 예산`.
   - Shared component: introduce Home-buying-specific visible labels/CTA only where necessary.
   - Mortgage: leave unchanged.

The safest candidate fix is not a title-only rewrite. It is **visible result UX and CTA wording separation**, because the current largest overlap comes from the shared calculator body rather than the H1 alone.
