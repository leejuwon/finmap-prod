# GA4 Weekly Search Channel Check

Generated: 2026-07-29

## Purpose

The provided GA4 screen is an all-traffic landing page report. Use this checklist to separate `google / organic`, `naver / organic`, and `bing / organic` before making any SEO or calculator-change decision.

## Comparison Periods

- Recent: `2026-07-22` to `2026-07-28`
- Previous: `2026-07-15` to `2026-07-21`
- Keep the periods as exact, non-overlapping 7-day ranges.

## Report 1: Channel Landing Pages

GA4 path:

1. Reports
2. Engagement
3. Landing page
4. Add secondary dimension: `Session source / medium`
5. Apply comparison date range

Filter or segment these sources separately:

- `google / organic`
- `naver / organic`
- `bing / organic`
- `(direct) / (none)`
- Other material sources

Record:

- sessions
- active users
- new users
- engaged sessions
- engagement rate
- average engagement time per session
- landing page path

Do not treat the all-traffic session decline as Google organic decline without this split.

## Report 2: Calculator Events

Use GA4 Events or Explore and compare the same two 7-day periods.

Events to check:

- `tool_calculate`
- `home_buying_calculate`
- `dsr_ltv_calculate`
- `mortgage_payment_calculate`
- `related_calculator_click`
- `post_to_dsr_ltv_click`
- `tool_result_cta_view`
- `tool_result_cta_click`
- `tool_result_action`
- `real_estate_to_dsr_click`
- `dsr_to_real_estate_click`

Record:

- event count
- total users
- event count per active user
- `source_tool`
- `location`
- page path
- session source / medium

The `Key events = 0` value in the provided landing page screen is not enough to conclude that calculator events are missing.

## Report 3: Channel Calculator Funnel

Build one view each for:

- `google / organic`
- `naver / organic`
- `bing / organic`

For each channel, record:

- calculator landing sessions
- `tool_calculate`
- tool-specific calculate events
- result CTA views
- result CTA clicks
- landing-to-calculate rate
- calculate-to-CTA rate

## Static Code Audit Result

Local string checks found existing GA4 initialization, SPA route-change page view handling, event helper context, calculator events, and CTA events. No GA4 code change is part of P1-2A.

Known caution:

- `(not set)` increased from 4 to 15 sessions in the all-traffic screen, but it is still a partial signal and should not be treated as a standalone GA4 failure without channel and page-location review.
