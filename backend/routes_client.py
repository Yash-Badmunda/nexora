from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from core import db, get_current_user, owner_id, now_iso, new_id, rate_limit, client_ip

router = APIRouter(prefix="/api/client", tags=["client"])


async def _list(coll, cid, sort=None):
    cur = db[coll].find({"client_id": cid}, {"_id": 0})
    if sort:
        cur = cur.sort(*sort)
    return await cur.to_list(500)


@router.get("/overview")
async def overview(user: dict = Depends(get_current_user)):
    cid = owner_id(user)
    projects = await _list("projects", cid)
    tasks = await _list("tasks", cid)
    invoices = await _list("invoices", cid)
    appts = await _list("appointments", cid)
    outstanding = sum(i["amount"] for i in invoices if i.get("status") in ("unpaid", "overdue"))
    return {
        "profile": {"name": user.get("name"), "business": user.get("business"), "email": user.get("email")},
        "stats": {
            "activeProjects": len([p for p in projects if p.get("status") not in ("completed", "archived")]),
            "openTasks": len([t for t in tasks if t.get("status") != "done"]),
            "upcomingAppointments": len([a for a in appts if a.get("status") == "scheduled"]),
            "outstanding": outstanding,
            "currency": "INR",
        },
        "projects": projects[:5],
        "tasks": [t for t in tasks if t.get("status") != "done"][:6],
    }


@router.get("/projects")
async def projects(user: dict = Depends(get_current_user)):
    return {"items": await _list("projects", owner_id(user), ("created_at", -1))}


@router.get("/tasks")
async def tasks(user: dict = Depends(get_current_user)):
    return {"items": await _list("tasks", owner_id(user))}


@router.get("/quotes")
async def quotes(user: dict = Depends(get_current_user)):
    items = await db.quotes.find({"user_id": owner_id(user)}, {"_id": 0}).to_list(200)
    # also include quotes matched by email
    email_items = await db.quotes.find({"email": user.get("email"), "user_id": None}, {"_id": 0}).to_list(200)
    return {"items": items + email_items}


@router.get("/appointments")
async def appointments(user: dict = Depends(get_current_user)):
    return {"items": await _list("appointments", owner_id(user))}


@router.get("/invoices")
async def invoices(user: dict = Depends(get_current_user)):
    return {"items": await _list("invoices", owner_id(user))}


@router.get("/payments")
async def payments(user: dict = Depends(get_current_user)):
    return {"items": await _list("payments", owner_id(user))}


@router.get("/files")
async def files(user: dict = Depends(get_current_user)):
    return {"items": await _list("files", owner_id(user))}


@router.get("/messages")
async def get_messages(user: dict = Depends(get_current_user)):
    items = await db.messages.find({"client_id": owner_id(user)}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return {"items": items}


class MessageIn(BaseModel):
    body: str = Field(min_length=1, max_length=4000)


@router.post("/messages")
async def send_message(body: MessageIn, request: Request, user: dict = Depends(get_current_user)):
    rate_limit(f"msg:{client_ip(request)}", 20, 60)
    doc = {
        "message_id": new_id("msg"), "client_id": owner_id(user),
        "sender": "client", "sender_name": user.get("name", "Client"),
        "body": body.body, "read": False, "created_at": now_iso(),
    }
    await db.messages.insert_one({k: v for k, v in doc.items()})
    doc.pop("_id", None)
    return {"ok": True, "message": doc}


class SettingsIn(BaseModel):
    name: str | None = None
    business: str | None = None
    phone: str | None = None


@router.put("/settings")
async def update_settings(body: SettingsIn, user: dict = Depends(get_current_user)):
    from bson import ObjectId
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if update:
        await db.users.update_one({"_id": ObjectId(owner_id(user))}, {"$set": update})
    return {"ok": True}
