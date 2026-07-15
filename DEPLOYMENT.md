# SIVP — Deployment Guide

Deploy the **frontend to Vercel**, the **backend to Render**, with **GitHub Actions** running CI on every push.

```
Vercel (React)  ──VITE_API_URL──▶  Render (Spring Boot)  ──N8N_WEBHOOK_URL──▶  hosted n8n (10 agents)
```

> **Reality check:** everything except *live AI reports* is client-side, so **the Vercel frontend alone is a fully working incubator site** (auth, dashboards, showcase, events, schemes, opportunities…). The Render backend is only needed for the idea→report pipeline, which also requires a **publicly-hosted n8n** (localhost is unreachable from Render) and **Gemini billing** (free tier = 20 requests/day).

---

## 0. Prerequisites
- Code pushed to GitHub ✅ (`github.com/Chiraggupta0/Idea-Validation`)
- Free accounts: [vercel.com](https://vercel.com) and [render.com](https://render.com) (sign in with GitHub)

---

## 1. Deploy the frontend → Vercel
1. Vercel → **Add New → Project** → import the `Idea-Validation` repo.
2. **Root Directory:** click **Edit** → select **`web`**. (Critical — the app lives in `web/`.)
3. Framework preset auto-detects **Vite**. Build command `npm run build`, output `dist` (defaults are fine).
4. **Environment Variables:** add `VITE_API_URL` = your Render URL (you'll get it in step 2 — you can add it now as `https://sivp-backend.onrender.com` and adjust later).
5. **Deploy.** You'll get a URL like `https://idea-validation.vercel.app`.
   - `vercel.json` already handles SPA routing so deep links (`/showcase`, `/report`) don't 404.

## 2. Deploy the backend → Render
**Option A — Blueprint (easiest):**
1. Render → **New → Blueprint** → connect the repo. It reads `render.yaml` and creates the `sivp-backend` Docker service.
2. Set the env vars it asks for:
   - `CORS_ORIGINS` = your Vercel URL (e.g. `https://idea-validation.vercel.app`)
   - `N8N_WEBHOOK_URL` = your public n8n webhook (see step 3)
3. **Apply** → Render builds `backend/Dockerfile` and deploys. URL: `https://sivp-backend.onrender.com`.
4. Verify: open `https://sivp-backend.onrender.com/api/health` → `ok`.

**Option B — manual:** New → **Web Service** → repo → Root Directory `backend`, Runtime **Docker**, add the two env vars above.

> Render's free tier sleeps after inactivity — first request after idle takes ~30–60s to wake.

## 3. Host n8n publicly (for live reports)
Render can't reach your laptop's `localhost:5678`. Pick one:
- **n8n Cloud** ([n8n.io](https://n8n.io)) — easiest; import your workflows, get a `https://…n8n.cloud/webhook/validate-idea` URL.
- **Self-host n8n** on Render/Railway (Docker image `n8nio/n8n`).
- **Quick test only:** tunnel local n8n with `ngrok http 5678` and use the ngrok URL (not for production).

Put that public webhook URL in Render's `N8N_WEBHOOK_URL`. Also enable **Gemini billing** (free tier's 20 req/day can't run the 10-agent pipeline).

## 4. Connect the two
- Vercel `VITE_API_URL` = Render backend URL → **redeploy** the Vercel project (env changes need a rebuild).
- Render `CORS_ORIGINS` = Vercel URL → Render auto-redeploys.

## 5. GitHub Actions (already set up)
`.github/workflows/ci.yml` builds **both** frontend and backend on every push/PR to `main` — catches breakage before deploy.

**Deploys are automatic:** once the repo is connected, **Vercel and Render each auto-deploy on every push to `main`.** No deploy step needed in Actions. (Optional: add a Render **Deploy Hook** URL as a secret and `curl` it from a workflow if you want Actions to trigger deploys instead.)

---

## Recommended order
1. Push to GitHub (done) → watch **Actions** go green.
2. Deploy **backend on Render** → note its URL.
3. Deploy **frontend on Vercel** with `VITE_API_URL` = Render URL.
4. Set Render `CORS_ORIGINS` = Vercel URL.
5. (For live reports) host n8n + set `N8N_WEBHOOK_URL` + enable Gemini billing.
6. Open the Vercel URL — the full site works; submitting an idea now hits Render → n8n.
