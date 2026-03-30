# Frontend Quickstart

React + Vite frontend for Returnee.

## Prerequisites

- Node.js 18+
- npm

## Start Server

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Environment

`frontend/.env`:

```bash
VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

If your backend runs on a different URL/port, update `VITE_API_URL` accordingly.
