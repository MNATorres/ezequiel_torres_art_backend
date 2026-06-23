# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

REST API backend for Ezequiel Torres' art portfolio: Express 5 + Mongoose + TypeScript (strict, ESM-style imports compiled by `tsup`), with JWT auth and role-based access control.

## Commands

```bash
npm run dev          # start in watch mode (tsx)
npm run build        # bundle to dist/ via tsup (target node20)
npm start            # run the compiled bundle
npm test             # run all tests (node:test via tsx)
npm run lint         # eslint src/**/*.ts
npm run lint:fix     # eslint --fix
npm run format       # prettier --write
npx tsc --noEmit     # type-check only (no build step does this)
```

Run a single test file: `npx tsx --test src/services/auth.service.test.ts`
Tests are colocated as `*.test.ts`. They use the built-in `node:test` runner + `node:assert/strict` — **no Jest/Vitest**. Services are tested in isolation by injecting a fake repository through the constructor (see below); MongoDB is never touched in tests.

A running MongoDB is required for `npm run dev` (not for tests): `docker compose up -d`. Tests still import `src/config/env.ts`, so a valid `.env` (notably `JWT_SECRET` ≥ 10 chars and a URL-shaped `MONGO_URI`) must exist or the process exits at import time.

## Architecture

Strict layered flow, one direction only — a layer may only call the layer directly below it:

```
routes → middlewares → controllers → services → repositories → models → MongoDB
```

- **routes/** — wire middleware chains to controller methods. This is where auth/validation order is declared.
- **controllers/** — thin HTTP adapters. Methods are **arrow-function class properties** (preserves `this`) that read `req`, call one service method, set the status code, and `next(error)` on throw. No business logic, no try/catch beyond forwarding to `next`.
- **services/** — all business logic: hashing, token signing, existence checks, stripping `password` from responses. Throw `AppError` (never send a response).
- **repositories/** — the only place Mongoose query methods are called. Return raw documents/null.
- **models/** — Mongoose schemas + enums (e.g. `UserRole`).
- **schemas/** — Zod request schemas + inferred input types.
- **config/** — `env.ts` (Zod-validated, exits on invalid) and `db.ts`.

### Error handling (central, do not deviate)
Code never builds error responses inline in services/controllers. Instead:
- Services throw `AppError(statusCode, message)` (`src/utils/AppError.ts`).
- Controllers catch and call `next(error)`.
- `src/middlewares/error.middleware.ts` is the single translation point → `AppError` (uses its statusCode), `ZodError` (400), Mongo duplicate-key `code === 11000` (409), everything else (500). `notFound` + `errorHandler` are registered **last** in `src/index.ts`, after the routes.

When adding a failure case, throw an `AppError` from the service rather than returning an error shape.

### Validation
`validate(schema)` middleware (`src/middlewares/validate.middleware.ts`) parses an **envelope object** `{ body, query, params }`, so every Zod schema must nest its fields under those keys (see `src/schemas/user.schema.ts`). Inferred input types are extracted from the relevant key, e.g. `z.infer<typeof createUserSchema>['body']`. Mongo IDs are validated with the regex `/^[0-9a-fA-F]{24}$/`.

### Auth & RBAC (`src/middlewares/`)
- `authenticate` — verifies `Bearer` JWT, attaches `req.user = { id, role }` (Request augmented in `src/types/express/index.d.ts`). 401 on missing/invalid.
- `authorize([roles])` — allow-list check, 403 otherwise.
- `authorizeSelfOrAdmin` — permits ADMIN, or a user acting on their own `:id`.
- `preventRoleEscalation` — blocks non-admins from setting/changing the `role` field.

Middleware **order in the route matters**: `src/routes/user.routes.ts` applies `authenticate` once via `router.use`, then composes per-route `authorize`/`validate`/`authorizeSelfOrAdmin`/`preventRoleEscalation`. `AuthService.register` also hard-codes `UserRole.USER` so public registration can never create an admin.

### Dependency injection convention
Services and the auth service take their dependencies as **constructor parameters with `new ...()` defaults** (e.g. `constructor(userRepository = new UserRepository())`). Production code constructs them with no args; tests pass a fake. Preserve this pattern when adding services so they stay unit-testable.

## Lint rules that bite
ESLint (`eslint.config.cjs`) treats these as **errors**, not warnings: `@typescript-eslint/no-explicit-any`, `no-non-null-assertion` (no `!`), and `no-unused-vars` (prefix intentionally-unused args with `_`, as in the error middleware's `_next`, which must stay so Express recognizes the 4-arg error handler).

## Source of truth for routes
`README.md` documents the architecture and API, but the per-route guards in `src/routes/*.ts` are the authoritative spec: list/create/delete users are ADMIN-only, get/update use self-or-admin, and `POST /api/auth/register` always creates a `USER`. If the README and the route files ever disagree, trust the route files.
