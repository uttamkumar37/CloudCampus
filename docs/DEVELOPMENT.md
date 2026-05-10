# Development Guide

This is the canonical guide for local setup, day-to-day commands, testing, demo access, and contribution workflow.

## 1. Prerequisites

- Java 17
- Maven 3.8+
- Node.js 20+
- npm 10+
- Docker Desktop

## 2. Quick Start

### Docker workflow (recommended)

```bash
cp .env.example .env
# set DB_PASSWORD, JWT_SECRET, BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_PASSWORD

docker compose down -v
docker compose up --build
```

Services:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api/v1
- Swagger UI: http://localhost:8080/swagger-ui.html

### Manual workflow

Backend:

```bash
cd backend
export DB_URL="jdbc:postgresql://localhost:5432/cloudcampus"
export DB_USERNAME="postgres"
export DB_PASSWORD="your-password"
export JWT_SECRET="your-strong-secret-min-32-bytes"
export BOOTSTRAP_ADMIN_USERNAME="superadmin"
export BOOTSTRAP_ADMIN_PASSWORD="your-admin-password"
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
printf "VITE_API_BASE_URL=http://localhost:8080/api/v1\n" > .env.local
npm run dev
```

## 3. Environment Variables

Backend:

- `SERVER_PORT` (default `8080`)
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_ACCESS_TOKEN_EXPIRATION_MS`
- `BOOTSTRAP_ADMIN_USERNAME`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `BOOTSTRAP_ADMIN_ROLE`
- `APP_TENANT_SUBDOMAIN_ENABLED`
- `APP_TENANT_ROOT_DOMAINS`
- `APP_TENANT_RESERVED_LABELS`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

Frontend:

- `VITE_API_BASE_URL`

## 4. Demo Data

The JNV Lucknow demo tenant seeds automatically at startup when `app.seed.demo-enabled=true` (set in the Docker Compose environment). The seeder is idempotent — safe to restart.

Primary demo tenant:

- Tenant slug: `jnv-lucknow`
- School name: **Jawahar Navodaya Vidyalaya, Lucknow**
- Login URL: http://localhost:5173/login

Credentials:

| Role | Username | Password | Notes |
|---|---|---|---|
| School Admin (Principal) | `uttam.kumar` | `Uttam@2026!` | uttamkumar3797@gmail.com |
| School Admin (Vice Principal) | `priya.nehra` | `Priya@2026!` | uttamgaurav2020@gmail.com |
| All teachers | see below | `Jnv@Demo2026` | |
| All students | see below | `Jnv@Demo2026` | |
| All parents | `par.001`–`par.015` | `Jnv@Demo2026` | |

Teacher usernames: `anand.mishra`, `sunita.sharma`, `ramesh.oraon`, `kavita.sinha`, `deepak.singh`, `santosh.tiwari`, `sanjay.nath`, `meera.kumari`, `ashok.sharma`, `rekha.shriv`, `pooja.agarwal`

Student usernames: `s24001`–`s24006` (Class 12), `s23001`–`s23004` (Class 11), `s22001`–`s22004` (Class 10), `s21001`–`s21004` (Class 9), `s20001`–`s20004` (Class 8), `s19001`–`s19003` (Class 7), `s18001`–`s18003` (Class 6)

Super Admin URL: http://localhost:5173/super-admin/login
Super Admin credentials come from `BOOTSTRAP_ADMIN_USERNAME` and `BOOTSTRAP_ADMIN_PASSWORD`

## 5. Mobile Development

### Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli` (or use `npx expo`)
- For physical device: Expo Go app installed, or a development build via EAS

### Setup

```bash
cd mobile
npm install
```

Create `.env` in `mobile/`:

```bash
# Android emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api/v1

# iOS simulator
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1

# Real device (replace with your machine's LAN IP)
EXPO_PUBLIC_API_URL=http://192.168.1.xx:8080/api/v1
```

