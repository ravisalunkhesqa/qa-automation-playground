# Deployment Guide: Vercel frontend + Render backend

Use this guide when you want to deploy the frontend on Vercel and the backend on Render.

## 1. Push your code to GitHub

1. Create a GitHub repository.
2. In your local project folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/<your-user>/<repo>.git
   git push -u origin main
   ```

## 2. Backend deploy with Render

### Create a Render service
1. Sign in to https://render.com.
2. Click **New** → **Web Service**.
3. Connect your GitHub account.
4. Select your repository.
5. Choose the `backend-api/` folder as the root.

### Set build and start commands
- Build command: `npm install`
- Start command: `node server.js`
- Environment: `Node 22` or later

> Do not use `yarn` for this backend service unless you add a `yarn.lock` file. Render detected a `package-lock.json`, so use `npm install`.
>
> If Render still deploys with Node 20, add this to `backend-api/package.json`:
> ```json
> "engines": {
>   "node": ">=22"
> }
> ```

### Add environment variables
In Render, add the following environment variables for the backend service:
- `SUPABASE_URL` = the exact value from your Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` = the exact service-role key from your Supabase project
- `SUPABASE_ANON_KEY` = the exact anon key from your Supabase project
- `SUPABASE_DB_URL` = copy the exact value of `POSTGRES_URL` from the Supabase Vercel integration
- `DATABASE_URL` = copy the exact value of `POSTGRES_URL` from the Supabase Vercel integration

In practice, both `SUPABASE_DB_URL` and `DATABASE_URL` should be set to the same exact Postgres connection string that Supabase exposes for your project. The backend code now also accepts these Vercel/Supabase synced aliases:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_HOST`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Deploy and verify
1. Deploy the service.
2. After deploy, copy the public URL, for example:
   - `https://your-backend-service.onrender.com`
3. Verify using:
   - `https://your-backend-service.onrender.com/api/health`
   - `https://your-backend-service.onrender.com/api/users`

## 3. Frontend deploy with Vercel

### Create a Vercel project
1. Sign in to https://vercel.com.
2. Click **New Project**.
3. Import from GitHub.
4. Select your repository.
5. Set the root directory to `frontend/`.

### Configure build and output
- Framework: Vite (auto-detected)
- Build command: `npm run build`
- Output directory: `dist`

### Add frontend environment variables
In Vercel, add these variables (production):
- `VITE_SUPABASE_URL` = the exact `SUPABASE_URL` value from your Supabase project
- `VITE_SUPABASE_PUBLISHABLE_KEY` = the exact publishable/anon key from your Supabase project
- `NEXT_PUBLIC_SUPABASE_URL` = the exact `SUPABASE_URL` value from your Supabase project
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = the exact publishable/anon key from your Supabase project
- `VITE_API_BASE_URL` = your deployed Render backend URL, for example `https://qa-automation-playground.onrender.com/api`

Replace the example `VITE_API_BASE_URL` above if you change your Render primary URL.

> If Supabase is connected through the Vercel integration, the synced values such as `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `POSTGRES_URL` are also accepted by the current code path.

### Deploy and verify
1. Deploy the Vercel project.
2. Open the frontend URL.
3. Confirm the app connects to the deployed backend.

## 4. Test the full app

From the deployed frontend:
- GET `/users`
- POST `/users`
- PUT `/users/:id`
- PATCH `/users/:id`
- DELETE `/users/:id`

If requests fail, re-check `VITE_API_BASE_URL` in Vercel.

## 5. Notes

- The frontend uses `VITE_API_BASE_URL` in `frontend/src/pages/ApiPlayground.tsx`.
- The backend reads Supabase values from `backend-api/.env` during Render deployment.
- Render may sleep after inactivity on the free tier, which can make the first request take longer.
