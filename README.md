# ezequiel_torres_art_backend

REST API backend for Ezequiel Torres' art portfolio. Built with a layered architecture (routes → middlewares → controllers → services → repositories → models) on top of Express, Mongoose and TypeScript, with JWT authentication and role-based access control.

## Architecture

```mermaid
flowchart TB
    Client(["HTTP Client<br/>Browser • Postman"])

    subgraph App["Express Application — src/index.ts"]
        direction TB
        Global["Global Middlewares<br/>helmet • cors • express.json"]

        subgraph Routes["Routing Layer — src/routes"]
            direction LR
            AuthR["/api/auth"]
            UserR["/api/users"]
        end

        subgraph MW["Route Middlewares — src/middlewares"]
            direction TB
            AuthMW["authenticate<br/>JWT verify → req.user"]
            RoleMW["authorize(roles)<br/>RBAC check"]
            ValMW["validate(schema)<br/>Zod parse"]
        end

        subgraph Ctrl["Controllers — src/controllers"]
            direction LR
            AuthC["AuthController"]
            UserC["UserController"]
        end

        subgraph Svc["Services — src/services"]
            direction LR
            AuthS["AuthService<br/>bcrypt.compare • jwt.sign"]
            UserS["UserService<br/>bcrypt.hash"]
        end

        subgraph Repo["Repositories — src/repositories"]
            UserRepo["UserRepository"]
        end

        subgraph Model["Models — src/models"]
            UserM["UserModel (Mongoose schema)"]
        end
    end

    subgraph Infra["Infrastructure"]
        DB[("MongoDB<br/>docker-compose")]
        Env["Env Config<br/>src/config/env.ts<br/>(Zod-validated)"]
    end

    Client -->|HTTP| Global
    Global --> Routes
    AuthR --> ValMW
    UserR --> AuthMW
    AuthMW --> RoleMW
    RoleMW --> ValMW
    ValMW --> Ctrl
    AuthC --> AuthS
    UserC --> UserS
    AuthS --> UserRepo
    UserS --> UserRepo
    UserRepo --> UserM
    UserM --> DB
    App -. reads .-> Env

    classDef client fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e,stroke-width:2px
    classDef global fill:#fef3c7,stroke:#d97706,color:#78350f,stroke-width:2px
    classDef routes fill:#ede9fe,stroke:#7c3aed,color:#4c1d95,stroke-width:2px
    classDef security fill:#fee2e2,stroke:#dc2626,color:#7f1d1d,stroke-width:2px
    classDef ctrl fill:#cffafe,stroke:#0891b2,color:#164e63,stroke-width:2px
    classDef svc fill:#dcfce7,stroke:#16a34a,color:#14532d,stroke-width:2px
    classDef repo fill:#ffedd5,stroke:#ea580c,color:#7c2d12,stroke-width:2px
    classDef model fill:#e0e7ff,stroke:#4f46e5,color:#312e81,stroke-width:2px
    classDef infra fill:#f3f4f6,stroke:#6b7280,color:#1f2937,stroke-width:2px
    classDef db fill:#fce7f3,stroke:#db2777,color:#831843,stroke-width:2px

    class Client client
    class Global global
    class AuthR,UserR routes
    class AuthMW,RoleMW,ValMW security
    class AuthC,UserC ctrl
    class AuthS,UserS svc
    class UserRepo repo
    class UserM model
    class Env infra
    class DB db

    style App fill:#f8fafc,stroke:#475569,color:#0f172a,stroke-width:2px
    style Routes fill:#faf5ff,stroke:#7c3aed,color:#4c1d95
    style MW fill:#fef2f2,stroke:#dc2626,color:#7f1d1d
    style Ctrl fill:#ecfeff,stroke:#0891b2,color:#164e63
    style Svc fill:#f0fdf4,stroke:#16a34a,color:#14532d
    style Repo fill:#fff7ed,stroke:#ea580c,color:#7c2d12
    style Model fill:#eef2ff,stroke:#4f46e5,color:#312e81
    style Infra fill:#f9fafb,stroke:#6b7280,color:#1f2937
```

**Request lifecycle (protected route):** the client sends an HTTP request → global middlewares (`helmet`, `cors`, `express.json`) run first → the router dispatches to the matching handler → `authenticate` verifies the JWT and attaches `req.user` → `authorize` checks the role against the allow-list → `validate` parses `body`/`query`/`params` with Zod → the controller delegates to a service → the service applies business rules (hashing, token signing) and calls the repository → the repository persists/reads through the Mongoose model → MongoDB.

## Tech Stack

