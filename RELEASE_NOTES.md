# VSPM RC1 Release Notes

## Summary

Release Candidate 1 (RC1) is a production-ready preview of the Visitor Screening & Property Management Platform. This release includes a hardened backend, automated test coverage, Docker/CI support, and a validated frontend build.

## What’s included

- **Backend security hardening**
  - Helmet secure headers
  - HPP for HTTP parameter protection
  - `express-mongo-sanitize` for NoSQL injection prevention
  - `xss-clean` for input sanitization
  - global and auth-specific rate limiting

- **Testing and coverage**
  - Jest integration and unit tests
  - Supertest-based API integration testing
  - Coverage report via `npm run test:ci`
  - Test-friendly backend app export in `src/app.js`

- **Database and migrations**
  - Lightweight migration runner
  - MongoDB index migration for critical collections
  - `backend/MIGRATIONS.md` and `backend/DB_README.md`

- **DevOps and CI**
  - GitHub Actions workflow at `.github/workflows/ci.yml`
  - Docker Compose stack for local development
  - Backend Dockerfile validation via CI

- **Frontend validation**
  - React + Vite app build verified
  - Build pipeline included in CI

## How to validate

### Local backend

```bash
cd backend
npm ci
npm run migrate
npm run test:ci
npm start
```

### Local frontend

```bash
cd frontend
npm ci
npm run build
```

### Docker

```bash
docker compose up --build
```

### CI

Push to `main` or open a pull request to trigger GitHub Actions.

## Notes for reviewers

- Ensure `.env.example` values are replaced with strong production secrets before deployment.
- The backend test suite currently uses local MongoDB and test environment guards to avoid production middleware interference.
- `frontend/README.md` remains the default Vite template; main project use is documented in the top-level `README.md`.
