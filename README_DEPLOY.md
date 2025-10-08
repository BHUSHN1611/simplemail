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

## Notes & Security
- Remove any committed `backend/.env` from git history if sensitive credentials were committed.
- Use strong JWT secret and rotate credentials if leaked.
- Configure Google OAuth redirect URIs for production domains.
