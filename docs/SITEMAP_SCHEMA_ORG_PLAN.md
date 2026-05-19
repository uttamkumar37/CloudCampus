# Sitemap and schema.org Plan

Last updated: 2026-05-19

## Purpose

This plan defines how CloudCampus should generate public website sitemaps, robots policy, canonical URLs, and schema.org structured data for production SEO.

It builds on the existing public website SEO model, which already stores per-route robots directives, sitemap priority, sitemap change frequency, canonical URL metadata, and structured data JSON.

## Scope

The plan covers public, crawlable pages only:

| Surface | Included in sitemap | Structured data |
|---|---|---|
| Homepage | Yes | `Organization`, `WebSite`, `SoftwareApplication` |
| Public marketing pages | Yes when published and indexable | `WebPage`, optional `FAQPage` |
| Product/platform pages | Yes when published and indexable | `Product`, `SoftwareApplication`, `Offer` when pricing is public |
| Demo/showcase pages | Yes when intentionally public | `WebPage`, optional `VideoObject` if media exists |
| Investor pages | Yes only when public marketing pages | `Organization`, `WebPage` |
| Admin, auth, private tenant, and draft pages | No | No indexable structured data |

Tenant-specific school public sites should produce tenant-scoped URLs only. They must not include unpublished pages, draft routes, admin routes, private file URLs, or cross-tenant content.

## Sitemap Generation

Generate sitemap entries from published public website content and published SEO settings:

| Field | Source | Rule |
|---|---|---|
| `loc` | Route path plus public base URL | Absolute HTTPS URL, normalized with one canonical trailing-slash policy. |
| `lastmod` | Page or SEO `publishedAt`, falling back to `updatedAt` | ISO date or datetime in UTC. |
| `changefreq` | SEO `sitemapChangeFreq` | One of `always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`, `never`. |
| `priority` | SEO `sitemapPriority` | Decimal between `0.0` and `1.0`. |
| Inclusion | Published page plus indexable robots | Exclude drafts, deleted rows, private routes, and `noindex`. |

Generation should run after a successful public website publish. It should be idempotent and tenant-aware.

Recommended backend contract:

1. Publish workflow validates all pages, SEO rows, and navigation.
2. Sitemap service queries only published, non-deleted, public routes.
3. URLs are built from the configured public base URL, never from request headers alone.
4. Generated XML is written to object storage or CDN-backed static storage.
5. CDN cache is invalidated for `/sitemap.xml`, sitemap index files, and affected route HTML.
6. A publish audit event records route count, excluded route count, tenant/site identifier, and object key.

For large route sets, use a sitemap index:

| File | Rule |
|---|---|
| `/sitemap.xml` | Sitemap index when there are multiple sitemap files, otherwise direct URL set. |
| `/sitemap-pages-1.xml` | Up to 50,000 URLs or 50 MB uncompressed, whichever comes first. |
| `/sitemap-media-1.xml` | Optional future media sitemap for published public images/video. |

## robots.txt Policy

Serve `robots.txt` from the same public host as the website.

Production policy:

```txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /auth
Disallow: /dashboard
Disallow: /super-admin
Disallow: /api
Sitemap: https://www.cloudcampus.example/sitemap.xml
```

Staging and non-production policy:

```txt
User-agent: *
Disallow: /
```

Rules:

1. Production `robots.txt` must reference the correct public sitemap URL.
2. Staging, preview, test, and local environments must be `Disallow: /` unless explicitly approved for crawl testing.
3. Per-route robots metadata controls indexability for page-level meta tags and sitemap inclusion.
4. `noindex` routes must be excluded from sitemap output.
5. Admin/API/private routes must stay disallowed even if a route is accidentally published.

## Canonical URL Policy

Canonical URLs must be stable, absolute, HTTPS URLs.

| Case | Canonical rule |
|---|---|
| Homepage | Canonical points to the preferred root URL. |
| Published page | Canonical points to the normalized published route. |
| Duplicate aliases | Canonical points to the primary route only. |
| UTM or tracking URLs | Canonical strips tracking parameters. |
| Tenant public sites | Canonical uses the tenant public host or tenant path, consistently. |
| Draft, preview, admin, auth | No indexable canonical URL. |

Implementation rules:

