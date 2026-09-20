# NEXORA — Product Requirements & Build Log

## Problem statement
Production, futuristic multi-page digital-agency website + client/admin platform for NEXORA
(Tagline: BUILD. GROW. GET FOUND.). Immersive "NEXORA CORE" brand world, deterministic quote
configurator, quote/contact/booking flows with email, AI assistant + lead classification,
JWT auth with ADMIN/CLIENT RBAC, client workspace + admin command center, strong security.

## Stack (adapted with user approval)
- Frontend: React (CRA) + Tailwind + Framer Motion + lucide-react + react-router
- Backend: FastAPI (modular) + MongoDB (motor)
- Auth: JWT httpOnly cookies, bcrypt, roles admin/client, brute-force lockout, reset tokens
- Email: Emergent-managed Resend (server-only) → notifications to yashbadmunda@gmail.com
- AI: OpenAI (user key, server-only, gpt-4o-mini) — chat assistant, lead summary
- Pricing: deterministic engine (pricing.py) — AI never sets price

## Brand system (from logo)
Dark graphite/near-black + electric cyan (#2cc6e8/#5ce1ff). Fonts: Chakra Petch (display),
Manrope (body), JetBrains Mono (numeric). Grid/HUD motifs, particle-network hero.

## Routes
Public: / /services /work /pricing /process /about /contact /faq /quote /book /privacy /terms
Auth: /login (client) /admin/login (admin)
Client dash: /dashboard + /projects /tasks /messages /quotes /appointments /invoices /payments /files /settings
Admin dash: /admin/dashboard + /clients /leads /quotes /appointments /invoices /payments /analytics /audit

## Implemented (2026-09-20)
- Full immersive public site (10-section home, interactive service explorer, demo project worlds,
  pricing, process timeline, about, FAQ accordion, legal).
- Interactive Quote Configurator with live deterministic estimate + submission (saves quote+lead, emails).
- Contact + Booking flows (Zod-like validation, honeypot, rate limiting, states). Booking = request-only
  (never invents availability); WhatsApp confirm fallback.
- AI chat widget (NOVA) with prompt-injection guardrails; deterministic HOT/WARM/COLD lead classification.
- JWT auth (register/login/logout/me/refresh/forgot/reset), admin + demo client seeded.
- Client workspace (overview, projects, tasks, messages, quotes, appointments, invoices, payments, files, settings).
- Admin command center (overview stats, clients + client drawer, leads + AI re-summarize + status, quotes,
  appointments, invoices, payments, analytics, audit logs, admin→client messaging, project create/update).
- Security: server-side RBAC (require_admin), per-client ownership scoping (default-deny, RLS-equivalent),
  security headers (CSP-adjacent, HSTS, X-Frame-Options, etc.), rate limiting, honeypots, safe error handling.
- SEO (per-page titles/meta, OG/Twitter, sitemap.xml, robots.txt, JSON-LD), analytics event tracking,
  reduced-motion support, responsive 320→1920.

## Verified (testing agent iteration_1)
- Backend 15/16 pytest pass. Deterministic pricing confirmed. Both CRITICAL security tests PASS:
  admin endpoints reject client tokens (403); cross-client isolation returns empty lists.
- Frontend: public pages, configurator live estimate, contact/booking, client+admin login, dashboards,
  route guards all working.
- Fixes applied: admin-login guard (blocks client on /admin/login), tz-aware lockout comparison.

## Known / environment notes
- MOCKED/DEFERRED: Cashfree payments and Google Calendar booking are NOT wired for v1 (booking stores a
  request + emails; payments show seeded demo data). Wire once keys/OAuth provided.
- The provided OpenAI key currently has NO CREDITS (credit_balance_exhausted) → live AI chat/summaries fall
  back to safe deterministic messages until credits are added. Lead classification (deterministic) unaffected.
- Managed email has a shared rate limit; heavy bursts return 429 (data still persists, UI shows "pending").

## Backlog / next (P1/P2)
- Wire Cashfree (server-side create order + signed webhook verification).
- Wire Google Calendar (OAuth refresh token) for real availability + .ics export.
- File uploads to object storage (signed URLs, MIME/size validation).
- n8n/Activepieces automation webhook on new lead.
- Password-reset email delivery (currently link logged server-side).
