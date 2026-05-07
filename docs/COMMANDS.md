# Commands Reference

Complete reference for all commands used to develop, test, and deploy CloudCampus.

---

## Table of Contents

1. [Docker Commands](#1-docker-commands)
2. [Local Development (Manual)](#2-local-development-manual)
3. [Maven Commands](#3-maven-commands)
4. [Git Workflow](#4-git-workflow)
5. [Database Commands](#5-database-commands)
6. [CI/CD — GitHub Actions](#6-cicd--github-actions)
7. [Data Seeding Commands](#7-data-seeding-commands)
8. [Useful One-Liners](#8-useful-one-liners)

---

## 1. Docker Commands

### Start everything (recommended for local testing)
```bash
docker compose up --build
```

### Start in background (detached)
```bash
docker compose up --build -d
```

### Stop all containers
```bash
docker compose down
```

### Stop and remove volumes (⚠️ deletes DB data)
```bash
docker compose down -v
```

### Rebuild only the backend image (no cache)
```bash
docker compose build backend --no-cache
```

### Restart only one service
```bash
docker compose restart backend
docker compose restart frontend
docker compose restart postgres
```

### View logs
```bash
# All services
docker compose logs -f

# Backend only
docker compose logs backend --tail=100 -f

# Frontend only
docker compose logs frontend --tail=50 -f

# Postgres only
docker compose logs postgres --tail=30 -f
```

### Check running containers
```bash
docker compose ps
```

### Open a shell inside a container
```bash
docker exec -it cloudcampus-backend sh
docker exec -it cloudcampus-postgres psql -U postgres -d cloudcampus
```

### Remove all stopped containers and dangling images
```bash
docker system prune -f
```

---

## 2. Local Development (Manual)

> Use this when you want faster iteration without Docker rebuild.

### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 20+
- PostgreSQL 16 running locally

### Backend
```bash
cd backend

# Run with Maven (uses application.yml env vars)
mvn spring-boot:run

# Run with custom env vars inline
DB_URL=jdbc:postgresql://localhost:5432/campuscloud \
DB_USERNAME=postgres \
DB_PASSWORD=campuscloud_db_dev_2026! \
JWT_SECRET=<32+ char secret> \
BOOTSTRAP_ADMIN_PASSWORD=<super-admin-password> \
mvn spring-boot:run
```

### Frontend
```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev

# Start on a specific port
npm run dev -- --port 3000

# Build for production
npm run build

# Run frontend tests
npm test

# Run tests in watch mode
npm run test:watch

# Preview production build
npm run preview
```

---

## 3. Maven Commands

```bash
cd backend

# Compile only (fast check for errors)
mvn compile -q

# Run all tests
mvn test

# Run integration tests
mvn verify

# Package JAR (skip tests)
mvn clean package -DskipTests

# Package JAR (with tests)
mvn clean package

# Full verify (compile + test + package)
mvn clean verify

# Run a single test class
mvn test -Dtest=ExamServiceImplTest

# Skip test compilation entirely
mvn clean package -Dmaven.test.skip=true

# Download all dependencies offline
mvn dependency:go-offline

# Check for dependency updates
mvn versions:display-dependency-updates

# View dependency tree
mvn dependency:tree
```

---

## 4. Git Workflow

### Everyday workflow
```bash
# Check status
git status

# Stage all changes
git add .

# Stage specific file
git add backend/src/main/java/com/cloudcampus/config/SecurityConfig.java

# Commit
git commit -m "feat: your change description"

# Push to main
git push

# Pull latest from remote
git pull
```

### Branching (feature work)
```bash
# Create and switch to new branch
git checkout -b feature/your-feature-name

# Push branch to remote
git push -u origin feature/your-feature-name

# Merge branch into main (after review)
git checkout main
git merge feature/your-feature-name
git push
```

### Useful inspection
```bash
# View last 5 commits
git log --oneline -5

# View what changed in last commit
git show --stat HEAD

# View diff of unstaged changes
git diff

# View diff of staged changes
git diff --cached
```

---

## 5. Database Commands

### Connect to PostgreSQL (via Docker)
```bash
docker exec -it cloudcampus-postgres psql -U postgres -d campuscloud
```

### Connect to PostgreSQL (local install)
```bash
psql -U postgres -d campuscloud
```

### Useful SQL inside psql

```sql
-- List all schemas (tenants)
\dn

-- List all tables in current schema
\dt

-- Switch to a tenant schema
SET search_path TO greenwood;

-- List users in public schema
SELECT id, username, role FROM public.platform_users;

-- List tenants
SELECT id, name, schema_name, status FROM public.tenants;

-- List subscription plans

-- Repair flyway checksums after intentional SQL migration edits
flyway repair

-- Run demo seed data (single-school profile)
python3 scripts/seed_demo.py
SELECT * FROM public.subscription_plans;

-- Count students in a tenant
SET search_path TO greenwood;
SELECT COUNT(*) FROM students;

-- Exit psql
\q
```

### Reset database (⚠️ destructive — deletes all data)
```bash
docker compose down -v
docker compose up --build
```

---

## 6. CI/CD — GitHub Actions

## 7. Data Seeding Commands

```bash
# Minimal demo seed
python3 scripts/seed_demo.py

# Comprehensive dashboard seed
python3 scripts/seed_dashboard_data.py

# Recommended local env export before seeding
export $(cat .env | grep -v '#' | xargs)
```

## 8. Useful One-Liners

### Current status: DISABLED for local development

All three workflows are set to `workflow_dispatch` only (manual trigger). They will **not** run automatically on `git push`.

| Workflow file | Name | Trigger | Purpose |
|---|---|---|---|
| `ci-cd.yml` | CloudCampus CI/CD | Manual only ⚠️ | Build → Docker push → SSH deploy |
| `ci.yml` | Legacy CI | Manual only | Build + test only |
| `docker-publish.yml` | Legacy Docker Publish | Manual only | Push image to GHCR |

### To trigger a workflow manually
1. Go to your repo on GitHub
2. Click **Actions** tab
3. Select the workflow (e.g. *CloudCampus CI/CD*)
4. Click **Run workflow** → **Run workflow**

### To re-enable automatic CI/CD on push (production)

Edit `.github/workflows/ci-cd.yml` and restore:

```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:
```

### Required GitHub Secrets (for ci-cd.yml to work)

| Secret | Description |
|---|---|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub access token |
| `SERVER_HOST` | Production server IP/hostname |
| `SERVER_USER` | SSH username on server |
| `SERVER_SSH_KEY` | Private SSH key for server access |

Set secrets at: `GitHub repo → Settings → Secrets and variables → Actions`

---

## 7. Useful One-Liners

```bash
# Full clean restart (Docker) — use when something is stuck
docker compose down -v && docker compose up --build

# Check if backend is healthy
curl -s http://localhost:8080/actuator/health | python3 -m json.tool

# Test auth endpoint quickly
curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin12345"}' | python3 -m json.tool

# Watch backend logs live
docker compose logs backend -f --tail=50

# Tail backend logs for errors only
docker compose logs backend -f | grep -i "error\|exception\|warn"

# Check what's running on port 8080
lsof -i :8080

# Kill process on port 8080
kill -9 $(lsof -ti :8080)

# Check Docker resource usage
docker stats --no-stream
```

---

