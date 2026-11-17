# NIRIKSHA — Complete Production Deployment Guide

This guide details how to deploy the full **NIRIKSHA Cyber Crime Analytics Workstation** (FastAPI backend + React 19 frontend) to the cloud for free, and how to keep the **Render free-tier instance alive 24/7 with zero cold starts**.

---

## Recommended Deployment Architectures

| Deployment Model | Backend Host | Frontend Host | Advantages | Monthly Cost |
|:---|:---|:---|:---|:---|
| **Option A (Recommended)** | **Render** (Web Service) | **Vercel** | Fastest global Edge CDN, 0s frontend cold start, independent CI/CD | **$0 / Free** |
| **Option B (All-in-One)** | **Render** (Web Service) | **Render** (Static Site) | Single unified Render dashboard via `render.yaml` Blueprint | **$0 / Free** |
| **Option C (Self-Hosted)** | **Docker Compose** | **Docker Compose** | Single VPS (Ubuntu/Debian on AWS, Hetzner, DigitalOcean) | VPS cost (~$4–6/mo) |

---

## Option A: Render (Backend) + Vercel (Frontend) — Step-by-Step

### Step 1: Deploy FastAPI Backend on Render
1. Go to [Render.com](https://render.com/) and sign up / log in with your GitHub account.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select **Build and deploy from a Git repository** and pick `cybercrime-analytics`.
4. Configure the Web Service settings:
   - **Name**: `niriksha-backend` (or your preferred name)
   - **Region**: Oregon (US West) or Singapore / Frankfurt
   - **Branch**: `main`
   - **Runtime**: **Python 3**
   - **Build Command**:
     ```bash
     pip install --upgrade pip && pip install -r requirements.txt && pip install -r backend/requirements.txt && python src/db_builder.py
     ```
   - **Start Command**:
     ```bash
     uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: **Free**
5. Add Environment Variables:
   - `PYTHONPATH`: `.`
   - `CORS_ORIGINS`: `*`
6. Click **Create Web Service**.
   - Render will build the SQLite warehouse and launch Uvicorn.
   - Once deployed, copy your backend URL: e.g., `https://niriksha-backend.onrender.com`.
   - Test it by visiting: `https://niriksha-backend.onrender.com/api/health`

---

### Step 2: Deploy React Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com/) and log in with GitHub.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your `cybercrime-analytics` repository.
4. In the Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select **`frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables**:
   - Key: **`VITE_API_BASE_URL`**
   - Value: `https://niriksha-backend.onrender.com/api` *(replace with your real Render URL from Step 1)*
6. Click **Deploy**.
   - Vercel will build and deploy the React 19 application in under 45 seconds with instant SSL!

---

## Option B: Deploy Everything on Render via Blueprint (`render.yaml`)

The repository includes a ready-to-use [`render.yaml`](./render.yaml) blueprint specification that automatically sets up both services:

1. Log in to [Render.com](https://render.com/).
2. Click **Blueprints** in the top navigation.
3. Click **New Blueprint Instance**.
4. Select your `cybercrime-analytics` repository.
5. Render will detect [`render.yaml`](./render.yaml) and automatically configure:
   - `niriksha-backend` (FastAPI Web Service)
   - `niriksha-frontend` (React Static Site with SPA rewrites)
6. Click **Apply**. Both backend and frontend will build and link automatically!

---

## How to Keep Render Live 24/7 on the Free Tier

### Why does Render sleep?
On Render's Free tier, Web Services automatically spin down into a sleep state after **15 minutes of inactivity** (no HTTP requests). When someone accesses the site later, the initial request takes **45–60 seconds** to wake up the server (cold start).

### Solution: Automated 24/7 Heartbeat Pingers

#### Method 1: Built-In GitHub Actions Keep-Alive (Zero Extra Accounts Needed!)
This repository already includes an automated workflow: [`.github/workflows/render-keep-alive.yml`](./.github/workflows/render-keep-alive.yml).

1. In your GitHub repository, go to **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
2. Click **New repository secret**:
   - Name: **`RENDER_BACKEND_URL`**
   - Secret: Your Render URL (e.g. `https://niriksha-backend.onrender.com`)
3. The GitHub Actions cron will now automatically send a lightweight heartbeat ping to `https://your-service.onrender.com/api/ping` every **12 minutes**.
4. Because the ping arrives before the 15-minute inactivity window expires, **Render never sleeps and stays awake 24/7**.

#### Method 2: Free External Uptime Pinger (Recommended Backup)
External pingers provide a second layer of insurance:

1. **UptimeRobot (Free)**:
   - Sign up at [UptimeRobot.com](https://uptimerobot.com/).
   - Click **Add New Monitor**.
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `NIRIKSHA Backend`
   - URL: `https://niriksha-backend.onrender.com/api/ping`
   - Monitoring Interval: `Every 5 minutes`
   - Click **Create Monitor**.
2. **Cron-Job.org (100% Free)**:
   - Sign up at [cron-job.org](https://cron-job.org/).
   - Create a cronjob pointing to `https://niriksha-backend.onrender.com/api/ping` scheduled every `10 minutes`.

---

## Option C: Self-Hosted Production Deployment (Docker Compose)

For a single dedicated cloud VM (e.g., AWS EC2, DigitalOcean Droplet, Hetzner, Linode):

```bash
# 1. Clone repository on the server
git clone https://github.com/kanwal-vyas/cybercrime-analytics.git
cd cybercrime-analytics

# 2. Build and launch multi-stage containers
docker compose up --build -d

# 3. Verify container health status
docker compose ps
```

- Frontend serves at `http://YOUR_SERVER_IP:80/`
- Backend API serves at `http://YOUR_SERVER_IP:8000/api/`
- Internal Nginx reverse proxy routes `/api/` calls seamlessly without cross-origin issues.

---

## Verification Checklist After Deployment

- [ ] Open `https://your-backend.onrender.com/api/health` $\rightarrow$ Returns `{"status":"ok","data_status":"validated"}`
- [ ] Open `https://your-backend.onrender.com/api/ping` $\rightarrow$ Returns `{"status":"alive"}`
- [ ] Open `https://your-frontend.vercel.app/` $\rightarrow$ Overview dashboard loads with all national KPIs ($86,420$ total)
- [ ] Open `https://your-frontend.vercel.app/operations` $\rightarrow$ Live Tactical Operations Center streams incident telemetry
- [ ] Open `https://your-frontend.vercel.app/explore` $\rightarrow$ India Choropleth map renders with SVG state boundaries
- [ ] Confirm GitHub Secret `RENDER_BACKEND_URL` is set to enable the 12-minute 24/7 keep-alive workflow.
