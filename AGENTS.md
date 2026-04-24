# Finmap AGENTS.md

## Project identity

This repository is the user's personal Finmap project.

Finmap includes:
- Korean/English financial and real estate blog content
- Next.js pages and API routes
- Real estate dashboard pages
- Market data and real estate crawlers
- Calculator tools
- SEO files such as sitemap, robots, canonical URLs, structured data, and internal links

This is a personal project, not a company project.  
Do not assume company-specific environments, policies, internal domains, or private systems unless the user explicitly provides them.

---

## Working style

- Prefer small, focused, reviewable changes.
- Before modifying files, inspect the related files first.
- Avoid large refactors unless the user explicitly asks for them.
- Preserve existing behavior unless the requested change requires otherwise.
- When making code changes, summarize:
  - files changed
  - what changed
  - why it changed
  - commands run
  - remaining risks or manual checks
- When possible, show a concise diff-style explanation after changes.
- Do not invent files, routes, APIs, database columns, or environment variables without checking the repository first.
- If a required file or variable is missing, explain what is missing and suggest the smallest safe addition.

---

## Language and communication

- The user usually works in Korean.
- Explain results in Korean unless the user asks otherwise.
- Code comments may be Korean or English, but keep them practical and minimal.
- For blog content, Korean and English versions should be written for their own target readers, not as direct translations.

---

## Safety and secrets

- Never expose or print secrets from `.env`, `.env.local`, `.env.production`, config files, deployment logs, or database connection files.
- Do not hard-code API keys, DB passwords, tokens, cookies, or private endpoints.
- If a secret is needed, refer to it through an environment variable.
- Do not modify production deployment settings unless explicitly requested.
- Do not delete data, truncate tables, drop tables, or run destructive scripts unless the user explicitly asks and the change is clearly limited.
- Be careful with crawler code that may send repeated requests. Prefer throttle, retry limits, and logging.

---

## Tech stack assumptions

Before changing implementation, inspect the repository.  
Common Finmap stack may include:

- Next.js
- React
- Node.js
- MySQL
- Puppeteer
- Axios / Cheerio
- Markdown or MDX blog content
- SEO-related files and components

Do not upgrade major dependencies unless explicitly requested.

If changing dependencies:
- explain why the dependency is needed
- check `package.json`
- preserve `package-lock.json` consistency
- do not remove existing dependencies unless confirmed unused

---

## Build and validation

After code changes, run the most relevant checks when reasonable:

- `npm run build`
- `npm run lint` if available
- targeted Node script execution if changing crawler scripts
- targeted API route check if changing API logic

If a command fails:
- include the exact failing command
- summarize the key error
- fix the smallest likely cause
- do not hide failing checks

If checks cannot be run:
- explain why
- provide manual verification steps

---

## Next.js and React rules

- Preserve existing routing conventions.
- Preserve Korean/English language routing.
- Do not break existing canonical, hreflang, sitemap, or robots behavior.
- Prefer existing components and styling patterns.
- Avoid unnecessary UI library additions.
- Keep mobile responsiveness in mind.
- When adding filters or dashboard UI:
  - update state handling
  - update query parameters if the page already uses them
  - update API request parameters
  - update list and detail display where appropriate
  - preserve existing Korean/English labels

---

## API route rules

When modifying API routes:

- Validate and sanitize query parameters.
- Use safe defaults.
- Avoid breaking existing clients.
- Use table aliases in SQL joins.
- Fully qualify ambiguous column names.
- Keep response shape backward-compatible when possible.
- If adding fields, add them without removing existing fields.
- Handle empty result sets gracefully.
- Log server errors clearly without exposing secrets.

---

## Database and SQL rules

- Use explicit table aliases in joins.
- Avoid `SELECT *` in production API routes.
- Be careful with ambiguous column names such as:
  - `sido_code`
  - `lawd_cd`
  - `apt_key`
  - `deal_ym`
  - `pyeong_band`
- Do not make destructive schema changes unless explicitly requested.
- If a schema change is needed, provide:
  - SQL migration
  - rollback SQL if practical
  - affected API/routes/components
- Prefer backward-compatible additions.

---

## Crawler rules

Finmap crawlers may collect:
- KOSPI
- Korean ETFs
- S&P 500
- Nasdaq
- Dow Jones
- Dollar Index
- USD/KRW
- WTI crude oil
- U.S. Treasury yields
- Korean real estate transaction and apartment complex data

When changing crawler code:

