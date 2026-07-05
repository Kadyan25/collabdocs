# Collab Docs

A lightweight collaborative document editor — create, format, save, share, and import documents. Built for a timeboxed take-home assignment; see `architecture.md` for scope and tradeoffs.

## Features

- Create, rename, edit, save, and reopen documents
- Rich text formatting: bold, italic, underline, H1/H2 headings, bulleted/numbered lists
- Import a `.txt` or `.md` file (**only these two types are supported, 1MB max**) as a new document
- Share a document with another (seeded) user by email, as a **Viewer** (read-only) or **Editor** — owner vs shared documents are visually distinguished on the dashboard
- Mocked authentication — no real accounts/passwords, pick a seeded user from the login screen

**Stretch features** (beyond the core scope):
- Version history — every save keeps a snapshot; restore any previous version
- Export to Markdown (.md download) or PDF (browser print dialog)
- Presence indicator — see who else currently has a document open (poll-based, not real-time cursors)
- Comments — a per-document comment thread, open to anyone with access to the document

## Tech stack

Next.js (App Router) + TypeScript + Tailwind, Prisma + PostgreSQL, TipTap editor, Vitest.

## Prerequisites

- Node.js 20+ (developed on v24)
- Docker (for local Postgres)

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the env file:
   ```bash
   cp .env.example .env
   ```
3. Start local Postgres:
   ```bash
   docker compose up -d
   ```
4. Run migrations and seed data:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```
6. Open http://localhost:3000 — you'll land on the login screen.

## Seeded test accounts

No passwords — mocked auth, just pick a user from the login screen.

| User | Email | Notes |
|---|---|---|
| Alice | alice@example.com | Owns the demo document "Welcome to Collab Docs" |
| Bob | bob@example.com | Has **Editor** access to Alice's demo document |
| Carol | carol@example.com | No documents of her own — good for testing empty states and receiving a fresh share |

To test sharing: sign in as Alice, open her document, click **Share**, enter `carol@example.com`. Then switch user to Carol and confirm the document appears under "Shared with Me".

## Running tests

Unit tests (access control, import/export conversion, validation schemas):
```bash
npm run test
```

Integration tests (real HTTP requests against a dedicated `collabdocs_test` Postgres database — covers auth, document CRUD, access control, and sharing/role enforcement end to end):
```bash
npm run test:integration
```
This spins up its own Next.js server on port 3001 pointed at the test database, runs the suite, and tears the server down automatically. It won't touch your local dev database. Requires the `collabdocs_test` database to exist (`docker exec <postgres-container> psql -U collabdocs -d collabdocs -c "CREATE DATABASE collabdocs_test"` once, if it doesn't already).

## Project structure

```
src/app/                 pages (login, dashboard, documents/[id]) + API routes
src/components/          editor, toolbar, share dialog, document list, etc.
src/lib/                 auth, prisma client, validation (Zod), access control, sanitization
prisma/                  schema, migrations, seed script
tests/                   Vitest unit tests
tests/integration/       Vitest integration tests (real HTTP + real test DB)
```

## Deployment

Deployed on Railway (web service + Postgres plugin in the same project). See `SUBMISSION.md` for the live URL.
