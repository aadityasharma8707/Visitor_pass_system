# Backend API

This folder contains the Express backend API for VSPM RC1.

## Setup

1. Copy the environment example:

```bash
cd backend
cp .env.example .env
```

2. Install dependencies:

```bash
npm ci
```

## Run locally

```bash
npm start
```

By default the server listens on `PORT` from `.env` (default `5000`).

## Testing

Run the full backend test suite with coverage:

```bash
npm run test:ci
```

## Database migration

Run the lightweight migration runner:

```bash
npm run migrate
```

## Seeding

Seed an initial admin user:

```bash
npm run seed
```

## Documentation

Operational documentation is available in:

- `DB_README.md` — database index and migration guidance.
- `MIGRATIONS.md` — migration runner usage.
- `SECURITY.md` — security hardening details.

## Notes

- The backend exports `app` from `src/app.js` so tests can exercise the HTTP application without starting a separate server.
- In test mode, security middleware is reduced to avoid interfering with automated integration tests.
- Use `backend/.env.example` to configure Mongo, JWT, port, and CORS origin.