### Run

```bash
# Start Metro bundler + Expo dev server
npx expo start

# Start for specific platform
npx expo start --android
npx expo start --ios
```

### EAS Builds

```bash
# Development build (includes dev client, internal distribution)
npx eas build --profile development --platform android

# Preview build (APK, internal testers)
npx eas build --profile preview --platform android

# Production build (AAB, Play Store submission)
npx eas build --profile production --platform android
```

### Mobile login (demo)

School slug for all roles: `jnv-lucknow`

| Role | Example username | Password |
|---|---|---|
| School Admin | `uttam.kumar` | `Uttam@2026!` |
| School Admin (VP) | `priya.nehra` | `Priya@2026!` |
| Teacher | `anand.mishra` | `Jnv@Demo2026` |
| Student | `s24001` | `Jnv@Demo2026` |
| Parent | `par.001` | `Jnv@Demo2026` |

The login screen has a role picker — select the correct role before signing in. Each role gets a different set of tabs and screens after login.

## 6. Common Commands

Docker:

```bash
docker compose up --build
docker compose up --build -d
docker compose down
docker compose down -v
docker compose logs -f
docker compose logs backend --tail=100 -f
docker compose ps
```

Backend:

```bash
cd backend
mvn compile -q
mvn test
mvn verify
mvn clean package
mvn clean package -DskipTests
mvn dependency:tree
```

Frontend:

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
npm run test
```

Mobile:

```bash
cd mobile
npm install
npx expo start
npx expo start --android
npx expo start --ios
npx eas build --profile preview --platform android
```

Git:

```bash
git status
git checkout -b feature/<short-description>
git add <files>
git commit -m "feat(scope): short description"
git push -u origin feature/<short-description>
```

## 7. Testing

Recommended verification path:

```bash
cd backend && mvn test
cd backend && mvn verify
cd frontend && npm run lint
cd frontend && npm run build
cd frontend && npm run test
```

Current testing layers:

| Layer | Tooling | Notes |
|---|---|---|
| Backend unit tests | JUnit 5, Mockito | Fast service-level checks |
| Backend integration tests | Spring Boot, Testcontainers, Failsafe | Tenant/auth/domain flows |
| Frontend tests | Vitest, Testing Library | Focused component and utility coverage |
| Manual API validation | Swagger, Postman, curl | Useful for tenant-scoped flows |

Reports are written under `backend/target/surefire-reports/` and `backend/target/failsafe-reports/`.

## 8. Contribution Workflow

Branch naming:

```text
<type>/<short-description>
```

Common prefixes:

- `feature/`
- `fix/`
- `hotfix/`
- `refactor/`
- `chore/`
- `test/`
- `docs/`

Commit message format:

```text
<type>(<scope>): <short description>
```

Rules:

- Branch from `main`; do not commit directly to `main`
- Keep PRs focused to one concern
- Run backend tests and frontend build before review
- Keep backend changes inside the existing `controller -> service -> repository` layering
- Add schema changes through Flyway migrations only

## 9. Troubleshooting

- 401 loops: clear cookies/local storage and log in again
- Tenant errors: confirm `X-Tenant-Slug` is present on tenant-scoped requests
- Startup failures: confirm bootstrap admin and `JWT_SECRET` values are set
- Flyway failures: inspect backend startup logs and migration history
- Frontend API issues: verify `VITE_API_BASE_URL` matches the running backend
- Mobile — network unreachable on emulator: use `10.0.2.2` (Android) or `localhost` (iOS) as the API host, not `localhost`
- Mobile — network unreachable on real device: set `EXPO_PUBLIC_API_URL` to your machine's LAN IP, ensure device and machine are on the same Wi-Fi
- Mobile — login fails with 401: confirm tenant slug `jnv-lucknow` is entered exactly (case-sensitive)
- Mobile — Metro bundler cache: `npx expo start --clear`