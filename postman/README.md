# Postman — Ezequiel Torres Art Backend

Files in this folder:

- `ezequiel_torres_art.postman_collection.json` — the main API collection (Health, Auth, Users).
- `experiences.postman_collection.json` — Experiences ("Trayectoria") CRUD collection.
- `artworks.postman_collection.json` — Artworks ("Arte en Vivo" gallery) CRUD collection.
- `local.postman_environment.json` — environment pointing at `http://localhost:3000`.
- `cloud.postman_environment.json` — environment for the deployed API (edit `baseUrl`).

## How to import

1. In Postman: **Import** → drag the three JSON files (or **File → Import**).
2. Top-right **environment selector** → choose **Local** or **Cloud** to switch targets.
3. For Cloud, open the environment and set `baseUrl` to your real deployed URL.

## Variables

| Variable  | Used for                                   | How it's set                                   |
| --------- | ------------------------------------------ | ---------------------------------------------- |
| `baseUrl` | API host (switches Local ↔ Cloud)          | Per environment                                |
| `token`   | Bearer auth (`Authorization` header)       | Auto-saved by **Register** / **Login** scripts |
| `userId`  | `:id` segment in the Users requests        | Auto-saved by **Register** / **Login** scripts |
| `experienceId` | `:id` segment in the Experiences requests | Auto-saved by **Experiences → Create experience** |
| `artworkId` | `:id` segment in the Artworks requests   | Auto-saved by **Artworks → Create artwork**    |

## Typical flow

1. **Auth → Register** (or **Login**). The test script stores `token` and `userId`
   in the active environment automatically.
2. The **Users** requests reuse `{{token}}` (collection-level Bearer auth) and
   `{{userId}}` in the URL.

## Notes on permissions

- `GET /api/users`, `POST /api/users`, `DELETE /api/users/:id` → **ADMIN only**.
- `GET /api/users/:id`, `PUT /api/users/:id` → **owner or ADMIN**.
- A non-admin sending the `role` field on update gets **403**.

Since registration always creates a `USER`, to exercise the admin-only routes you
need a user whose `role` is `ADMIN` (promote one directly in MongoDB, or create it
from another admin account).
