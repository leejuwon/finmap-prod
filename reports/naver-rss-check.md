# FinMap 네이버 RSS 제출 점검

점검일: 2026-05-26

## 적용 요약

- `/rss.xml`은 최신 한국어 블로그 글 중심 RSS로 생성한다.
- 최대 50개 글을 포함하며, RSS 전체 크기가 10MB를 넘지 않도록 제한한다.
- 각 item은 `title`, `link`, `guid`, `pubDate`, `description`, `content:encoded`를 포함한다.
- 본문은 Markdown을 HTML로 변환해 `content:encoded`에 담는다.
- RSS item URL과 본문 내부 사이트 링크는 `https://www.finmaphub.com` 기준으로 정규화한다.
- 영어 글은 이번 RSS에서 제외한다.

## 구현 내용

- 대상 파일: `pages/rss.xml.js`
- 한국어 Markdown 원본 위치: `content/posts/*/ko/*.md`
- 정렬 기준: `dateModified` 우선, 없으면 `datePublished`/파일 수정일 fallback
- item 수: 최대 50개
- 최소 유지 item 수: 30개
- 크기 제한: 10MB 이하
- RSS 캐시:
  - `public, max-age=0, s-maxage=3600, stale-while-revalidate=86400`

## 검증 결과

- `npm.cmd run build`: 성공
- `/rss.xml` 응답 상태: `200`
- `Content-Type`: `application/rss+xml; charset=utf-8`
- RSS 크기: 약 1.08MB
- item 개수: 50개
- `content:encoded` 포함 item: 50개
- item별 필수 태그 누락: 0개
- `/en/posts/` 영어 글 포함: 0개
- item/link/guid/atom self URL 도메인 불일치: 0개
- 본문 내 비표준 외부 URL: 0개
- XML 파싱: 정상

## 네이버 제출 체크리스트

- [x] RSS URL은 `https://www.finmaphub.com/rss.xml` 하나로 제출 가능
- [x] 최신 한국어 블로그 글 30~50개 범위 충족
- [x] `title`, `link`, `description`, `pubDate` 포함
- [x] `content:encoded`에 본문 HTML 포함
- [x] item URL은 `https://www.finmaphub.com` 기준
- [x] 영어 글 제외
- [x] RSS 크기 10MB 미만
- [x] `application/rss+xml; charset=utf-8` 응답

## 참고 및 남은 과제

- RSS 표준 namespace인 `xmlns:content`와 `xmlns:atom`은 각각 RSS 모듈 식별용 URI를 사용한다. 콘텐츠 URL 검증에서는 item/link/guid/본문 링크 기준으로 `finmaphub.com` 도메인만 남도록 정리했다.
- 영어 RSS가 필요해지면 별도 `pages/en/rss.xml.js` 또는 locale 기반 `/en/rss.xml` 라우팅을 검토할 수 있다. 이번 네이버 제출용 RSS에는 영어 글을 포함하지 않는다.
- 네이버 서치어드바이저 제출 후 수집 상태를 확인하고, 필요하면 RSS item 수를 30개로 줄이는 경량 모드도 검토할 수 있다.
