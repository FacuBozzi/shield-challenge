# Manual API Checks (cURL)

Use the commands below to stand up the stack and exercise every endpoint. Replace sample values as needed.

## 0. Prereqs

- Environment variables in `.env` (especially `DATABASE_URL`, `JWT_SECRET`) are configured.
- Docker is installed (to run Postgres via `docker compose`), or you already have a Postgres instance that matches `DATABASE_URL`.
- `pnpm install` has been run at least once.

## 1. Start infrastructure & apply schema

```bash
# Terminal 1: start Postgres
docker compose up -d db

# Generate Prisma client & apply migrations
pnpm db:generate
pnpm db:migrate

# (Optional but recommended) Seed a test user
pnpm seed
# or override credentials
SEED_USER_EMAIL=me@example.com SEED_USER_PASSWORD=ChangeMe123! pnpm seed
```

## 2. Launch the API

```bash
# Terminal 2
pnpm dev
```

Wait for the log `API ready on port 3000`.

## 3. Test endpoints via cURL

### Health check (no auth)

```bash
curl -i http://localhost:3000/health
```

Expect `200 OK` and `{"status":"ok"}`.

### Sign in

```bash
curl -i -X POST http://localhost:3000/signin \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com", "password": "ChangeMe123!" }'
```

> Use whatever credentials you seeded. The response body includes `{ "token": "...", "expiresIn": 3600, "user": { ... } }`.

Store the JWT for later steps (Mac/Linux):

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/signin \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com", "password": "ChangeMe123!" }' | jq -r '.token')
echo "Token: $TOKEN"
```

### List wallets (GET /wallets)

```bash
curl -i http://localhost:3000/wallets \
  -H "Authorization: Bearer $TOKEN"
```

Expect `200 OK` and an array (initially `[]`).

### Create wallet (POST /wallets)

```bash
curl -i -X POST http://localhost:3000/wallets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "tag": "Personal", "chain": "Ethereum", "address": "0x1234567890abcdef" }'
```

Expect `201 Created` and the wallet JSON (note the `id`).

### Retrieve wallet by id (GET /wallets/:id)

```bash
curl -i http://localhost:3000/wallets/1 \
  -H "Authorization: Bearer $TOKEN"
```

Adjust the ID to match the created wallet. Expect `200 OK` with the wallet payload.

### Update wallet (PUT /wallets/:id)

```bash
curl -i -X PUT http://localhost:3000/wallets/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "tag": "Main", "chain": "Ethereum", "address": "0x1234567890abcdef" }'
```

Expect `200 OK` and the updated wallet.

### Delete wallet (DELETE /wallets/:id)

```bash
curl -i -X DELETE http://localhost:3000/wallets/1 \
  -H "Authorization: Bearer $TOKEN"
```

Expect `204 No Content`. Re-run `GET /wallets` to confirm it’s gone.

### Sign out

```bash
curl -i -X POST http://localhost:3000/signout \
  -H "Authorization: Bearer $TOKEN"
```

Expect `200 OK`. Attempting another authenticated call with the same token should now return `401 Unauthorized`, demonstrating server-side revocation.

## 4. Cleanup

```bash
# Stop API (Ctrl+C in Terminal 2)
# Stop Postgres container
docker compose down
```
