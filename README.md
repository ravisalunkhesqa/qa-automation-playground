# qa-automation-playground

A demo QA automation playground with a React/Vite frontend and an Express/Supabase backend.

## Overview

- Frontend: `frontend/` using React, TypeScript, and Vite.
- Backend: `backend-api/` using Express and Supabase for CRUD on `playground_items`.

## Deployment

Deployed instances:

- Frontend (Vercel): https://qa-automation-playground.vercel.app/
- Backend (Render): https://qa-automation-playground.onrender.com

See `DEPLOYMENT_VERCEL_RENDER.md` and `DEPLOYMENT.md` for setup instructions.

## Quick Start (Local)

Prerequisites: Node.js >= 22, npm, and Git.

- Run the backend (from repo root):

```bash
cd backend-api
npm install
npm run dev
```

- Run the frontend (in a new terminal):

```bash
cd frontend
npm install
npm run dev
```

The frontend defaults to `http://localhost:5174` and the backend to `http://localhost:5000/api`.

## Environment

- Frontend: define `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and optionally `VITE_API_BASE_URL` for production.
- Backend: define `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the deployed Render service reads `backend-api/.env`).

## Testing

After starting both services locally, open the API playground page in the frontend and exercise:

- GET `/api/users`
- POST `/api/users`
- PUT `/api/users/:id`
- PATCH `/api/users/:id`
- DELETE `/api/users/:id`

## Notes

- If deploying, set `VITE_API_BASE_URL` in Vercel to your backend URL (e.g. `https://qa-automation-playground.onrender.com/api`).
- The deployment guides `DEPLOYMENT_VERCEL_RENDER.md` and `DEPLOYMENT.md` contain step-by-step instructions for Vercel/Render and Vercel/Railway setups.

---

If you'd like, I can also add a troubleshooting section or health-check scripts for CI.

## Troubleshooting

- **Cannot GET /**: ensure a root route exists (e.g. redirect to `/api/health`). Confirm `backend-api/server.js` contains `app.get('/', ...)` and redeploy.

- **Backend build or runtime fails with Supabase errors**: `@supabase/supabase-js` requires Node >= 22. Set `engines.node: ">=22"` in `backend-api/package.json` and configure the Node version in your host (Render/Platform) to 22+. If you see `native WebSocket not found`, upgrade Node or provide a WebSocket transport when creating the Supabase client.

- **Render/Yarn vs npm warnings**: If your repo has `package-lock.json`, use `npm install` as the build command on Render. Avoid mixing `yarn` and `npm` lockfiles.

- **Vercel TypeScript build errors (e.g. unused variable)**: reproduce locally with `npm run build`, fix the TypeScript error (we removed an unused `loading` state in `frontend/src/components/Layout.tsx`), commit, and redeploy.

- **CORS or API not reachable from frontend**: make sure `VITE_API_BASE_URL` in Vercel (Production env vars) points to the deployed backend (including `/api` suffix if used). Also verify the backend allows CORS (the app uses `cors()` middleware).

- **Large bundle warnings from Vite**: consider dynamic `import()` code-splitting, adjust `build.chunkSizeWarningLimit` in `vite.config.ts`, or configure `build.rollupOptions.output` to improve chunking.

- **Deployment logs & redeploy**: check your platform's deploy logs (Vercel/Render) for errors and redeploy after fixes. On Render, set the Node version and restart the service; on Vercel, set env vars and redeploy.

If you want, I can add automated health checks, a CI job to validate builds, or a small troubleshooting script that runs common checks locally.
