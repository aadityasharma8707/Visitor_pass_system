Migration system
================

This repo includes a lightweight JS-based migrations system used for RC1.

How it works
------------
- Migrations are plain JS files stored in `backend/migrations/` and named with a sortable prefix (e.g. `0001-...`).
- Each migration exports an `up` async function: `module.exports.up = async ({ mongoose }) => { ... }`.
- The runner `backend/src/scripts/runMigrations.js` applies migrations in order and records applied migrations in the `migrations` collection.

Commands
--------
- Run migrations locally:

```bash
cd backend
npm run migrate
```

Creating new migrations
-----------------------
1. Add a new file to `backend/migrations/` with the next sequence number.
2. Export an `up` function that performs the desired DB changes using the `mongoose` connection.
3. Commit the migration and deploy; the runner will apply it in order.

Notes
-----
- This is intentionally minimal to avoid extra dependencies for RC.
- For larger projects consider using `migrate-mongo` or a full-featured migration tool.
