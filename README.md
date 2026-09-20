# NEXORA — Build. Grow. Get Found.

A production-ready, futuristic digital-agency website + client/admin platform for **NEXORA**.

- **Frontend:** React + Tailwind + Framer Motion
- **Backend:** FastAPI (modular)
- **Database:** MongoDB
- **Integrations:** OpenAI (server-side AI assistant + lead summaries), Resend (email), deterministic pricing engine

> From digital presence to physical visibility — NEXORA helps businesses get noticed online and offline.

---

## Features
- Immersive public site: interactive **NEXORA CORE** hero, service explorer, demo project worlds, pricing, process, about, FAQ, legal
- **Deterministic quote configurator** with a live estimate (AI never sets the price)
- Contact + booking flows (validation, rate limiting, spam honeypot)
- **AI assistant (NOVA)** + deterministic HOT/WARM/COLD lead classification
- **JWT auth** with ADMIN / CLIENT roles, brute-force lockout, password reset
- **Client workspace** (projects, tasks, messages, quotes, invoices, payments, files, settings)
- **Admin command center** (clients, leads, quotes, analytics, audit logs, messaging)
- Server-side authorization + per-client data isolation, security headers, SEO, accessibility

---

## Run locally with Docker (recommended)

Requirements: Docker + Docker Compose.

```bash
# from the repo root
docker compose up --build
```

Then open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/api/health

Optional (for email + AI to work locally), edit `docker-compose.yml` and fill:
- `OPENAI_API_KEY` — your OpenAI key (server-side only)
- `EMERGENT_EMAIL_KEY` — email provider key (server-side only)

The public site, pricing configurator and forms work fully **without** these keys.

### Demo logins (seeded on first start)
| Role   | URL             | Email               | Password           |
|--------|-----------------|---------------------|--------------------|
| Admin  | `/admin/login`  | admin@nexora.in     | NexoraAdmin@2026   |
| Client | `/login`        | client@nexora.in    | NexoraClient@2026  |

> `localhost` is a secure context, so auth cookies work over `http://localhost`.

---

## Run locally without Docker

**MongoDB** must be running locally (e.g. `mongod` on `mongodb://localhost:27017`).

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then fill values (MONGO_URL, JWT_SECRET, etc.)
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd frontend
yarn install
cp .env.example .env        # REACT_APP_BACKEND_URL=http://localhost:8001
yarn start
```

---

## Environment variables

All secrets are **server-side only** and are git-ignored (`.env`). Never commit real keys.
See `backend/.env.example` and `frontend/.env.example` for the full list.

Only `NEXT_PUBLIC_*` / `REACT_APP_*` variables are safe for the browser.

> **Security note:** if any key was ever committed or shared, rotate it. The `.gitignore`
> in this repo excludes all `.env` files so your keys are not pushed to GitHub.

---

## Project structure
```
backend/    FastAPI app (server.py, core.py, pricing.py, ai.py, emailer.py, routes_*.py)
frontend/   React app (src/pages, src/components, src/context)
docker-compose.yml
```

## Deferred (wire when you have keys)
- **Cashfree** payments (server-side order + signed webhook)
- **Google Calendar** booking (real availability + .ics export)

---

© NEXORA — India, serving worldwide.
