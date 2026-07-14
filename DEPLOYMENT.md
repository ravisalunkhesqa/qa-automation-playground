# Deployment Guide

Deploy this project using Vercel for the frontend and Railway for the backend.

## 1. Prepare the repository

1. Create a GitHub repository.
2. In your local project folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/<your-user>/<repo>.git
   git push -u origin main
   ```

## 2. Backend deploy with Railway

### Create a Railway project
1. Sign in to https://railway.app.
2. Create a new project.
3. Choose **Deploy from GitHub**.
4. Connect your GitHub account if needed.
5. Select this repository.
6. When Railway asks for the project path, choose `backend-api/`.

### Configure Railway build & start
1. Set the start command to:
   ```bash
   node server.js
   ```
2. Set the port to `5000` if Railway does not auto-detect it.

### Add environment variables
Add the backend environment values in Railway:
- `NEXT_PUBLIC_SUPABASE_URL` = `https://mudathgsbymbxhlsimsc.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_MwyiYeVQq_3Cr6mGNGpSzg_y8KXx6Av`

> Railway will use these values for the backend build and runtime.

### Deploy
1. Deploy the Railway project.
2. After deploy completes, copy the public service URL. Example:
   - `https://your-railway-app.up.railway.app`
3. Test the backend by opening:
   - `https://your-railway-app.up.railway.app/api/health`
   - `https://your-railway-app.up.railway.app/api/users`

## 3. Frontend deploy with Vercel

### Create a Vercel project
1. Sign in to https://vercel.com.
2. Create a new project.
3. Import from GitHub.
4. Select this repository.
5. Set the root directory to `frontend/`.

### Configure Vercel build
Vercel usually detects Vite automatically, but confirm:
- Framework: `Vite` or `Other`
- Build command: `npm run build`
- Output directory: `dist`

### Add frontend environment variables
Add these environment variables in Vercel:
- `VITE_SUPABASE_URL` = `https://mudathgsbymbxhlsimsc.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_MwyiYeVQq_3Cr6mGNGpSzg_y8KXx6Av`
- `VITE_API_BASE_URL` = `https://your-railway-app.up.railway.app/api`

> Replace `https://your-railway-app.up.railway.app` with your actual Railway backend URL.

### Deploy
1. Deploy the project.
2. Wait for Vercel to finish.
3. Open the Vercel URL.

## 4. Confirm full app wiring

1. Open your Vercel frontend URL.
2. The API Playground should now point at your Railway backend.
3. Test each method:
   - GET `/users`
   - POST `/users`
   - PUT `/users/:id`
   - PATCH `/users/:id`
   - DELETE `/users/:id`

If the frontend still uses `localhost`, verify that `VITE_API_BASE_URL` is configured correctly in Vercel.

## 5. Helpful notes

- The frontend uses the environment variable `VITE_API_BASE_URL` in `frontend/src/pages/ApiPlayground.tsx`.
- If you do not set `VITE_API_BASE_URL`, the app will fall back to `http://localhost:5000/api`.
- The backend uses the Supabase public values from `backend-api/.env` during Railway deployment.

## 6. Optional improvement

For cleaner backend environment naming, you can later change the backend code to use more conventional variables such as:
- `SUPABASE_URL`
- `SUPABASE_KEY`

Then update the Railway env vars accordingly.
