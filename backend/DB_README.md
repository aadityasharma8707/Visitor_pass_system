Database Review Summary
=======================

Scope
-----
This document summarizes index recommendations, repository optimizations, migration foundation, and seeding for RC1.

Indexes added / ensured
-----------------------
- `visitrequests`: indexes on `host, createdAt` (compound), `visitor`, `status`, and unique sparse index on `passCode`.
- `entrylogs`: unique index on `visitRequest`.
- `auditlogs`: indexes on `admin, createdAt` and `targetType, createdAt`.
- `users`: unique index on `email` and compound index on `role, isSuspended` to speed up host lookups.

Repository optimizations
------------------------
- List and read-only queries updated to use `.lean()` for lower memory overhead and faster serialization:
  - `RequestRepository`: `findPendingByHost`, `findApprovedWithLogs`, `findAllPopulated` now use `.lean()`.
  - `LogRepository`: `findLogsForRequests` uses `.lean()`.
  - `AuditRepository`: `findAllPopulated` uses `.lean()`.
  - `VisitorRepository`: `findByPhone` uses `.lean()`.
  - `UserRepository`: `findAll`, `findHosts` use `.lean()`.

Migration foundation
--------------------
- Lightweight migration runner: `backend/src/scripts/runMigrations.js`.
- Migrations placed in `backend/migrations/` and tracked in the `migrations` collection.
- Initial migration `0001-create-indexes.js` creates the critical indexes listed above.
- Run migrations locally with:

```bash
cd backend
npm run migrate
```

Seeding and test utilities
--------------------------
- Seed script: `backend/src/scripts/seedAdmin.js` creates an initial admin user if none exist.
- Integration test harness: `backend/test.js` performs end-to-end verification of Visitor, Host, Security, and Admin workflows.

Notes & Next steps
------------------
- Consider adding a stronger migration framework (e.g. `migrate-mongo`) for teams that require rollbacks and more advanced features.
- Add monitoring for index usage and slow queries in production (e.g. MongoDB Atlas Performance Advisor or Profiler).
- For very large collections, consider partial or TTL indexes where appropriate.

