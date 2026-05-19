# Lighthouse Checklist

Last updated: 2026-05-19

## Purpose

This checklist defines the Lighthouse, Core Web Vitals, accessibility, SEO, and best-practice gates for the CloudCampus public website before production release.

Run it for every public website release, theme/layout change, analytics change, major image/media change, and SEO metadata change.

## Scope

Validate the public pages that represent the first visitor experience and the highest SEO value:

| Page | Example path | Required |
|---|---|---|
| Homepage | `/` | Yes |
| Public landing page | `/about`, `/admissions`, or equivalent | Yes |
| Public content/detail page | A published school page | Yes |
| Showcase/demo page | `/showcase/demo` or equivalent | Yes |
| Investor/public marketing page | `/showcase/investors` or equivalent | Yes |

If a route is disabled for a tenant, record the replacement route used for that tenant.

## Environment Inputs

| Variable | Example | Required |
|---|---|---|
| `PUBLIC_URL` | `https://staging.cloudcampus.io` | Public website base URL. |
| `ROUTES_FILE` | `docs/lighthouse-routes.txt` | Route list used for the audit. |
| `COMMIT_SHA` | Git commit under test | Exact build identifier. |
| `DEVICE_PROFILE` | `mobile`, `desktop` | Audit profile. |
| `THROTTLING` | Lighthouse default mobile throttling | Network/CPU profile used. |

## Target Scores

| Category | Mobile target | Desktop target | Release gate |
|---|---:|---:|---|
| Performance | 90+ | 95+ | Required unless a documented third-party dependency exception is approved. |
| Accessibility | 95+ | 95+ | Required. |
| Best Practices | 95+ | 95+ | Required. |
| SEO | 95+ | 95+ | Required. |

Any score below target must have an owner, root cause, remediation plan, and explicit release approval.

## Core Web Vitals Budgets

| Metric | Target | Blocker threshold |
|---|---:|---:|
| Largest Contentful Paint (LCP) | <= 2.5s | > 4.0s |
| Interaction to Next Paint (INP) | <= 200ms | > 500ms |
| Cumulative Layout Shift (CLS) | <= 0.10 | > 0.25 |
| First Contentful Paint (FCP) | <= 1.8s | > 3.0s |
| Time to First Byte (TTFB) | <= 800ms | > 1.8s |
| Total Blocking Time (TBT) | <= 200ms | > 600ms |

Use real-user monitoring data when available. When field data is not available, Lighthouse lab data is acceptable with the limitation recorded in the release ticket.

## Performance Checklist

| Check | Pass condition |
|---|---|
| LCP element identified | Report names the LCP element and it is intentional visible content, not a placeholder. |
| Hero/media optimized | Above-the-fold images use the correct dimensions, compression, and responsive `srcset` where applicable. |
| Critical CSS/JS bounded | No unused public-site bundle growth without an approved reason. |
| Render blocking controlled | Fonts, CSS, scripts, and analytics do not block initial rendering unnecessarily. |
| Font loading stable | Fonts use swap or fallback strategy and do not cause visible layout shift. |
| Image layout stable | Images, embeds, and cards reserve dimensions before content loads. |
| API payloads bounded | Public website API responses avoid shipping unpublished or admin-only data. |
| Caching configured | Static assets are cacheable with fingerprinted URLs; HTML/API freshness matches publishing behavior. |

## Accessibility Checklist

| Check | Pass condition |
|---|---|
| Semantic landmarks | Header, main, footer, navigation, and major sections are exposed correctly. |
| Heading order | Pages have one logical H1 and descending section headings. |
| Keyboard navigation | Navigation, menus, forms, and calls to action work without a pointer. |
| Focus visibility | Focus ring is visible and not clipped. |
| Color contrast | Text and interactive states meet WCAG AA contrast. |
| Image alternatives | Informational images have useful alt text; decorative images are hidden from assistive tech. |
| Form labels | Inputs, selects, and consent controls have accessible names and errors. |
| Motion safety | Animations respect reduced-motion preferences. |

## SEO Checklist

| Check | Pass condition |
|---|---|
| Title tag | Each route has a unique descriptive title within reasonable length. |
| Meta description | Each route has a unique summary aligned with visible content. |
| Canonical URL | Canonical URL is absolute, stable, and points to the preferred public route. |
| Indexing policy | Public pages are indexable; private/admin pages stay noindex or blocked. |
| Open Graph/Twitter metadata | Sharing metadata has title, description, URL, and image where appropriate. |
| Structured headings | Content hierarchy is crawlable without client-only hidden text. |
| Link crawlability | Primary navigation and important internal links use crawlable anchors. |
| Error pages | 404 and unpublished routes do not emit misleading indexable SEO metadata. |

## Best Practices Checklist

| Check | Pass condition |
|---|---|
| HTTPS | Public URL and all assets load over HTTPS in staging/prod. |
| Console errors | No uncaught browser errors during page load and route navigation. |
| Third-party scripts | Analytics, chat, maps, and embeds are justified, consent-aware, and deferred where possible. |
| Security headers | CSP, frame, content-type, referrer, and permissions headers match the public-site policy. |
| Mixed content | No mixed active or passive content. |
| Dependency risk | No known vulnerable public-site dependency is introduced without an exception. |
| Privacy | Tracking and marketing pixels respect consent and regional configuration. |

## Suggested Commands

Run Lighthouse locally or in CI against the deployed staging site:

```bash
npx lighthouse "$PUBLIC_URL/" \
  --preset=desktop \
  --output=json \
  --output-path=artifacts/lighthouse-home-desktop.json
```

```bash
npx lighthouse "$PUBLIC_URL/" \
  --form-factor=mobile \
  --output=json \
  --output-path=artifacts/lighthouse-home-mobile.json
```

For repeatable CI audits, prefer Lighthouse CI with a route list and target assertions:

```bash
npx lhci autorun
```

## Evidence Record

Record the following in the release ticket:

| Field | Required evidence |
|---|---|
| Commit SHA | Exact frontend build tested. |
| Public URL | Staging or production URL audited. |
| Routes | Route list and tenant/site used. |
| Lighthouse reports | JSON/HTML artifacts for mobile and desktop. |
| Core Web Vitals | LCP, INP or TBT, CLS, FCP, and TTFB values. |
| Scores | Performance, accessibility, best practices, and SEO scores. |
| Exceptions | Approved owner, reason, expiry date, and follow-up task. |
| Browser smoke | Confirmation that audited pages render without console errors. |

## Go/No-Go

Public website release is GO only when:

1. Lighthouse target scores pass for required routes.
2. Core Web Vitals stay within target or approved exception.
3. Accessibility checks pass without critical or serious issues.
4. SEO metadata is unique, crawlable, and aligned with published content.
5. Best-practice checks show no HTTPS, mixed-content, console-error, or consent regression.
6. Evidence is attached to the release ticket.

Any blocker-threshold Core Web Vitals result, accessibility-critical issue, private content exposure, broken canonical URL, or consent-bypassing third-party script is a NO-GO until fixed or explicitly accepted by the release owner.

## Validation

TASK-041 validation command:

```bash
rg -n "Lighthouse|Core Web Vitals|SEO" docs PRODUCTION_READY_ROADMAP.md
```
