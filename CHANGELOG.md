# Changelog

## [1.0.0-RC1] - 2026-07-02

### Added

- GitHub Actions CI workflow for backend tests, frontend build, and Docker image validation.
- Backend Jest integration + unit test coverage using `jest`, `supertest`, and `mongodb-memory-server`.
- Lightweight migration runner and initial MongoDB index migration.
- Docker Compose stack with MongoDB and backend service.
- `backend/DB_README.md`, `backend/MIGRATIONS.md`, and `backend/SECURITY.md` documentation files.
- `backend/src/app.js` test-friendly app export and test-only middleware behavior.
- API request validation and safety hardening with Helmet, HPP, XSS cleaning, and Mongo sanitization.
- Frontend build validation and React/Vite project setup.

### Changed

- Backend `src/utils/passcode.js` now exports `generate` alias for compatibility.
- Test files updated to use valid email and phone formats under validation rules.
- `backend/package.json` now includes `test:ci` command for CI coverage runs.
- `backend/tests/visitor.int.test.js` and `backend/tests/auth.int.test.js` guard MongoDB setup and teardown.

### Fixed

- Resolved Jest runtime incompatibility with ESM-only `uuid` package in `src/middleware/requestContext.js`.
- Avoided security middleware interference during Jest test execution by conditioning middleware when `NODE_ENV==='test'`.
- Corrected test scaffolding so full backend suite passes in RC1.
