from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

from core import db, rate_limit, client_ip, now_iso, new_id
import pricing
import emailer
import ai
import os

router = APIRouter(prefix="/api", tags=["public"])

QUOTE_NOTIFICATION_EMAIL = os.environ.get("QUOTE_NOTIFICATION_EMAIL", "yashbadmunda@gmail.com")


# ---------------- Pricing ----------------
@router.get("/pricing/rules")
async def pricing_rules():
    return pricing.RULES


class QuoteConfig(BaseModel):
    businessType: str = ""
    websiteType: str = ""
    package: str = "business"
    pages: int = 6
    designComplexity: str = "standard"
    features: List[str] = []
    maintenance: bool = False
    printing: bool = False


@router.post("/pricing/calculate")
async def pricing_calculate(config: QuoteConfig):
    return pricing.calculate(config.model_dump())


# ---------------- Quote ----------------
class QuoteIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    business: str = Field(default="", max_length=160)
    email: EmailStr
    whatsapp: str = Field(default="", max_length=40)
    timeline: str = Field(default="", max_length=120)
    notes: str = Field(default="", max_length=2000)
    config: QuoteConfig
    website: Optional[str] = ""  # honeypot


@router.post("/quotes")
async def submit_quote(body: QuoteIn, request: Request):
    rate_limit(f"quote:{client_ip(request)}", 5, 120)
    if body.website:  # honeypot filled -> bot
        return {"ok": True, "quote_id": "spam"}

    cfg = body.config.model_dump()
    estimate = pricing.calculate(cfg)  # authoritative, server-side, deterministic

    data = {
        "name": body.name, "business": body.business, "email": body.email.lower(),
        "whatsapp": body.whatsapp, "timeline": body.timeline, "notes": body.notes,
        "config": cfg, "source": "quote_configurator", "created_at": now_iso(),
    }
    lead_temp = ai.classify_lead(data)
    ai_summary = ai.summarize_lead(data)

    quote_id = new_id("qt")
    quote_doc = {
        "quote_id": quote_id, **data, "estimate": estimate,
        "status": "new", "lead_temp": lead_temp, "ai_summary": ai_summary, "user_id": None,
    }
    await db.quotes.insert_one({k: v for k, v in quote_doc.items()})

    lead_doc = {
        "lead_id": new_id("ld"), "type": "quote", **data,
        "estimate": estimate, "status": "new", "lead_temp": lead_temp,
        "ai_summary": ai_summary, "quote_id": quote_id,
    }
    await db.leads.insert_one({k: v for k, v in lead_doc.items()})

    email_status = "skipped"
    admin_html = emailer.quote_notification_html({**data}, estimate)
    email_id = await emailer.send_email(
        to=QUOTE_NOTIFICATION_EMAIL,
        subject=f"New Quote — {body.name} ({lead_temp})",
        html=admin_html,
    )
    email_status = "sent" if email_id else "failed"
    if email_id:
        # customer confirmation (best-effort)
        await emailer.send_email(
            to=body.email.lower(),
            subject="We received your NEXORA quote request",
            html=emailer.customer_confirmation_html(body.name, "quote request"),
        )
    return {"ok": True, "quote_id": quote_id, "estimate": estimate, "email_status": email_status}


# ---------------- Contact ----------------
class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    business: str = Field(default="", max_length=160)
    email: EmailStr
    whatsapp: str = Field(default="", max_length=40)
    businessType: str = Field(default="", max_length=120)
    service: str = Field(default="", max_length=120)
    websiteType: str = Field(default="", max_length=120)
    budget: str = Field(default="", max_length=120)
    timeline: str = Field(default="", max_length=120)
    description: str = Field(default="", max_length=3000)
    website: Optional[str] = ""  # honeypot


@router.post("/contact")
async def submit_contact(body: ContactIn, request: Request):
    rate_limit(f"contact:{client_ip(request)}", 5, 120)
    if body.website:
        return {"ok": True}

    data = body.model_dump(exclude={"website"})
    data["email"] = data["email"].lower()
    data["created_at"] = now_iso()
    lead_temp = ai.classify_lead(data)
    ai_summary = ai.summarize_lead(data)

    await db.leads.insert_one({
        "lead_id": new_id("ld"), "type": "contact", **data,
        "status": "new", "lead_temp": lead_temp, "ai_summary": ai_summary,
    })

    email_id = await emailer.send_email(
        to=QUOTE_NOTIFICATION_EMAIL,
        subject=f"New Contact — {body.name} ({lead_temp})",
        html=emailer.contact_notification_html(data),
    )
    if email_id:
        await emailer.send_email(
            to=data["email"], subject="Thanks for contacting NEXORA",
            html=emailer.customer_confirmation_html(body.name, "message"),
        )
    return {"ok": True, "email_status": "sent" if email_id else "failed"}


# ---------------- Booking ----------------
class BookingIn(BaseModel):
    service: str = Field(max_length=120)
    date: str = Field(max_length=40)
    time: str = Field(max_length=40)
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    whatsapp: str = Field(default="", max_length=40)
    business: str = Field(default="", max_length=160)
    notes: str = Field(default="", max_length=1500)
    website: Optional[str] = ""


@router.get("/booking/status")
async def booking_status():
    # Never invent availability: calendar not configured yet.
    configured = bool(os.environ.get("CALENDAR_REFRESH_TOKEN"))
    return {"configured": configured}


@router.post("/booking")
async def submit_booking(body: BookingIn, request: Request):
    rate_limit(f"booking:{client_ip(request)}", 5, 120)
    if body.website:
        return {"ok": True}
    data = body.model_dump(exclude={"website"})
    data["email"] = data["email"].lower()
    data["created_at"] = now_iso()
    # We DO NOT invent availability. Store as a request; confirmed manually until calendar is wired.
    await db.leads.insert_one({
        "lead_id": new_id("ld"), "type": "booking_request", **data,
        "status": "new", "lead_temp": "WARM",
        "ai_summary": f"{body.name} requested a {body.service} call on {body.date} {body.time}.",
    })
    email_id = await emailer.send_email(
        to=QUOTE_NOTIFICATION_EMAIL,
        subject=f"New Booking Request — {body.name}",
        html=emailer.contact_notification_html({**data, "service": body.service,
                                                "description": f"Requested {body.date} at {body.time}. {body.notes}"}),
    )
    return {"ok": True, "email_status": "sent" if email_id else "failed",
            "message": "Request received. We'll confirm your slot on WhatsApp."}


# ---------------- Analytics ----------------
class EventIn(BaseModel):
    event: str = Field(max_length=80)
    meta: dict = {}


@router.post("/track")
async def track(body: EventIn, request: Request):
    rate_limit(f"track:{client_ip(request)}", 60, 60)
    await db.analytics_events.insert_one({
        "event": body.event[:80], "meta": {k: str(v)[:200] for k, v in (body.meta or {}).items()},
        "created_at": now_iso(),
    })
    return {"ok": True}


# ---------------- AI chat ----------------
class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: List[dict] = []


@router.post("/ai/chat")
async def ai_chat(body: ChatIn, request: Request):
    rate_limit(f"aichat:{client_ip(request)}", 15, 60)
    reply = ai.chat_reply(body.message, body.history)
    return {"reply": reply, "available": ai.ai_available()}
