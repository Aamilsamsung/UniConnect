# UniConnect

Connect. Learn. Grow.

This repository is the initial production foundation for a multi-university UniConnect platform. The primary security invariant is **university data is private by default; cross-university access exists only through explicit individual permissions**.

## Current implementation
- Next.js + React + TypeScript web app foundation.
- NestJS + TypeScript API foundation.
- PostgreSQL + Prisma schema with University/UniversityDomain tenancy.
- Server-side tenant authorization helpers.
- Community list/get/join APIs scoped to the authenticated user's university.
- Super-admin exception is explicit and role based.
- Helmet, CORS, cookies and strict validation are wired at the API boundary.
- Docker Compose for PostgreSQL and Redis.
- Automated tenant-isolation test covering same-university, cross-university denial, and super-admin access.

## Important
The environment used to generate this repository has no network/package registry access, so dependencies could not be installed and the Next/Nest runtime could not be executed here. The source was therefore not claimed as fully tested. Run the commands below in an environment with pnpm/network access.

## Run
```bash
cp .env.example .env
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate dev --name init
pnpm run db:seed
pnpm dev
```

## Verify
```bash
pnpm typecheck
pnpm test
pnpm build
```

## Tenant rules
Never accept `universityId` from the client as an authorization input. Derive the user's identity and university from the authenticated server-side session. For a resource, load its authoritative `universityId`, then compare it with `req.user.universityId`. Cross-university friendship/group membership does not change this boundary.

## Next implementation phases
1. Real auth/session middleware and university-email verification.
2. User/profile/privacy policies.
3. Posts/comments/reactions/follows/notifications.
4. Socket.IO conversations and cross-university privacy-aware messaging.
5. Communities/events/study/notes/leaderboards.
6. Admin RBAC and moderation.
7. AI/career/marketplace integrations.
8. Full integration/E2E/security test suite and deployment.
