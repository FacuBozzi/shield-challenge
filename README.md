# Shield Challenge API

Backend API for authenticating users and managing their wallets. Built with Express, TypeScript, Prisma, and PostgreSQL.
_Note_: this challenge was developed solo on `main`; in a collaborative setting I would follow the usual PR flow (feature branches such as `feat/<name>`, etc etc.).

## Prerequisites

- Node.js 18+
- pnpm 8+
- Docker (for running PostgreSQL via `docker-compose`)

## Environment

Copy `.env` (already tracked) or export the variables before running the API.

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | HTTP port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://app:app@localhost:5432/app?schema=public` |
| `JWT_SECRET` | Secret used to sign JWTs | `replace-me` |
| `JWT_EXPIRES_IN` | Token TTL (`s`, `m`, `h`, `d`) | `1h` |

## Getting started

```bash
# Install dependencies
pnpm install

# Start postgres (or provide your own database)
docker compose up -d db

# Apply schema & generate Prisma client
pnpm db:generate
pnpm db:migrate

# (Optional) Seed a default user
pnpm seed                # uses env defaults
SEED_USER_EMAIL=me@example.com SEED_USER_PASSWORD=Str0ngPass pnpm seed
# (passwords must be ≥8 chars; rerunning with the same email resets that user's password)

# Start the API
pnpm dev                 # watch mode
# or
pnpm build && pnpm start
```

## API

All responses are JSON. Endpoints that are marked 🔒 require an `Authorization: Bearer <token>` header.

### Authentication

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| `POST` | `/signin` | `{ "email": "user@example.com", "password": "ChangeMe123!" }` | Returns `{ token, expiresIn, user }`. |
| `POST` | `/signout` 🔒 | _none_ | Revokes the provided JWT until it expires. |

### Wallets (🔒)

| Method | Path | Body |
| --- | --- | --- |
| `GET` | `/wallets` | – |
| `POST` | `/wallets` | `{ "tag": "Personal", "chain": "Ethereum", "address": "0x..." }` |
| `GET` | `/wallets/:id` | – |
| `PUT` | `/wallets/:id` | Same shape as `POST /wallets`. |
| `DELETE` | `/wallets/:id` | – |

Notes:

- You only ever interact with wallets that belong to your user.
- Validation and descriptive HTTP status codes are returned for invalid payloads, conflicts, or unauthorized requests.
- Sign-out invalidates the token server-side (in-memory). Restarting the API clears revoked tokens.

## Project structure

```
src/
 ├─ app.ts                # Express app wiring
 ├─ server.ts             # HTTP bootstrapper
 ├─ config/env.ts         # Environment loader + validation
 ├─ middlewares/          # Auth + error interceptors
 ├─ routes/               # Auth & wallet routes
 ├─ services/             # Business logic (auth, wallets, token store)
 ├─ utils/                # Helpers (JWT, password hashing, async handler)
 └─ schemas/              # Zod payload validations
```

Prisma schema + migrations live under `prisma/`. `prisma/seed.ts` can bootstrap a demo user.

## Testing & linting

The repo uses ESLint and Vitest. Sample commands:

```bash
pnpm lint
pnpm test
```

## Troubleshooting

- Always run `pnpm db:generate` after changing the Prisma schema to refresh the generated client.
- If `pnpm db:migrate` fails because Postgres is unavailable, ensure `docker compose up -d db` succeeded and that `DATABASE_URL` matches the container credentials.
