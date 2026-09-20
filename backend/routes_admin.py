from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId
from datetime import datetime, timezone

from core import (db, require_admin, hash_password, now_iso, new_id, audit,
                  public_user, rate_limit, client_ip)
import ai

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/overview")
async def overview(admin: dict = Depends(require_admin)):
    clients = await db.users.count_documents({"role": "client"})
    projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
    active = len([p for p in projects if p.get("status") not in ("completed", "archived")])
    pending_quotes = await db.quotes.count_documents({"status": {"$in": ["new", "reviewing"]}})
    new_leads = await db.leads.count_documents({"status": "new"})
    invoices = await db.invoices.find({}, {"_id": 0}).to_list(2000)
    outstanding = sum(i["amount"] for i in invoices if i.get("status") in ("unpaid", "overdue"))
    now = datetime.now(timezone.utc).isoformat()
    upcoming = await db.appointments.count_documents({"status": "scheduled", "date": {"$gte": now[:10]}})
    recent = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(8)
    audit_logs = await db.audit_logs.find({}, {"_id": 0}).sort("created_at", -1).to_list(6)
    return {
        "stats": {
            "totalClients": clients, "activeProjects": active,
            "pendingQuotes": pending_quotes, "upcomingAppointments": upcoming,
            "outstanding": outstanding, "newLeads": new_leads, "currency": "INR",
        },
        "recentLeads": recent,
        "recentActivity": audit_logs,
    }


@router.get("/clients")
async def clients(admin: dict = Depends(require_admin), q: str = ""):
    query = {"role": "client"}
    if q:
        query["$or"] = [{"name": {"$regex": q, "$options": "i"}},
                        {"email": {"$regex": q, "$options": "i"}},
                        {"business": {"$regex": q, "$options": "i"}}]
    users = await db.users.find(query).sort("created_at", -1).to_list(500)
    out = []
    for u in users:
        cid = str(u["_id"])
        out.append({
            **public_user(u),
            "projects": await db.projects.count_documents({"client_id": cid}),
            "invoices": await db.invoices.count_documents({"client_id": cid}),
        })
    return {"items": out}


@router.get("/clients/{client_id}")
async def client_detail(client_id: str, admin: dict = Depends(require_admin)):
    try:
        u = await db.users.find_one({"_id": ObjectId(client_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Not found")
    if not u or u.get("role") != "client":
        raise HTTPException(status_code=404, detail="Not found")

    async def lst(coll, key="client_id"):
        return await db[coll].find({key: client_id}, {"_id": 0}).to_list(500)

    return {
        "profile": public_user(u),
        "projects": await lst("projects"),
        "tasks": await lst("tasks"),
        "quotes": await db.quotes.find({"$or": [{"user_id": client_id}, {"email": u["email"]}]}, {"_id": 0}).to_list(200),
        "appointments": await lst("appointments"),
        "invoices": await lst("invoices"),
        "payments": await lst("payments"),
        "messages": await db.messages.find({"client_id": client_id}, {"_id": 0}).sort("created_at", 1).to_list(500),
        "files": await lst("files"),
    }


class ClientIn(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=8)
    business: str = ""
    phone: str = ""


@router.post("/clients")
async def create_client(body: ClientIn, admin: dict = Depends(require_admin)):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    doc = {"email": email, "password_hash": hash_password(body.password), "name": body.name,
           "role": "client", "business": body.business, "phone": body.phone,
           "email_verified": True, "created_at": now_iso()}
    res = await db.users.insert_one(doc)
    doc["_id"] = res.inserted_id
    await audit(admin, "client.create", str(res.inserted_id), {"email": email})
    return {"ok": True, "client": public_user(doc)}


@router.get("/leads")
async def leads(admin: dict = Depends(require_admin), temp: str = "", status: str = ""):
    query = {}
    if temp:
        query["lead_temp"] = temp.upper()
    if status:
        query["status"] = status
    items = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"items": items}


class LeadUpdate(BaseModel):
    status: str | None = None


@router.patch("/leads/{lead_id}")
async def update_lead(lead_id: str, body: LeadUpdate, admin: dict = Depends(require_admin)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if update:
        await db.leads.update_one({"lead_id": lead_id}, {"$set": update})
        await audit(admin, "lead.update", lead_id, update)
    return {"ok": True}


@router.get("/quotes")
async def quotes(admin: dict = Depends(require_admin)):
    items = await db.quotes.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"items": items}


@router.get("/appointments")
async def appointments(admin: dict = Depends(require_admin)):
    items = await db.leads.find({"type": "booking_request"}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    scheduled = await db.appointments.find({}, {"_id": 0}).sort("date", 1).to_list(1000)
    return {"requests": items, "scheduled": scheduled}


@router.get("/invoices")
async def invoices(admin: dict = Depends(require_admin)):
    return {"items": await db.invoices.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)}


@router.get("/payments")
async def payments(admin: dict = Depends(require_admin)):
    return {"items": await db.payments.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)}


@router.get("/files")
async def files(admin: dict = Depends(require_admin)):
    return {"items": await db.files.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)}


