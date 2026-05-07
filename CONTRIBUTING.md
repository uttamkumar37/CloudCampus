# Contributing

## Branching

Always branch from `main`. Never commit directly to `main`.

```
<type>/<short-description>
```

| Type | When to use |
|---|---|
| `feature/` | New functionality |
| `fix/` | Bug fix |
| `hotfix/` | Urgent production fix |
| `refactor/` | Code cleanup, no behaviour change |
| `chore/` | Config, dependencies, tooling |
| `test/` | Adding or fixing tests |
| `docs/` | Documentation only |

**Examples:**
```bash
feature/website-builder-gallery-upload
fix/auth-jwt-expiry-refresh
refactor/fees-extract-mapper-layer
hotfix/tenant-schema-creation-failure
chore/upgrade-spring-boot-3.5
```

## Workflow

```bash
# Start from main
git checkout main && git pull origin main
git checkout -b feature/<what-you-are-building>

# Work, then commit
git add <specific files>
git commit -m "feat(module): what you did"

# Push and open Pull Request
git push -u origin feature/<what-you-are-building>
```

After the PR is merged:
```bash
git checkout main && git pull origin main
git branch -d feature/<what-you-are-building>
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(fees): add payment receipt PDF generation
fix(auth): resolve JWT refresh loop on token expiry
refactor(academic): extract DTO mapper layer
test(exam): add unit tests for grade boundary conditions
chore(deps): upgrade spring-boot to 3.4.5
docs(api): document admission leads endpoints
```

Format: `<type>(<scope>): <short description in present tense>`

## Pull Requests

- Keep PRs focused — one concern per PR
- Include a description of what changed and why
- Reference any related issues
- Ensure `mvn test` and `npm run build` pass before requesting review

## Code Standards

**Backend:**
- Follow existing package structure (`controller → service → repository`)
- Use `@PreAuthorize` for role checks — never inline role logic in controllers
- All API responses use `ApiResponse<T>` envelope
- New DB changes go through Flyway migrations — never alter tables manually
- Use `ADD COLUMN IF NOT EXISTS` for idempotent migrations

**Frontend:**
- Feature-sliced architecture — new features go in `src/features/<name>/`
- Server state via TanStack Query; local state via `useState`
- Use `cc-input`, `cc-badge-*` design system classes from `index.css`
- TypeScript strict mode — no `any`, no suppressed errors
- No comments unless the WHY is non-obvious

## Environment Setup

See [docs/SETUP.md](docs/SETUP.md) for local development setup.

## Testing

```bash
# Backend
cd backend && mvn test       # unit tests
cd backend && mvn verify     # + integration tests (requires Docker)

# Frontend
cd frontend && npm run build  # type-check + build
```
