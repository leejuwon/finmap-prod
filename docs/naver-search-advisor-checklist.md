# Naver Search Advisor Checklist

Last checked: 2026-05-20

## Current Status

Finmap is generally ready to submit to Naver Search Advisor.

- Site owner verification file exists: `navercb92e0670eb3fe56ebb338ddf241c572.html`
- Canonical host is consistent: `https://www.finmaphub.com`
- Robots file exists: `https://www.finmaphub.com/robots.txt`
- Sitemap index exists: `https://www.finmaphub.com/sitemap.xml`
- RSS route exists: `https://www.finmaphub.com/rss.xml`
- Korean and English pages use separate URL paths and canonical URLs:
  - Korean: `https://www.finmaphub.com/...`
  - English: `https://www.finmaphub.com/en/...`

## Robots.txt

Current file: `public/robots.txt`

```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Disallow: /cdn-cgi/

Sitemap: https://www.finmaphub.com/sitemap.xml
```

Naver's crawler uses the `Yeti` user agent. Because the `User-agent: *` group allows crawling and only blocks private/API paths, Naver is not blocked.

Do not use robots.txt as an index-control tool. Keep index control in meta robots, canonical, redirects, and sitemap policy.

## Sitemap

Submit this URL:

```txt
https://www.finmaphub.com/sitemap.xml
```

The current sitemap is an index sitemap that points to:

```txt
https://www.finmaphub.com/sitemap-0.xml
```

The generated sitemap uses fully qualified `https://www.finmaphub.com` URLs and includes `lastmod`, `changefreq`, `priority`, and `hreflang` alternates. Query-string URLs, legacy mixed-language post paths, API routes, robots, RSS, and favicon paths are excluded in `next-sitemap.config.js`.

Operational rule:

- Include only final canonical 200 URLs.
- Do not include query parameter URLs such as `?lang=`, `?timeframe=`, `?period=`, `?band=`, `?sido=`, or `?area=`.
- Do not include redirect URLs.
- Do not include noindex URLs.
- Keep sitemap host aligned with the verified Naver property: `https://www.finmaphub.com`.

## RSS

Submit this URL:

```txt
https://www.finmaphub.com/rss.xml
```

RSS is implemented in `pages/rss.xml.js`.

RSS items are generated from `content/posts/**/{ko,en}/*.md` frontmatter and include:

- `title`
- `link`
- `guid`
- `pubDate`
- `description`

The feed keeps the latest blog posts first and limits output to 30 items. Korean and English post URLs can appear together because both are under the same verified host and have separate canonical URLs. If Naver search performance is primarily Korean-focused, a future option is to add a Korean-only feed such as `/rss-ko.xml`, but the current single feed is acceptable for submission.

## Canonical And Hreflang

Checked components:

- `_components/SeoHead.js`
- `_components/ToolSeo.js`
- `next-sitemap.config.js`

Current policy:

- Canonical URLs are queryless and use `https://www.finmaphub.com`.
- English canonical URLs use `/en/...`.
- Hreflang URLs are fully qualified.
- `ko`, `en`, and `x-default` are generated consistently.
- `x-default` points to the Korean/default URL.

No large canonical or hreflang changes were needed for Naver submission.

## Naver Submission Procedure

1. Open Naver Search Advisor.
2. Add or select the property for `https://www.finmaphub.com`.
3. Confirm ownership using the existing verification file:
   `https://www.finmaphub.com/navercb92e0670eb3fe56ebb338ddf241c572.html`
4. Go to robots.txt validation and request collection/check.
5. Submit sitemap:
   `https://www.finmaphub.com/sitemap.xml`
6. Submit RSS:
   `https://www.finmaphub.com/rss.xml`
7. Use URL inspection/collection request for key URLs.
8. After deployment, check collection status and search exposure over the next 1-2 weeks.

## URLs To Submit Or Request First

Core:

- `https://www.finmaphub.com/`
- `https://www.finmaphub.com/sitemap.xml`
- `https://www.finmaphub.com/rss.xml`
- `https://www.finmaphub.com/robots.txt`

Tools:

- `https://www.finmaphub.com/tools`
- `https://www.finmaphub.com/tools/compound-interest`
- `https://www.finmaphub.com/tools/cagr-calculator`
- `https://www.finmaphub.com/tools/goal-simulator`
- `https://www.finmaphub.com/tools/dca-calculator`
- `https://www.finmaphub.com/tools/fire-calculator`

Blog hubs:

- `https://www.finmaphub.com/category/economicInfo`
- `https://www.finmaphub.com/category/personalFinance`
- `https://www.finmaphub.com/category/investingInfo`

Market:

- `https://www.finmaphub.com/market`
- `https://www.finmaphub.com/market/indices`
- `https://www.finmaphub.com/market/real-estate`

English pages can also be submitted if English search exposure is a target:

- `https://www.finmaphub.com/en`
- `https://www.finmaphub.com/en/tools`
- `https://www.finmaphub.com/en/market/real-estate`

## Manual Checks After Deployment

- `https://www.finmaphub.com/robots.txt` returns 200 and `text/plain`.
- `https://www.finmaphub.com/sitemap.xml` returns 200 XML.
- `https://www.finmaphub.com/sitemap-0.xml` returns 200 XML.
- `https://www.finmaphub.com/rss.xml` returns 200 `application/rss+xml`.
- RSS has at least one `<item>`.
- RSS item links all start with `https://www.finmaphub.com`.
- Important pages do not have `noindex`.
- Important pages have a queryless canonical URL.
- Internal links use real `<a href="...">` or Next `Link` URLs, not JavaScript-only navigation.

## Official References

- Naver robots.txt guide: https://searchadvisor.naver.com/guide/seo-basic-robots
- Naver RSS and sitemap submission guide: https://searchadvisor.naver.com/guide/request-feed
- Naver SEO basics: https://searchadvisor.naver.com/guide/seo-basic-intro
