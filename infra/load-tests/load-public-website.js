/**
 * Public website load test — TASK-028
 *
 * Exercises unauthenticated public website reads:
 *   - homepage/root API
 *   - published pages list
 *   - individual page reads
 *   - navigation
 *   - theme
 *   - SEO
 *   - demo showcase
 *   - investor showcase
 *   - optional tenant public site reads
 *
 * Optional env vars:
 *   BASE_URL            — default: http://localhost:8080
 *   PAGE_SLUGS          — comma-separated published slugs, default: home,features,pricing
 *   SEO_ROUTES          — comma-separated route paths, default: /,/features,/pricing
 *   TENANT_CODE         — optional tenant code for /v1/public/sites/{tenantCode}
 *   TENANT_PAGE_SLUGS   — comma-separated tenant-site slugs, default: home,about,contact
 *
 * Usage:
 *   k6 run infra/load-tests/load-public-website.js
 *   k6 run \
 *     --env BASE_URL=https://staging.cloudcampus.io \
 *     --env PAGE_SLUGS=home,features,pricing \
 *     --env SEO_ROUTES=/,/features,/pricing \
 *     --env TENANT_CODE=lt-school-chain \
 *     infra/load-tests/load-public-website.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL } from './helpers/auth.js';

const pageDuration = new Trend('public_website_page_duration', true);
const assetDuration = new Trend('public_website_asset_duration', true);
const showcaseDuration = new Trend('public_website_showcase_duration', true);
const publicFailed = new Rate('public_website_failed');

export const options = {
  stages: [
    { duration: '1m', target: 25 },
    { duration: '3m', target: 150 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    public_website_page_duration: ['p(95)<650'],
    public_website_asset_duration: ['p(95)<500'],
    public_website_showcase_duration: ['p(95)<900'],
    public_website_failed: ['rate<0.01'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

function csv(name, fallback) {
  return (__ENV[name] || fallback)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function setup() {
  return {
    pageSlugs: csv('PAGE_SLUGS', 'home,features,pricing'),
    seoRoutes: csv('SEO_ROUTES', '/,/features,/pricing'),
    tenantCode: __ENV.TENANT_CODE || '',
    tenantPageSlugs: csv('TENANT_PAGE_SLUGS', 'home,about,contact'),
  };
}

export default function (config) {
  let failed = false;
  const pageSlug = pick(config.pageSlugs);
  const seoRoute = pick(config.seoRoutes);

  group('homepage and pages', () => {
    failed = timedOk('public root', 'page', http.get(`${BASE_URL}/v1/public/website`)) || failed;
    failed = timedOk('published pages', 'page', http.get(`${BASE_URL}/v1/public/website/pages`)) || failed;
    failed = timedOk('published page detail', 'page', http.get(
      `${BASE_URL}/v1/public/website/pages/${encodeURIComponent(pageSlug)}`
    )) || failed;
  });

  group('navigation theme seo', () => {
    failed = timedOk('navigation', 'asset', http.get(`${BASE_URL}/v1/public/website/navigation`)) || failed;
    failed = timedOk('theme', 'asset', http.get(`${BASE_URL}/v1/public/website/theme`)) || failed;
    failed = timedOk('seo', 'asset', http.get(
      `${BASE_URL}/v1/public/website/seo?routePath=${encodeURIComponent(seoRoute)}`
    )) || failed;
  });

  group('demo and investor showcase', () => {
    failed = timedOk('demo showcase', 'showcase', http.get(`${BASE_URL}/v1/public/website/showcase/demo`)) || failed;
    failed = timedOk('investor showcase', 'showcase', http.get(`${BASE_URL}/v1/public/website/showcase/investors`)) || failed;
    failed = timedOk('demo scenarios', 'showcase', http.get(`${BASE_URL}/v1/experience/public/demo-scenarios`)) || failed;
  });

  if (config.tenantCode) {
    const tenantSlug = pick(config.tenantPageSlugs);
    group('tenant public site', () => {
      failed = timedOk('tenant site', 'page', http.get(
        `${BASE_URL}/v1/public/sites/${encodeURIComponent(config.tenantCode)}`
      )) || failed;
      failed = timedOk('tenant page', 'page', http.get(
        `${BASE_URL}/v1/public/sites/${encodeURIComponent(config.tenantCode)}/pages/${encodeURIComponent(tenantSlug)}`
      )) || failed;
    });
  }

  publicFailed.add(failed);
  sleep(0.5);
}

function pick(items) {
  return items[(__ITER + __VU) % items.length];
}

function timedOk(name, bucket, response) {
  const ok = check(response, {
    [`${name} 2xx`]: (r) => r.status >= 200 && r.status < 300,
  });
  if (bucket === 'page') {
    pageDuration.add(response.timings.duration);
  } else if (bucket === 'asset') {
    assetDuration.add(response.timings.duration);
  } else {
    showcaseDuration.add(response.timings.duration);
  }
  return !ok;
}

