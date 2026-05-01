# CloudCampus Frontend

React + TypeScript frontend for CloudCampus.

## Responsibilities

- School-first authentication flow (search school -> choose role -> login)
- Role-based routing and dashboard experience
- Tenant-aware API calls using X-Tenant-Slug
- Feature modules for academics, attendance, fees, exams, homework, timetable, parent, and super-admin

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: http://localhost:5173

## Environment

Create frontend/.env.local:

```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Folder Structure

```text
src/
  app/          app providers, routes
  api/          axios client, endpoint constants
  components/   shared UI and layouts
  features/     domain modules
  hooks/        shared hooks
  types/        cross-feature types
  utils/        storage, toast, helpers
```

## Auth and Tenant Notes

- JWT is stored in HttpOnly cookie (not in localStorage)
- localStorage stores only non-sensitive session metadata
- API client sends X-Tenant-Slug when tenant context exists

## Quality Commands

```bash
npm run lint
npm run build
```
