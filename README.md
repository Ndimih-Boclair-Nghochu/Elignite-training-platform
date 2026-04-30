# ELIGNITE Training Platform

Production-oriented Next.js 14 training platform for ELIGNITE with:
- public marketing pages
- admissions and enrollment review flow
- CEO/admin dashboard
- teacher dashboard
- student dashboard
- partner admissions dashboard

This app uses:
- Next.js App Router
- Prisma ORM
- PostgreSQL in production
- `iron-session` cookie sessions

## Core flow

Students do **not** directly create active accounts from the public site.

Expected admissions flow:
1. Student submits an application / enrollment interest
2. CEO reviews the application
3. CEO approves or rejects it
4. Student can only activate or register portal access after approval

Teacher and partner access is also role-based and must be provisioned through admin-controlled flows.

## Environment variables

Create a local `.env` with values like:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
DIRECT_DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
SESSION_SECRET="use-a-long-random-secret-with-at-least-32-characters"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Important:
- `DATABASE_URL` is required
- `SESSION_SECRET` is required in production
- do not commit secrets
- do not expose server-only keys through `NEXT_PUBLIC_*`

## Development

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

The production database is PostgreSQL.

Prisma schema:
- [C:\Users\pc\Downloads\computer-training-main\computer-training-main\prisma\schema.prisma](C:\Users\pc\Downloads\computer-training-main\computer-training-main\prisma\schema.prisma)

Helpful commands:

```bash
npm run db:push
npm run db:seed
npm run db:studio
```

Do not run destructive reset commands against production.

## Build and quality checks

```bash
npm run lint
npm run build
```

## Project structure

```text
src/app
  /api                 backend API routes
  /dashboard           CEO, teacher, student, and partner dashboards
  /enroll              public application flow
  /login               sign-in
  /register            approved student account registration
  /activate            pre-created account activation

src/lib
  prisma.ts            Prisma client
  session.ts           session helpers
  roles.ts             role normalization helpers
  server-auth.ts       server-side dashboard guards

prisma/schema.prisma   PostgreSQL Prisma schema
src/db/seed.ts         seed script
```

## Deployment

The app is designed for Vercel + PostgreSQL.

Set at least:
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`

For Neon-specific setup, see:
- [docs/NEON_SETUP.md](C:\Users\pc\Downloads\computer-training-main\computer-training-main\docs\NEON_SETUP.md)
