# VSPM

Visitor Screening & Property Management Platform

This repository contains the backend API and frontend user interface for the VSPM release candidate 1 (RC1).

## Repository structure

- `backend/` – Express + MongoDB backend API, authentication, validation, migrations, and test harness.
- `frontend/` – React + Vite frontend application.
- `.github/workflows/ci.yml` – GitHub Actions CI pipeline for backend tests, frontend build, and Docker validation.
- `docker-compose.yml` – local development stack with MongoDB and backend service.

## Release Candidate 1 (RC1)

This RC includes:

- Backend security hardening with Helmet, hpp, express-mongo-sanitize, xss-clean, and rate limiting.
- Integration tests and coverage with Jest + Supertest.
- Lightweight MongoDB migration runner and initial index setup.
- Docker build support and CI workflow.
- Frontend build validation and role-based visitor request workflows.

## Quick start

### Backend

1. Copy environment settings:

```bash
cd backend
cp .env.example .env
```

2. Install dependencies:

```bash
npm ci
```

3. Start locally:

```bash
npm start
```

4. Run tests with coverage:

```bash
npm run test:ci
```

5. Run migrations:

```bash
npm run migrate
```

6. Seed the initial admin user:

```bash
npm run seed
```

### Frontend

1. Install dependencies:

```bash
cd frontend
npm ci
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Docker

Start the application stack with Docker Compose:

```bash
docker compose up --build
```

The backend is exposed on `http://localhost:5000` and MongoDB on `mongodb://localhost:27017`.

## CI / GitHub Actions

CI validates the repository on push and pull request to `main`:

- `backend-tests` runs Jest with coverage and a MongoDB service.
- `frontend-build` installs frontend deps and builds the UI.
- `docker-build` validates the backend Dockerfile.

## Project documentation

See the backend documentation files for detailed operational guidance:

- `backend/DB_README.md`
- `backend/MIGRATIONS.md`
- `backend/SECURITY.md`

## Notes

- Use `backend/.env.example` as the environment template.
- The backend exports `app` from `backend/src/app.js` so the test harness can exercise routes directly.
- The project is intentionally kept minimal for RC1 while preserving future extensibility.
