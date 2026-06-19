# Finmap KO/EN Search Channel Split Audit

- 작성일: 2026-06-19
- 목적: KO는 네이버 서치어드바이저 중심, EN은 Google Search Console + Bing Webmaster Tools 중심으로 분리 운영하기 위한 기술 SEO 기준 문서화 및 빌드 산출물 검증
- 점검 범위: `next-sitemap.config.js`, `public/robots.txt`, `public/sitemap.xml`, `public/sitemap-0.xml`, `public/sitemap-ko.xml`, `public/sitemap-en.xml`, `public/en/sitemap.xml`, `_components/SeoHead.js`, post route, tools/market 주요 페이지, SEO 검증 스크립트

## 운영 기준

| 항목 | 기준 |
| --- | --- |
| KO canonical | `https://www.finmaphub.com/...` 유지. 루트 canonical은 `https://www.finmaphub.com/` |
| EN canonical | `https://www.finmaphub.com/en/...` 유지 |
| KO 경로 | `/ko` prefix를 만들지 않음 |
| EN 경로 | `/en` prefix 사용 |
| sitemap 포함 URL | 최종 200 canonical URL만 포함 |
| sitemap 금지 URL | noindex, redirect, query URL, `/en/en`, `/posts/{category}/ko/{slug}`, `/posts/{category}/en/{slug}`, `/market/real-estate/apt/` 상세 URL 제외 |
| EN URL-prefix sitemap | `public/en/sitemap.xml`은 `https://www.finmaphub.com/en` 및 그 하위 URL만 포함 |
| hreflang | KO/EN pair가 있는 경우 `ko`, `en` self/alternate를 정확히 연결 |
| x-default | 홈 pair 중심으로만 유지 |
| 변경 원칙 | canonical/hreflang 구조는 대규모 변경 금지. mismatch 발견 시 최소 수정 |

## 현재 감사 결과

| 대상 | 결과 | 메모 |
| --- | --- | --- |
| `next-sitemap.config.js` | PASS | `/ko`, `/en/en`, query URL, legacy post lang URL, 부동산 apt 상세 URL 제외 규칙 유지 |
| `public/robots.txt` | PASS | 기존 `Sitemap: https://www.finmaphub.com/sitemap.xml` 유지. split sitemap은 수동 제출용 |
| `public/sitemap.xml` | PASS | root sitemap index로 `sitemap-0.xml`을 가리킴 |
| `public/sitemap-0.xml` | PASS | 199 URLs. 금지 loc 패턴 0건 |
| `public/sitemap-ko.xml` | PASS | 101 URLs. KO/Naver 제출용으로 사용 가능 |
| `public/sitemap-en.xml` | PASS | 98 URLs. 필수 EN 정적/툴/시장 URL 16/16 포함 |
| `public/en/sitemap.xml` | PASS | 98 URLs. `sitemap-en.xml`과 동일 내용이며 EN loc만 포함 |
| `_components/SeoHead.js` | PASS | KO/EN self-canonical, `ko`/`en` hreflang, 홈 전용 `x-default` 구조 유지 |
| post route | PASS | 실제 route는 `pages/posts/[category]/[slug].js`; legacy `/posts/{category}/{ko|en}/{slug}`는 redirect/404 처리 |
| tools/market 주요 페이지 | PASS | 샘플 URL 모두 200, self-canonical, hreflang, sitemap membership 확인 |
| SEO 검증 스크립트 | 보강 완료 | `finalUrl`, sitemap 포함 여부, EN prefix sitemap 포함 여부, 금지 sitemap loc 패턴 검증 추가 |

## 적용한 최소 변경

| 파일 | 변경 |
| --- | --- |
| `scripts/verify_seo_channel_split.js` | 로컬 HTTP 샘플 검증에 `finalUrl`, main/channel sitemap membership, `/en/sitemap.xml` membership, sitemap 금지 loc 패턴 검사를 추가 |
| `reports/seo-channel-split-url-check.md` | 보강된 검증 결과로 재생성 |
| `reports/seo-channel-split-audit.md` | KO/EN 채널 분리 운영 기준과 현재 검증 결과를 문서화 |

