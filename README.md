# Collab Docs

A lightweight collaborative document editor — create, format, save, share, and import documents. Built for a timeboxed take-home assignment; see `architecture.md` for scope and tradeoffs.

## Features

- Create, rename, edit, save, and reopen documents
- Rich text formatting: bold, italic, underline, H1/H2 headings, bulleted/numbered lists
- Import a `.txt` or `.md` file (**only these two types are supported, 1MB max**) as a new document
- Share a document with another (seeded) user by email — owner vs shared documents are visually distinguished on the dashboard
- Mocked authentication — no real accounts/passwords, pick a seeded user from the login screen

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
| Bob | bob@example.com | Has shared access to Alice's demo document |
| Carol | carol@example.com | No documents yet — good for testing empty states and receiving a fresh share |

To test sharing: sign in as Alice, open her document, click **Share**, enter `carol@example.com`. Then switch user to Carol and confirm the document appears under "Shared with Me".

## Running tests

```bash
npm run test
```

Covers the access-control logic (`src/lib/access.ts`) that decides whether a user can open/edit a document.

## Project structure

```
src/app/                 pages (login, dashboard, documents/[id]) + API routes
src/components/          editor, toolbar, share dialog, document list, etc.
src/lib/                 auth, prisma client, validation (Zod), access control, sanitization
prisma/                  schema, migrations, seed script
tests/                   Vitest tests
```

## Deployment

Deployed on Railway (web service + Postgres plugin in the same project). See `SUBMISSION.md` for the live URL.