- Preserve existing CLI options.
- Preserve existing database insert/update behavior unless asked otherwise.
- Add retry logic carefully with max retry limits.
- Add throttle/delay for external requests.
- Log enough information to debug failures:
  - target symbol or region
  - target date or period
  - URL or source name, unless sensitive
  - retry count
  - reason for skip/failure
- If a requested date has no market data, prefer previous available trading day fallback if the existing logic uses that pattern.
- Do not assume all markets share the same holiday calendar.
- Do not rely only on one selector if a page is known to be unstable.
- For Puppeteer:
  - wait for necessary selectors
  - handle first-page/session initialization issues
  - close pages/browsers safely
  - avoid infinite loops

---

## Financial data rules

When working with financial market data:

- Distinguish clearly between:
  - previous close
  - reference price
  - open
  - high
  - low
  - close
  - current price
- For change rates, calculate against the intended reference price.
- For Korean market intraday data:
  - during market hours, some values may be incomplete
  - after market close, full OHLC is expected
- For U.S. and global market data:
  - account for weekends and holidays
  - use the last available trading day when appropriate
- Do not present scraped data as official unless the source is official.

---

## Real estate dashboard rules

When changing real estate dashboard features:

- Preserve existing Seoul/Gyeonggi/Incheon behavior unless asked otherwise.
- Keep filters understandable for normal users.
- If adding a new filter:
  - update frontend state
  - update query string handling if used
  - update API request
  - update SQL condition
  - update list cards if relevant
  - update detail page if relevant
- For apartment display:
  - prefer user-friendly labels
  - show missing values as `-`
  - avoid misleading precision
- For price data:
  - clarify whether value is transaction price, average, median, price per m², or price per pyeong.
- For area data:
  - distinguish exclusive area, supply area, pyeong band, and displayed pyeong.

---

## Blog writing rules

Finmap blog posts should follow the user's established style.

For Korean posts:
- Write naturally for Korean readers.
- Focus on practical interpretation and dashboard/tool usage.
- Avoid overly academic explanations.

For English posts:
- Do not directly translate the Korean post.
- Rewrite for international readers, especially U.S.-familiar readers when relevant.
- Keep the same topic and slug strategy when requested, but adapt examples and framing.

Unless the user says otherwise, blog posts should include:
- clear title
- description
- datePublished/dateModified
- category
- tags
- cover image reference
- summary bullets
- hero section when the existing style requires it
- internal links
- FAQ section
- JSON-LD Article
- JSON-LD FAQPage

When adding internal links:
- use existing routes from the repository
- avoid linking to nonexistent pages
- do not over-optimize anchor text
- keep links useful to the reader

---

## SEO rules

When modifying SEO:

- Preserve canonical URL behavior.
- Preserve language alternates/hreflang behavior.
- Avoid duplicate URLs.
- Check sitemap output if sitemap-related code changes.
- Check robots output if robots-related code changes.
- Avoid creating multiple URLs for the same content unless canonical is clear.
- For blog posts:
  - title and description should be unique
  - structured data should match visible content
  - FAQ JSON-LD should match the FAQ section
- Do not add fake author, fake review, or fake rating structured data.

---

## Image prompt rules

For Finmap blog images:

- Do not render long article titles verbatim inside images.
- Use titles as concept reference only.
- Cover images should usually be keyword/concept based.
- For img1~img3, use a short display title of 2–6 words when needed.
- Avoid dense text inside images.
- Prefer clean editorial, financial, dashboard, housing, or infographic style depending on the post.
- Keep Korean text out of generated images unless explicitly requested.
- Follow the user's Finmap image prompt guide if present in the repository.

---

## Calculator tool rules

When creating or modifying calculators:

- Include tax, fee, and currency settings when relevant.
- Support Korean and English language behavior when the project pattern supports it.
- Include year-by-year or period-by-period tables when useful.
- Keep formulas transparent and explain assumptions.
- Avoid implying financial advice or guaranteed outcomes.

---

## Git and change management

- Do not commit changes unless the user explicitly asks.
- Do not push changes unless the user explicitly asks.
- Do not modify `.gitignore` unless needed and explained.
- Do not discard user changes.
- Before large edits, check current file contents.
- If there are existing uncommitted changes, avoid overwriting them and mention the risk.

---

## Preferred final response after a task

After completing a task, respond in Korean with:

1. Summary of changes
2. Files changed
3. Commands run and results
4. Important notes or remaining checks
5. Suggested next step, only if useful

Keep the response concise but specific.