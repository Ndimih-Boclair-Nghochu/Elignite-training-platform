# Neon Setup Guide

This project currently develops against SQLite. To move it to Neon for production, use this order:

## 1. Create your Neon database

1. Sign in to [Neon](https://neon.com/docs/get-started-with-neon/connect-neon).
2. Create a new project.
3. Create or select:
   - branch: `main`
   - database: `elignite`
   - role: a dedicated app user
4. Copy both connection strings from Neon:
   - pooled connection string
   - direct connection string

Neon’s docs show that pooled strings use `-pooler` in the hostname, while direct strings do not:
- [Connecting Neon to your stack](https://neon.com/docs/get-started-with-neon/connect-neon)
- [Connection pooling](https://neon.com/docs/connect/connection-pooling)

## 2. Update Prisma for PostgreSQL

Change `prisma/schema.prisma` from SQLite to PostgreSQL:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

Use the pooled URL for app traffic and the direct URL for schema work. Neon recommends direct connections for migrations and admin operations, and Prisma supports standard Postgres connection URLs:
- [Neon connection pooling notes](https://neon.com/docs/connect/connection-pooling)
- [Prisma connection URL reference](https://www.prisma.io/docs/orm/reference/connection-urls)

## 3. Set environment variables

In local `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@YOUR-POOLER-HOST.neon.tech/elignite?sslmode=require&channel_binding=require"
DIRECT_DATABASE_URL="postgresql://USER:PASSWORD@YOUR-DIRECT-HOST.neon.tech/elignite?sslmode=require&channel_binding=require"
SESSION_SECRET="your-long-random-secret"
```

In Vercel Project Settings -> Environment Variables, set:

```text
DATABASE_URL
DIRECT_DATABASE_URL
SESSION_SECRET
```

## 4. Generate the SQL migration script

After changing the Prisma datasource to PostgreSQL, generate the SQL Prisma wants to run:

```powershell
npx prisma generate
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/neon-init.sql
```

This gives you a real SQL file for the full schema, including tables, indexes, unique constraints, and foreign keys.

## 5. Apply the SQL to Neon

Run the generated SQL against Neon using the direct connection string:

```powershell
psql "$env:DIRECT_DATABASE_URL" -f prisma/neon-init.sql
```

If `psql` is not installed, use the Neon SQL Editor and paste the contents of `prisma/neon-init.sql`.

## 6. Seed the production-ready starter data

After the schema exists:

```powershell
npm run db:seed
```

This creates the ELIGNITE starter records and demo accounts defined in `src/db/seed.ts`.

## 7. Recommended production commands

Use these commands in order:

```powershell
npx prisma generate
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/neon-init.sql
psql "$env:DIRECT_DATABASE_URL" -f prisma/neon-init.sql
npm run db:seed
npm run build
```

For later deployments, move to checked-in Prisma migrations and use:

```powershell
npx prisma migrate dev --name init_postgres
npx prisma migrate deploy
```

## 8. Verification SQL

Run these checks in Neon SQL Editor or `psql`:

```sql
SELECT current_database(), current_user;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT COUNT(*) AS users_count FROM "User";
SELECT COUNT(*) AS programs_count FROM "Program";
SELECT COUNT(*) AS students_count FROM "Student";
SELECT COUNT(*) AS teachers_count FROM "Teacher";
```

## 9. Relationship verification SQL

Use these queries to confirm the main relationships are working:

```sql
SELECT u.id, u.email, s."studentId", s.program
FROM "User" u
JOIN "Student" s ON s."userId" = u.id
LIMIT 10;

SELECT u.id, u.email, t."teacherId", t.department
FROM "User" u
JOIN "Teacher" t ON t."userId" = u.id
LIMIT 10;

SELECT p.id, p.title, t.id AS teacher_pk
FROM "Program" p
LEFT JOIN "Teacher" t ON t.id = p."teacherId"
LIMIT 10;

SELECT r.id, s."studentId", c.code, r.total, r.grade
FROM "Result" r
JOIN "Student" s ON s.id = r."studentId"
JOIN "Course" c ON c.id = r."courseId"
LIMIT 10;
```

## 10. Production notes

- Use the pooled URL in `DATABASE_URL` for the running app.
- Use the direct URL in `DIRECT_DATABASE_URL` for schema changes and heavy admin work.
- Set a strong `SESSION_SECRET`.
- After moving to Neon, remove local SQLite-only assumptions from deployment.
- Do not hand-maintain the schema in raw SQL long-term; let Prisma generate and track the SQL so your database stays aligned with the app.