| Layer                   | Technology                                         |
| ----------------------- | -------------------------------------------------- |
| Runtime                 | Node.js (target `node20`)                          |
| Language                | TypeScript (strict mode)                           |
| HTTP framework          | Express 5                                          |
| Database                | MongoDB via Mongoose                               |
| Validation              | Zod 4 (request schemas + env validation)           |
| Authentication          | `jsonwebtoken` (JWT) + `bcrypt` (password hashing) |
| Security headers / CORS | `helmet`, `cors`                                   |
| Config                  | `dotenv` + Zod schema validation                   |
| Dev runner              | `tsx` (watch mode)                                 |
| Bundler                 | `tsup` (esbuild-based)                             |
| Container               | `docker-compose` for MongoDB                       |

## Project Structure

```
src/
├── config/         # env (Zod-validated) and Mongo connection
├── controllers/    # thin HTTP handlers; no business logic
├── middlewares/    # authenticate, authorize, validate
├── models/         # Mongoose schemas + enums (UserRole)
├── repositories/   # data-access layer (Mongoose queries)
├── routes/         # Express routers per resource
├── schemas/        # Zod schemas + inferred input types
├── services/       # business logic (hashing, JWT, orchestration)
├── types/express/  # global Request augmentation (req.user)
└── index.ts        # app bootstrap
```

## Prerequisites

- Node.js 20+
- Docker and Docker Compose (for MongoDB)
- npm

## Setup

```bash
git clone https://github.com/MNATorres/ezequiel_torres_art_backend.git
cd ezequiel_torres_art_backend
npm install
cp .env.example .env   # then edit the values (see below)
docker compose up -d   # starts MongoDB on localhost:27017
npm run dev            # starts the API in watch mode
```

The server boots on `http://localhost:${PORT}` and exposes a health probe at `GET /health`.

## Environment Variables

All variables are validated at startup by `src/config/env.ts`. Missing or invalid values cause the process to exit with a descriptive error.

| Variable         | Required | Default       | Description                                     |
| ---------------- | -------- | ------------- | ----------------------------------------------- |
| `PORT`           | no       | `3000`        | HTTP port the server listens on                 |
| `NODE_ENV`       | no       | `development` | One of `development`, `production`, `test`      |
| `MONGO_URI`      | yes      | —             | MongoDB connection string (must be a valid URL) |
| `JWT_SECRET`     | yes      | —             | Secret used to sign JWTs (min. 10 chars)        |
| `JWT_EXPIRES_IN` | no       | `1d`          | JWT lifetime (e.g. `1h`, `7d`)                  |

Example `.env` for the bundled `docker-compose.yml`:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://admin:password123@localhost:27017/portfolio_db?authSource=admin
JWT_SECRET=replace-me-with-a-long-random-string
JWT_EXPIRES_IN=1d
```

## Available Scripts

| Script          | Purpose                                        |
| --------------- | ---------------------------------------------- |
| `npm run dev`   | Start the server in watch mode via `tsx`       |
| `npm run build` | Bundle to `dist/` via `tsup`                   |
| `npm start`     | Run the compiled bundle (`node dist/index.js`) |

Type-checking only (no emit): `npx tsc --noEmit`.

## API Overview

Base URL: `http://localhost:${PORT}/api`

| Method   | Path             | Auth | Roles          | Description                                                      |
| -------- | ---------------- | ---- | -------------- | -------------------------------------------------------------- |
| `GET`    | `/health`        | —    | —              | Liveness probe                                                  |
| `POST`   | `/auth/register` | —    | —              | Public sign-up; always creates a `USER`. Returns `{ token, user }` |
| `POST`   | `/auth/login`    | —    | —              | Returns `{ token, user }` on valid credentials                 |
| `GET`    | `/users`         | JWT  | `ADMIN`        | List users                                                      |
| `POST`   | `/users`         | JWT  | `ADMIN`        | Create user, including assigning a role (password hashed with bcrypt) |
| `GET`    | `/users/:id`     | JWT  | self or `ADMIN`| Get user by id                                                  |
| `PUT`    | `/users/:id`     | JWT  | self or `ADMIN`| Update user (password re-hashed if present; non-admins cannot change `role`) |
| `DELETE` | `/users/:id`     | JWT  | `ADMIN`        | Delete user                                                     |

Protected requests must include the header `Authorization: Bearer <token>`. Unauthenticated requests return `401`; authenticated requests with an insufficient role return `403`.

"self or `ADMIN`" means a non-admin may only act on their own record (matching `:id`); admins may act on any. On `PUT`, a non-admin attempting to set the `role` field is rejected with `403`.
