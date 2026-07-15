# Home Buying Calculator Tool Hub Audit

## Summary

- Date: 2026-07-15
- Target tool: `/tools/home-buying-budget-calculator`
- Goal: 금융도구 허브와 관련 계산기 이동 경로에 아파트 구매 계산기 노출
- Final verdict: PASS - 아파트 구매 계산기 도구 허브 등록 완료

## Changed Files

- `pages/tools/index.js`
- `_components/ToolBacklinkKit.js`
- `_components/ToolResultCta.js`
- `scripts/check_posts_links_local.js`

## Tool Hub Registration

`pages/tools/index.js`의 `TOOLS` 배열에 신규 카드를 추가했다.

| Item | Value |
| --- | --- |
| Position | DSR/LTV 계산기 바로 뒤, FIRE 계산기 앞 |
| URL | `/tools/home-buying-budget-calculator` |
| KO title | `아파트 구매 계산기` |
| EN title | `Home Buying Budget Calculator` |
| KO badge | `부동산·주담대` |
| EN badge | `Real Estate` |
| KO description | `집값, 보유 현금, 연소득, 금리, 대출기간을 입력해 아파트 구매 가능액과 월상환액, 필요 현금을 계산합니다.` |
| EN description | `Estimate apartment affordability, monthly payments, and required cash from home price, cash, income, rate, and loan term.` |

DSR/LTV 계산기 카드 문구도 역할이 겹치지 않도록 정리했다.

| Tool | Card direction |
| --- | --- |
| DSR/LTV 계산기 | `LTV·DSR 기준 주담대 한도와 월상환액을 계산합니다.` |
| 아파트 구매 계산기 | 보유 현금과 소득 기준으로 구매 가능액, 필요 현금, 월상환액을 계산 |

Build artifact check:

- `/tools` KO HTML: `아파트 구매 계산기` 카드 확인
- `/en/tools` EN HTML: `Home Buying Budget Calculator` 카드 확인
- ItemList JSON-LD position 6에 신규 도구 포함 확인

## Click Event Policy

도구 허브 카드는 기존 `tool_hub_click` 구조를 그대로 사용한다.

Expected runtime parameters:

- `source_tool: "tools_index"`
- `target_tool: "homeBuying"` via `getToolFromPath('/tools/home-buying-budget-calculator')`
- `locale`
- `location: "tools_index_card"`

신규 이벤트명을 만들지 않고 기존 도구 카드 이벤트 구조를 재사용했다.

## Related Calculator Paths

### ToolBacklinkKit

`_components/ToolBacklinkKit.js`에 `homeBuying` config를 추가했다.

- path: `/tools/home-buying-budget-calculator`
- KO anchors:
  - `아파트 구매 계산기`
  - `아파트 구매 가능액 계산기`
  - `주담대 월상환액 계산기`
  - `필요 현금 계산기`
- Related calculator inference:
  - `아파트 구매`
  - `구매 가능`
  - `필요 현금`
  - `보유 현금`
  - `home buy`
  - `home affordability`
  - `apartment affordability`

아파트 구매 의도가 감지되면 관련 계산기 우선순위를 `homeBuying -> dsrLtv` 순서로 잡는다.

### ToolResultCta

`_components/ToolResultCta.js`에 `homeBuying`을 등록했다.

- DSR/LTV 결과 CTA의 related tool: `goal` -> `homeBuying`
- Home buying 결과 CTA의 related tool: `dsrLtv`
- Home buying lead magnet: `homeBudget`
- Home buying checklist: `/posts/personalFinance/apartment-buying-calculator-guide`

이 변경으로 DSR/LTV 결과 이후 "집값과 보유 현금까지 같이 보는" 계산 흐름이 더 직접적으로 연결된다.

### Existing DSR/LTV Page Link

`pages/tools/dsr-ltv-calculator.js`에는 이미 `/tools/home-buying-budget-calculator` 버튼이 있었다. 이번 작업에서는 해당 계산기 로직과 페이지 SEO를 수정하지 않고, 기존 링크를 유지했다.

## Link Checker

`scripts/check_posts_links_local.js`의 `KNOWN_TOOL_SLUGS`에 `home-buying-budget-calculator`를 추가했다.

목적:

- 블로그 포스트의 `/tools/home-buying-budget-calculator` 내부링크가 unknown tool slug로 오탐되지 않게 함
- 계산기 로직 또는 URL 구조 변경 없음

## SEO Impact

- 신규 계산기 페이지의 title, description, canonical, JSON-LD는 수정하지 않았다.
- sitemap 생성 정책, hreflang, robots 정책은 수정하지 않았다.
- `/tools` ItemList JSON-LD는 `TOOLS` 배열 기반이라 신규 카드가 자동 포함된다.

## Verification

| Command | Result |
| --- | --- |
| `node --check pages\tools\index.js` | PASS |
| `node --check _components\ToolBacklinkKit.js` | PASS |
| `node --check _components\ToolResultCta.js` | PASS |
| `node --check pages\tools\home-buying-budget-calculator.js` | PASS |
| `node --check pages\tools\dsr-ltv-calculator.js` | PASS |
| `node --check scripts\check_posts_links_local.js` | PASS |
| `npm.cmd run build` | PASS, 220/220 pages |
| `node scripts\verify_tool_result_cta_events.js` | PASS |
| `node scripts\verify_dsr_ltv_naver_keyword_alignment.js` | PASS |
| `node scripts\verify_post_publish_urls.js --local-server https://www.finmaphub.com/tools https://www.finmaphub.com/tools/home-buying-budget-calculator` | PASS |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS |

## URL and Sitemap Verification

| URL | Result |
| --- | --- |
| `https://www.finmaphub.com/tools` | 200, canonical self, noindex 없음, sitemap 포함 |
| `https://www.finmaphub.com/tools/home-buying-budget-calculator` | 200, canonical self, noindex 없음, sitemap 포함 |

Sitemap counts after build:

| Sitemap | URL count |
| --- | ---: |
| `public/sitemap-0.xml` | 209 |
| `public/sitemap-ko.xml` | 110 |
| `public/sitemap-en.xml` | 99 |
| `public/en/sitemap.xml` | 99 |

## Remaining Risks

- 홈 첫 화면의 주요 CTA는 기존 복리 계산기 중심으로 유지했다. 공간을 더 늘리면 모바일 첫 화면 밀도가 높아질 수 있어 이번 작업에서는 `/tools` 전체 목록 노출을 우선했다.
- `homeBuying` 공통 설정은 추가됐지만, 실제 클릭 이벤트 수신은 production GA4 DebugView에서 배포 후 확인하는 것이 좋다.
- 도구 허브 카드는 기존 카드 이미지 재사용이다. 추후 아파트 구매 계산기 전용 썸네일을 만들면 카드 구분감이 좋아진다.

## Final Verdict

PASS - 아파트 구매 계산기 도구 허브 등록 완료
