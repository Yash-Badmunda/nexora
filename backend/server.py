import os
from dotenv import load_dotenv
load_dotenv()

import logging
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from core import db, hash_password, verify_password, now_iso, new_id
import routes_auth, routes_business, routes_client, routes_admin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexora")

app = FastAPI(title="NEXORA API", version="1.0.0")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_auth.router)
app.include_router(routes_business.router)
app.include_router(routes_client.router)
app.include_router(routes_admin.router)


@app.get("/api/health")
async def health():
    return {"status": "online", "service": "NEXORA", "time": now_iso()}


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Something went wrong. Please try again."})


async def _seed_demo_client(client_id: str, name: str, business: str):
    if await db.projects.count_documents({"client_id": client_id}) > 0:
        return
    today = datetime.now(timezone.utc)

    def d(days):
        return (today + timedelta(days=days)).date().isoformat()

    p1 = new_id("prj")
    await db.projects.insert_many([
        {"project_id": p1, "client_id": client_id, "name": f"{business} — Business Website",
         "type": "Business Website", "status": "in_progress", "progress": 65,
         "created_at": now_iso(), "updated_at": now_iso()},
        {"project_id": new_id("prj"), "client_id": client_id, "name": "Google Business Profile Setup",
         "type": "Local SEO", "status": "review", "progress": 90,
         "created_at": now_iso(), "updated_at": now_iso()},
    ])
    await db.tasks.insert_many([
        {"task_id": new_id("tsk"), "client_id": client_id, "project_id": p1,
         "title": "Approve homepage design", "status": "todo", "due_date": d(2)},
        {"task_id": new_id("tsk"), "client_id": client_id, "project_id": p1,
         "title": "Share business photos & logo", "status": "in_progress", "due_date": d(4)},
        {"task_id": new_id("tsk"), "client_id": client_id, "project_id": p1,
         "title": "Finalize service descriptions", "status": "done", "due_date": d(-3)},
    ])
    await db.appointments.insert_many([
        {"appointment_id": new_id("apt"), "client_id": client_id, "service": "Project Kickoff Call",
         "date": d(3), "time": "11:00", "status": "scheduled", "notes": "Discuss content & timeline"},
    ])
    inv1 = new_id("inv")
    await db.invoices.insert_many([
        {"invoice_id": inv1, "client_id": client_id, "number": "NX-1001", "amount": 9000,
         "currency": "INR", "status": "unpaid", "due_date": d(7),
         "items": [{"label": "Business Website", "amount": 9000}], "created_at": now_iso()},
        {"invoice_id": new_id("inv"), "client_id": client_id, "number": "NX-1000", "amount": 4000,
         "currency": "INR", "status": "paid", "due_date": d(-10),
         "items": [{"label": "Advance", "amount": 4000}], "created_at": now_iso()},
    ])
    await db.payments.insert_many([
        {"payment_id": new_id("pay"), "client_id": client_id, "invoice_id": "NX-1000",
         "amount": 4000, "currency": "INR", "status": "success", "provider": "cashfree",
         "created_at": now_iso()},
    ])
    await db.messages.insert_many([
        {"message_id": new_id("msg"), "client_id": client_id, "sender": "admin", "sender_name": "NEXORA",
         "body": f"Welcome to your NEXORA command center, {name.split()[0]}! Your website is 65% complete.",
         "read": True, "created_at": now_iso()},
    ])
    await db.files.insert_many([
        {"file_id": new_id("file"), "client_id": client_id, "name": "Brand-Guidelines.pdf",
         "size": 482112, "mime": "application/pdf", "created_at": now_iso()},
        {"file_id": new_id("file"), "client_id": client_id, "name": "Homepage-Mockup-v2.png",
         "size": 1284220, "mime": "image/png", "created_at": now_iso()},
    ])


async def _seed_sample_leads():
    if await db.leads.count_documents({}) > 0:
        return
    samples = [
        {"type": "quote", "name": "Ananya Rao", "business": "Spice Route Cafe", "email": "ananya@example.com",
         "whatsapp": "+91 90000 11111", "timeline": "ASAP", "lead_temp": "HOT", "status": "new",
         "ai_summary": "Ananya (Spice Route Cafe) wants a business website with online booking, urgent timeline.",
         "config": {"package": "business", "features": ["booking", "google_business"], "websiteType": "Restaurant"},
         "created_at": now_iso()},
        {"type": "contact", "name": "Rahul Verma", "business": "FitZone Gym", "email": "rahul@example.com",
         "whatsapp": "+91 90000 22222", "service": "Local SEO", "budget": "8000", "timeline": "this month",
         "lead_temp": "WARM", "status": "new",
         "ai_summary": "Rahul (FitZone Gym) enquired about Local SEO, budget ~8000, this month.",
         "created_at": now_iso()},
    ]
    await db.leads.insert_many(samples)


async def seed():
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_pw = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({"email": admin_email, "password_hash": hash_password(admin_pw),
                                   "name": "NEXORA Admin", "role": "admin", "business": "NEXORA",
                                   "created_at": now_iso()})
    elif not verify_password(admin_pw, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_pw)}})

    client_email = os.environ.get("DEMO_CLIENT_EMAIL", "client@nexora.in").lower()
    client_pw = os.environ.get("DEMO_CLIENT_PASSWORD", "NexoraClient@2026")
    client = await db.users.find_one({"email": client_email})
    if not client:
        res = await db.users.insert_one({"email": client_email, "password_hash": hash_password(client_pw),
                                         "name": "Ananya Rao", "role": "client", "business": "Spice Route Cafe",
                                         "phone": "+91 90000 11111", "email_verified": True, "created_at": now_iso()})
        client_id = str(res.inserted_id)
    else:
        client_id = str(client["_id"])
        if not verify_password(client_pw, client["password_hash"]):
            await db.users.update_one({"email": client_email}, {"$set": {"password_hash": hash_password(client_pw)}})
    await _seed_demo_client(client_id, "Ananya Rao", "Spice Route Cafe")
    await _seed_sample_leads()


@app.on_event("startup")
async def startup():
    try:
        await db.users.create_index("email", unique=True)
        await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
        await db.login_attempts.create_index("identifier")
        await db.projects.create_index("client_id")
        await db.leads.create_index("created_at")
    except Exception as e:
        logger.warning(f"Index creation: {e}")
    await seed()
    logger.info("NEXORA API ready.")