1. Generate canonical URL from configured public base URL plus normalized route path.
2. Allow explicit canonical override only when it points to an approved public host.
3. Reject `http`, localhost, admin, API, and cross-tenant canonical URLs during SEO save/publish validation.
4. Keep Open Graph `url`, Twitter metadata, sitemap `loc`, and page canonical aligned.

## schema.org Structured Data

Use JSON-LD in public page HTML. Structured data must match visible page content and must not describe features, prices, schools, or claims that are not present on the page.

Required baseline:

| Page type | Required schema.org types |
|---|---|
| Homepage | `Organization`, `WebSite`, `SoftwareApplication` |
| Product/platform page | `Product` or `SoftwareApplication` |
| Pricing page | `Offer` only when public pricing is visible and current |
| FAQ section | `FAQPage` only when questions and answers are visible on the page |
| Article/blog future page | `Article` or `BlogPosting` |
| Demo video future page | `VideoObject` only when the video is embedded and public |

Organization schema should include:

| Property | Rule |
|---|---|
| `@context` | Always `https://schema.org`. |
| `@type` | `Organization`. |
| `name` | CloudCampus public brand name. |
| `url` | Canonical homepage URL. |
| `logo` | Public absolute HTTPS logo URL. |
| `sameAs` | Approved public social/profile URLs only. |
| `contactPoint` | Public support or sales contact only if visible on site. |

Product or SoftwareApplication schema should include:

| Property | Rule |
|---|---|
| `name` | Product name visible on page. |
| `applicationCategory` | Education, school management, or SaaS category. |
| `operatingSystem` | `Web`, and mobile platforms only when relevant. |
| `description` | Aligned with visible page copy. |
| `offers` | Include only when pricing is public and current. |
| `aggregateRating` | Do not include until verified review data exists. |

## Validation Rules

Validate structured data before publish:

1. JSON-LD must be valid JSON.
2. `@context` must be `https://schema.org`.
3. `@type` must be in the approved type allowlist for the route type.
4. URLs must be absolute HTTPS URLs on approved public hosts.
5. Required fields for `Organization`, `Product`, and `SoftwareApplication` must be present.
6. Claims, ratings, pricing, and contact data must match visible page content.
7. Draft/private/admin routes cannot emit indexable structured data.

Recommended automated checks:

```bash
curl -sf "$PUBLIC_URL/sitemap.xml" | xmllint --noout -
curl -sf "$PUBLIC_URL/robots.txt"
```

Use Google Rich Results Test or schema.org validator for representative pages before production launch.

## Implementation Plan

| Step | Owner | Output |
|---|---|---|
| Add sitemap service | Backend | Generates tenant-aware XML from published pages and SEO rows. |
| Add robots endpoint/static asset | Backend or frontend hosting | Serves environment-specific robots policy. |
| Add canonical resolver | Backend/frontend render layer | Normalizes route URLs and metadata. |
| Add JSON-LD renderer | Frontend/public renderer | Emits safe schema.org JSON-LD from SEO settings. |
| Add publish-time validation | Backend | Blocks invalid canonical, robots, sitemap, and structured data. |
| Add release checks | QA/release owner | Validates sitemap XML, robots policy, canonical tags, and structured data. |

## Evidence Record

Record these in the release ticket:

| Field | Required evidence |
|---|---|
| Sitemap URL | Public sitemap URL and route count. |
| robots.txt | Environment-specific robots output. |
| Canonical sample | Homepage and at least two public page canonical URLs. |
| Structured data sample | Homepage Organization/Product JSON-LD and one content page sample. |
| Exclusions | Count and reason for noindex/private/draft route exclusions. |
| Validation | XML validation, crawlability check, and structured data validator output. |

## Go/No-Go

Public SEO launch is GO only when:

1. Sitemap generation includes all published indexable pages and excludes private, draft, deleted, and `noindex` routes.
2. Production `robots.txt` points to the correct sitemap and blocks admin/API/private routes.
3. Non-production `robots.txt` blocks crawling.
4. Canonical URLs are absolute, HTTPS, stable, and aligned with sitemap and social metadata.
5. Organization and Product or SoftwareApplication schema.org JSON-LD validates and matches visible content.
6. Release evidence is attached to the ticket.

Any private URL exposure, cross-tenant sitemap entry, invalid canonical URL, crawlable staging site, or misleading structured data is a NO-GO until fixed.

## Validation

TASK-042 validation command:

```bash
rg -n "sitemap|schema.org|structured data" docs PRODUCTION_READY_ROADMAP.md
```
