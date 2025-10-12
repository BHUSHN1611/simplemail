# Deployment Guide — Simplemail

This file explains two deployment approaches: Docker Compose (self-hosted) and managed (Vercel/Render/Railway + MongoDB Atlas).

## 1) Docker Compose (single host)

Prerequisites:
- Docker & Docker Compose installed on the server
- A MongoDB instance (Atlas recommended). If self-hosting MongoDB, ensure proper backups and security.

Steps:

1. Copy repository to the server:
   ```bash
   git clone <repo-url>
   cd simplemail
   ```

2. Create `backend/.env` with your production variables (do NOT commit):
   ```ini
   PORT=8080
   DB_URL=mongodb+srv://<user>:<password>@cluster0.../simplemail
   JWT_SECRET=very-strong-secret
   JWT_TIMEOUT=7d
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

3. Build and run:
   ```bash
   docker compose up -d --build
   docker compose logs -f
   ```

4. Visit your server IP or domain (HTTP port 80). For production use, put an HTTPS reverse proxy (Caddy / Nginx + Certbot) in front or use a load balancer.

## 2) Managed (recommended for free-tier)

- Frontend: deploy `frontend` on Vercel/Netlify
- Backend: deploy `backend` on Railway/Render
- Database: MongoDB Atlas free tier

Set env variables on platform dashboards (do not commit secrets).

## 3) Managed deployment (step-by-step) — Vercel (frontend) + Railway (backend) + MongoDB Atlas

This section gives exact steps, field names and environment variables so you can deploy on free tier services quickly.

### A. MongoDB Atlas (free cluster)
1. Create an Atlas account and a free M0 cluster.
2. Create a database user and note the username/password.
3. In "Network Access" add an IP access list entry; for quick testing you can allow 0.0.0.0/0 but restrict this in production.
4. Obtain the connection string (URI) and replace credentials: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/simplemail?retryWrites=true&w=majority`

### B. Railway (backend)
1. Sign up / login to Railway and create a new project.
2. Select "Deploy from GitHub" and choose the `backend` directory of this repo.
3. Railway will detect Node. If asked, set the Start Command to: `npm start`.
4. Add environment variables (Railway -> project -> Variables):
   - `DB_URL` = your Atlas connection URI
   - `JWT_SECRET` = long random string (e.g. `openssl rand -hex 32`)
   - `JWT_TIMEOUT` = `7d`
   - `GOOGLE_CLIENT_ID` = (from Google Cloud)
   - `GOOGLE_CLIENT_SECRET` = (from Google Cloud)
5. Deploy. Railway will give you a secure HTTPS URL (e.g. `https://simplemail-backend.up.railway.app`). Note the URL.

### C. Vercel (frontend)
1. Sign up / login to Vercel and import the GitHub repo.
2. When prompted for the project root, set it to `frontend`.
3. In Project Settings -> Environment Variables, set:
   - `VITE_API_BASE` = your Railway backend URL (e.g. `https://simplemail-backend.up.railway.app`)
   - `VITE_GOOGLE_CLIENT_ID` = Google client id
4. Build & Deploy. Vercel will produce a frontend URL (e.g. `https://simplemail.vercel.app`).

### D. Google Cloud OAuth settings
1. In Google Cloud Console -> APIs & Services -> Credentials, open your OAuth client.
2. Under "Authorized redirect URIs" add:
   - `https://<your-frontend>.vercel.app` (if you do any client-side redirect)
   - If your backend handles the OAuth callback, add: `https://<your-backend>.up.railway.app/auth/google/callback` (or the exact route used by your backend)
3. Save and copy the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` into Railway env variables.

### E. Final checks (after deploy)
- Visit the Vercel frontend URL and attempt login. The frontend will call the backend (`VITE_API_BASE`) which should be reachable.
- Test reading inbox, opening a message, and sending mail.
- If you see CORS errors, update the backend CORS to allow your Vercel origin or set CORS to the specific origin rather than `*`.

## 4) Security & housekeeping (must-do)
- Rotate exposed secrets immediately if they were pushed to any remote.
- Keep `.env` files locally; use platform secret managers.
- Add monitoring and backups for MongoDB.

## 5) Quick commands (local test before deploy)
Frontend
```powershell
cd frontend
npm install
npm run build
npm run preview   # optional to test the built files locally
```

Backend
```powershell
cd backend
npm install
$env:DB_URL="<your-db-uri>"
$env:JWT_SECRET="<your-secret>"
node index.js
```

---

If you want I can now: (pick one)
- Create the exact env variable entries in Railway and Vercel (I can prepare the exact values and where to paste them), OR
- Walk you through the Google redirect URL update step-by-step while you have the Google Console open, OR
- Create a GitHub Actions workflow that runs `npm run build` for the frontend and optionally triggers Vercel/Render deploys automatically.

