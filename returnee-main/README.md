# Returnee One-App MVP

Single-folder Next.js app for the Returnee MVP.  
Frontend UI and backend API routes run in the same project with one command.

## Prerequisites

- Node.js 18+
- npm
- **PostgreSQL** database and `DATABASE_URL` (see below)

## Run Locally

```bash
cp .env.example .env
# Set DATABASE_URL to a Postgres connection string, then:
npm install
npx prisma migrate deploy   # or: npm run db:migrate (creates DB schema + destination tag sequence)
npm run dev
```

### Database

Returns, escrow fields, and destination tags are stored in Postgres via **Prisma**.

1. Create a database (e.g. [Neon](https://neon.tech), Supabase, Railway, or local Docker).
2. Set `DATABASE_URL` in `.env` (see `.env.example`).
3. Apply migrations: `npx prisma migrate deploy` (production/CI) or `npm run db:migrate` (development; will prompt for migration name if you add new ones).

The first migration creates the `returns` table and a `destination_tag_seq` sequence starting at **10001** (same behavior as the old in-memory counter).

Without a valid `DATABASE_URL`, API routes that touch returns will fail at runtime.

App runs at `http://localhost:3000`.

## Login

- Authentication uses **Google OAuth** via "Continue with Google".
- Roles are assigned by email list:
  - `ADMIN_EMAILS` -> admin
  - `COURIER_EMAILS` -> courier
  - any other signed-in email -> resident

## MVP Flow Implemented

1. Resident creates a return in `/dashboard`.
2. App assigns a destination tag and creates a conditional escrow.
3. Resident marks package as dropped into the bin from return details page.
4. Courier confirms pickup in `/courier`.
5. Escrow is finished and return status becomes `REFUND_RELEASED`.

## Scope Lock

- Single central Returnee XRPL account.
- Destination-tagged users under that account.
- One escrowed return flow only.
- One simulated courier pickup flow.
- Clean resident UI that explains benefits without requiring crypto knowledge.

## Deferred Features

- Hooks automation
- MPT/NFT package passporting
- Multisig hardening
- Fee-split automation
- Full production auth/compliance stack

## Environment

`.env`:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/returnee
XRPL_SERVER_URL=wss://s.altnet.rippletest.net:51233
XRPL_WALLET_SEED=your_testnet_seed
XRPL_DESTINATION_ADDRESS=your_returnee_account
AUTH_SECRET=your_random_secret
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=your_google_oauth_client_id
AUTH_GOOGLE_SECRET=your_google_oauth_client_secret
ADMIN_EMAILS=admin@yourdomain.com
COURIER_EMAILS=courier1@yourdomain.com,courier2@yourdomain.com
```

`AUTH_SECRET` and `NEXTAUTH_SECRET` must be the same value (middleware reads the JWT with `AUTH_SECRET`; NextAuth signs it with `NEXTAUTH_SECRET`).

If XRPL values are omitted, the app uses deterministic simulated transaction hashes for demo mode.
If `XRPL_WALLET_SEED` and `XRPL_DESTINATION_ADDRESS` are set, escrow calls are submitted to XRPL (testnet URL by default in `.env.example`).

## Deploying to Vercel

1. **Import the Git repo** and set **Root Directory** to `returnee-main` (this folder), not the monorepo root.
2. **Environment variables:** Add every key from [`.env.example`](.env.example) under Vercel → Project → Settings → Environment Variables (at least **Production**; add **Preview** if you want preview deployments to hit a DB).
   - **`NEXTAUTH_URL`:** your production URL, e.g. `https://your-project.vercel.app`.
   - **`DATABASE_URL`:** prefer your host’s **pooled** / serverless connection string for serverless functions (Neon pooler, Supabase pooler, etc.).
3. **Build:** This repo includes [`vercel.json`](vercel.json), which runs **`npm run build:vercel`** — that runs **`prisma migrate deploy`** then **`prisma generate`** then **`next build`**. Ensure **`DATABASE_URL`** is set for the build so migrations can connect.
4. **Google OAuth:** In Google Cloud Console, under the OAuth client’s **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google` (local)
   - `https://<your-vercel-domain>/api/auth/callback/google` (production)
5. **Monorepo:** [`next.config.mjs`](next.config.mjs) sets **`outputFileTracingRoot`** to the parent directory so Next.js file tracing behaves when another `package-lock.json` exists at the repo root.

After the first successful deploy, open the production URL and sign in with Google to verify auth and DB-backed returns.