canonical, hreflang, robots, sitemap 생성 정책 자체는 변경하지 않았다.

## 검증 결과 요약

| 검증 항목 | 결과 |
| --- | --- |
| URL 샘플 수 | 16 |
| 샘플 실패 수 | 0 |
| `sitemap-0.xml` URL 수 | 199 |
| `sitemap-ko.xml` URL 수 | 101 |
| `sitemap-en.xml` URL 수 | 98 |
| `public/en/sitemap.xml` URL 수 | 98 |
| EN 필수 URL 포함 | 16/16 |
| `/en/sitemap.xml` EN-only loc | PASS |
| sitemap 금지 loc 패턴 | PASS, 0건 |
| noindex/X-Robots 샘플 문제 | 0건 |
| non-home `x-default` 샘플 문제 | 0건 |

상세 URL별 결과는 `reports/seo-channel-split-url-check.md`에 기록했다.

## 확인된 주의사항

1. `next-sitemap`은 루트 `<loc>`를 `https://www.finmaphub.com` 형태로 직렬화한다. URL 파서 기준으로는 `https://www.finmaphub.com/`와 동일한 루트 URL이므로, 검증 스크립트는 sitemap membership 비교 시 루트 host-only loc를 canonical 루트로 정규화한다. HTML canonical은 계속 `https://www.finmaphub.com/`이다.
2. 요청 범위에 적힌 `pages/posts/[category]/[lang]/[slug].js` 파일은 현재 실제 파일 구조가 아니다. 현재 canonical route는 `pages/posts/[category]/[slug].js`이며, legacy language-in-path URL은 `pages/posts/[...all].js`와 redirect 규칙에서 정리된다.
3. `robots.txt`는 변경하지 않았다. 네이버/Google/Bing별 제출 대상 분리는 Search Console/Webmaster Tools에서 수동 제출로 운영한다.
4. `.next` 등 빌드 산출물은 커밋 대상에서 제외한다.
5. 작업 전부터 존재하던 `reports/revenue-measurement-plan.md` 수정 및 `reports/revenue-d14-first-review.md` 미추적 파일은 이번 SEO 작업 범위 밖이라 건드리지 않았다.

## 제출 운영 기준

| 채널 | 우선 제출 |
| --- | --- |
| Naver Search Advisor | `https://www.finmaphub.com/rss.xml`, 필요 시 `https://www.finmaphub.com/sitemap-ko.xml` |
| Google Search Console root property | `https://www.finmaphub.com/sitemap-en.xml`, 필요 시 `https://www.finmaphub.com/sitemap.xml` |
| Google Search Console `/en/` URL-prefix property | `https://www.finmaphub.com/en/sitemap.xml` |
| Bing Webmaster Tools | `https://www.finmaphub.com/sitemap-en.xml`, 필요 시 `https://www.finmaphub.com/sitemap.xml` |

## 실행한 명령

| Command | Result |
| --- | --- |
| `node --check scripts\verify_seo_channel_split.js` | PASS |
| `npm.cmd run build` | PASS. Next build 성공, postbuild에서 `sitemap-ko.xml` 101 URLs, `sitemap-en.xml` 98 URLs, `en\sitemap.xml` 98 URLs 생성 |
| `node scripts\verify_bing_sitemap.js` | PASS. failures 0, canonical URLs 199, post URLs 142 |
| `node scripts\verify_seo_channel_split.js --local-server` | PASS. 16/16 샘플 통과, 금지 sitemap loc 패턴 0건 |

## 1차 판정

현재 KO/EN 채널 분리 SEO 구조는 운영 기준을 만족한다. 추가 canonical/hreflang 구조 변경은 필요하지 않으며, EN 제출은 `sitemap-en.xml`과 `/en/sitemap.xml`을 중심으로 진행하면 된다.