@router.get("/analytics")
async def analytics(admin: dict = Depends(require_admin)):
    pipeline = [{"$group": {"_id": "$event", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}]
    by_event = await db.analytics_events.aggregate(pipeline).to_list(100)
    total = await db.analytics_events.count_documents({})
    recent = await db.analytics_events.find({}, {"_id": 0}).sort("created_at", -1).to_list(20)
    return {"total": total, "byEvent": [{"event": e["_id"], "count": e["count"]} for e in by_event], "recent": recent}


@router.get("/audit")
async def audit_logs(admin: dict = Depends(require_admin)):
    return {"items": await db.audit_logs.find({}, {"_id": 0}).sort("created_at", -1).to_list(300)}


# ------------- Projects / tasks management -------------
class ProjectIn(BaseModel):
    client_id: str
    name: str
    type: str = "website"
    status: str = "discovery"
    progress: int = 0


@router.post("/projects")
async def create_project(body: ProjectIn, admin: dict = Depends(require_admin)):
    doc = {"project_id": new_id("prj"), **body.model_dump(),
           "created_at": now_iso(), "updated_at": now_iso()}
    await db.projects.insert_one({k: v for k, v in doc.items()})
    await audit(admin, "project.create", doc["project_id"], {"client_id": body.client_id})
    doc.pop("_id", None)
    return {"ok": True, "project": doc}


class ProjectUpdate(BaseModel):
    status: str | None = None
    progress: int | None = None
    name: str | None = None


@router.patch("/projects/{project_id}")
async def update_project(project_id: str, body: ProjectUpdate, admin: dict = Depends(require_admin)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if update:
        update["updated_at"] = now_iso()
        await db.projects.update_one({"project_id": project_id}, {"$set": update})
        await audit(admin, "project.update", project_id, update)
    return {"ok": True}


# ------------- Admin -> client message -------------
class AdminMessageIn(BaseModel):
    client_id: str
    body: str = Field(min_length=1, max_length=4000)


@router.post("/messages")
async def admin_message(body: AdminMessageIn, admin: dict = Depends(require_admin)):
    doc = {"message_id": new_id("msg"), "client_id": body.client_id, "sender": "admin",
           "sender_name": "NEXORA", "body": body.body, "read": False, "created_at": now_iso()}
    await db.messages.insert_one({k: v for k, v in doc.items()})
    await audit(admin, "message.send", body.client_id)
    doc.pop("_id", None)
    return {"ok": True, "message": doc}


# ------------- AI tools (read-only, admin) -------------
class SummarizeIn(BaseModel):
    lead_id: str


@router.post("/ai/summarize")
async def ai_summarize(body: SummarizeIn, admin: dict = Depends(require_admin)):
    lead = await db.leads.find_one({"lead_id": body.lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    summary = ai.summarize_lead(lead)
    temp = ai.classify_lead(lead)
    await db.leads.update_one({"lead_id": body.lead_id},
                              {"$set": {"ai_summary": summary, "lead_temp": temp}})
    await audit(admin, "ai.summarize_lead", body.lead_id)
    return {"summary": summary, "lead_temp": temp}
