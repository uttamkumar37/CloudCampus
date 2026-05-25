# CI/CD Pipeline

## CI Required Checks
`CI / Backend - Build & Test` runs:
```bash
cd backend
mvn verify --batch-mode --no-transfer-progress
```

`CI / Frontend - TypeScript & Build` runs:
```bash
cd frontend
npm ci
npm run build
```

`Secret Scan - TruffleHog` scans pushed commits/PR diff for verified secrets.

## Mobile Validation
The mobile app is active again, but `ci.yml` still does not run a mobile job. Before mobile becomes release-blocking, add:

```bash
cd mobile
npm ci
npm run typecheck
npx expo export --platform android
```

## Security Nightly
OWASP Dependency Check and Trivy run in `security-nightly.yml` as the `Security — Release Gate` workflow on pull requests, main, release branches, nightly schedule, and manual dispatch. OWASP fails the job on CVSS >= 7 findings, and Trivy fails on HIGH or CRITICAL findings in the freshly built backend image for the current ref.

## Docker Publish
Docker Build & Push is skipped for feature branches and PRs because `docker-publish.yml` only runs on `main`, `release/**`, tags `v*`, or manual dispatch. It also assumes protected branches require CI to pass before merge; once backend CI passes and code reaches a publish trigger, Docker runs again.

## OpenAPI Publish
OpenAPI publish boots the backend with dev profile, fetches `/v3/api-docs`, uploads `openapi.json`, and updates the `openapi-spec` branch on main.
