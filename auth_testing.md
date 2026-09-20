# NEXORA Auth Testing

Admin: admin@nexora.in / NexoraAdmin@2026 (role admin)
Client: client@nexora.in / NexoraClient@2026 (role client)

## API test
```
curl -c c.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@nexora.in","password":"NexoraAdmin@2026"}'
curl -b c.txt http://localhost:8001/api/auth/me
```
Login returns {user, token} and sets access_token + refresh_token cookies.

## Cross-client isolation
- Client A must NOT see Client B's projects/tasks/invoices/messages/files.
- `/api/client/*` scopes every query by client_id = current user id (server-side).
- `/api/admin/*` requires role == admin (403 otherwise, no resource disclosure).
