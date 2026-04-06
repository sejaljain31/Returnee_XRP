# Returnee One-App MVP

Returnee is a return-and-refund workflow for apartment buildings. A resident creates a return, drops the package into a building collection bin, a courier picks it up, and the refund is released only after the merchant verifies the handoff. The application is built as a single Next.js app with server-rendered pages, API routes, Google OAuth, PostgreSQL persistence via Prisma, and XRPL-backed escrow.

## Why XRPL Is Core To This Project

XRPL is not an add-on in this app. It is the core trust and payout mechanism for the return flow.

- When a resident creates a return, the app creates an **XRPL EscrowCreate** transaction.
- Each return is assigned a **destination tag**, allowing a single Returnee XRPL account to track many users and returns safely.
- The escrow is locked against a generated fulfillment condition.
- After the package is picked up and the merchant verifies the QR code, the app submits **XRPL EscrowFinish** to release the refund.
- Transaction hashes are stored with the return record so the app can show an auditable on-chain trail.

In short: the refund state machine in the product is enforced by XRPL escrow rather than only by an internal database flag.

## Demo Flow

1. A resident signs in with Google.
2. The resident creates a return from `/dashboard`.
3. The app assigns a destination tag and locks the refund through XRPL escrow.
4. The resident marks the package as dropped into the bin.
5. A courier picks up the package from `/courier`.
6. A merchant scans the return QR code from `/merchant`.
7. The app finishes the XRPL escrow and marks the return as `REFUND_RELEASED`.

## Architecture

The project is intentionally built as one app so the product flow is easy to review and demo.

- **Frontend:** Next.js App Router pages for resident, courier, merchant, login, and admin views.
- **Backend:** Next.js route handlers under `app/api` for creating returns, marking bin drop-off, courier pickup, and merchant verification.
- **Auth:** Google OAuth through NextAuth with role assignment derived from configured email lists.
- **Database:** PostgreSQL with Prisma for return records, escrow metadata, owner data, timestamps, and destination-tag sequencing.
- **XRPL integration:** Shared server-side helpers create escrow conditions, submit XRPL transactions, and persist transaction hashes.

## Codebase Guide

- [`app/`](/Users/sejaljain/Documents/XRPLSBR/Returnee_XRP/returnee-main/app) contains pages, layouts, styling, and API routes.
- [`lib/returns-service.ts`](/Users/sejaljain/Documents/XRPLSBR/Returnee_XRP/returnee-main/lib/returns-service.ts) contains the main business workflow for return creation, pickup, verification, and refund release.
- [`lib/xrpl.ts`](/Users/sejaljain/Documents/XRPLSBR/Returnee_XRP/returnee-main/lib/xrpl.ts) creates and finishes XRPL escrows.
- [`lib/auth-options.ts`](/Users/sejaljain/Documents/XRPLSBR/Returnee_XRP/returnee-main/lib/auth-options.ts) configures Google sign-in and role-aware sessions.
- [`prisma/schema.prisma`](/Users/sejaljain/Documents/XRPLSBR/Returnee_XRP/returnee-main/prisma/schema.prisma) defines the database schema.
- [`prisma/migrations/`](/Users/sejaljain/Documents/XRPLSBR/Returnee_XRP/returnee-main/prisma/migrations) contains the SQL migrations for the MVP data model.

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL database
- Google OAuth client

### Environment Variables

Copy [`.env.example`](/Users/sejaljain/Documents/XRPLSBR/Returnee_XRP/returnee-main/.env.example) to `.env` and fill in the values:

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

Notes:

- `AUTH_SECRET` and `NEXTAUTH_SECRET` must match.
- `NEXTAUTH_URL` should be `http://localhost:3000` for local demoing.
- If XRPL credentials are omitted, the app falls back to deterministic simulated hashes for a non-chain demo path.
- If XRPL credentials are present, the app submits escrow transactions to XRPL Testnet.

### Run Locally

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npm run dev
```

The app runs at `http://localhost:3000`.

## Data Model

Each return stores:

- resident and address metadata
- merchant name
- QR code reference
- refund amount
- destination tag
- XRPL escrow condition
- escrow create and finish transaction hashes
- fulfillment secret
- release status

The database also maintains a destination-tag sequence so each return can be tracked uniquely under one XRPL account.

## Submission Notes

- This repository contains the complete project code for the MVP.
- The recommended demo path is a localhost recording.
- The project’s XRPL usage centers on escrow-based refund release and destination-tagged return tracking.

## Future Work

- stronger production deployment and secret management
- hooks-based automation
- MPT or NFT-based package passporting
- multisig hardening
- fee-splitting automation
- broader merchant and building operations support
