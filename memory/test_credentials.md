# NEXORA — Test Credentials

## Admin (full command center)
- URL: `/admin/login`
- Email: `admin@nexora.in`
- Password: `NexoraAdmin@2026`
- Role: admin

## Demo Client (client workspace)
- URL: `/login`
- Email: `client@nexora.in`
- Password: `NexoraClient@2026`
- Role: client (seeded with demo projects, tasks, invoices, messages, files)

## Auth endpoints
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET  `/api/auth/me`
- POST `/api/auth/refresh`
- POST `/api/auth/forgot-password`
- POST `/api/auth/reset-password`

Auth uses httpOnly cookies (access_token, refresh_token) with a Bearer fallback.
Roles: `admin` (all data) and `client` (own data only, enforced server-side).
