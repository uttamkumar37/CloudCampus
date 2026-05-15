# CloudCampus Load & Stress Tests

k6-based load and stress test suite (CC-1703 / CC-1704).

## Prerequisites

```bash
brew install k6          # macOS
# or: https://k6.io/docs/getting-started/installation/
```

Ensure the target environment is running:

```bash
docker compose up -d     # local stack
# backend: mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

---

## Scripts

| Script | Purpose | VUs | Duration |
|--------|---------|-----|----------|
| `smoke.js` | Sanity-check all critical paths | 3 | 30 s |
| `load-auth.js` | Auth endpoint throughput | ramp → 50 | ~2 min |
| `load-reports.js` | Report aggregation under load | ramp → 20 | ~3 min |
| `stress.js` | Find the breaking point | ramp → 200 | ~6 min |

---

## Running

### Smoke test (run first)

```bash
k6 run infra/load-tests/smoke.js
```

### Auth load test

```bash
k6 run infra/load-tests/load-auth.js
```

### Reports load test

Requires school/year/exam UUIDs from your database:

```bash
k6 run \
  --env SCHOOL_ID=<uuid> \
  --env ACADEMIC_YEAR_ID=<uuid> \
  --env EXAM_ID=<uuid> \
  infra/load-tests/load-reports.js
```

### Stress test

```bash
k6 run infra/load-tests/stress.js
```

### Against staging

Pass `BASE_URL` to any script:

```bash
k6 run \
  --env BASE_URL=https://staging.cloudcampus.io \
  --env ADMIN_USERNAME=superadmin \
  --env ADMIN_PASSWORD=<secret> \
  infra/load-tests/smoke.js
```

---

## SLOs

| Metric | Target |
|--------|--------|
| p95 latency — auth | < 500 ms |
| p95 latency — reports | < 2 000 ms |
| p95 latency — stress | < 3 000 ms |
| Error rate (5xx) | < 1 % (load) / < 5 % (stress) |
| Rate-limit 429s | Excluded from error SLO — expected at high VU counts |

---

## Output interpretation

k6 prints a summary after each run. Key metrics:

```
http_req_duration ........: avg=142ms  min=11ms med=120ms  max=980ms  p(90)=310ms p(95)=450ms
http_req_failed ..........: 0.12%  ✓ 1488  ✗ 2
stress_rate_limited ......: 3.40%  (429s from API rate limiter — expected)
```

- `http_req_failed` — network-level failures + 4xx/5xx (except where explicitly excluded)
- `stress_rate_limited` — 429 responses tracked separately in stress test
- Custom `*_duration` trends show latency for specific operation types
