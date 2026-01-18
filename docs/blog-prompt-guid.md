카테고리: (재테크/경제정보/투자정보 중 1)
주제: (한 줄 주제)
슬러그: (영문 slug)
목표 독자: (예: 20~40 직장인, 초보 투자자 등)
글의 목표: (예: 불안 줄이기 / 해석 프레임 제공 / 실행 규칙 만들기)

반드시 적용:
- blog-style-guide-v3.md + 해당 카테고리 가이드(md) 규칙을 최우선으로 적용
- 분량은 8,000~15,000자 랜덤
- H2(##) 소제목에 [img-row], Internal Links 같은 “영역명” 금지. 내용 요약형 소제목으로 작성
- 이미지: cover + 내부 img1~img3 필수, 필요 시 img4~img5 추가
  - 각 이미지마다 <figure><img/><figcaption> 형식으로 삽입
  - 이미지 alt/캡션은 모바일 가독성 좋게, 결론형 1문장
- 내부 링크: blog-contents.md 기반으로 4~6개 자연스럽게 배치 (중간 1~2개 + 끝 2~4개)
- 마지막에 FAQ 6~10개 포함
- JSON-LD(Article + FAQPage)도 기본 포함

출력 형식:
- frontmatter(title, description, slug, category, date, language)
- 본문(MD/MDX)
- JSON-LD는 본문 하단에 코드 블록으로 제공
--------------------------------------------------------------------
Category: (Personal Finance / Economics / Investing)
Topic: (same topic, but write as a new original English post — not a translation)
Slug: (same slug style)
Audience: (global retail investors / Korea-context included if relevant)
Goal: (interpretation framework / rules-based action plan)

Hard requirements:
- Apply blog-style-guide-v3.md + the category-specific guide as strict constraints
- Length: random between 8,000 and 15,000 Korean chars-equivalent (i.e., long-form English)
- No section titles like "Internal Links" or "[img-row]". Use meaning-based H2 titles
- Images: cover + img1~img3 required; add img4~img5 if helpful
- Internal links: 4~6 based on blog-contents.md (1–2 mid, 2–4 near the end)
- Include 6~10 FAQs + JSON-LD (Article + FAQPage)

Output:
- frontmatter
- MD/MDX body
- JSON-LD blocks at the bottom
JSON-LD must be provided as <script type="application/ld+json"> blocks (not ```json).