import secrets
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Request, Response, HTTPException, Depends
from pydantic import BaseModel, EmailStr, field_validator
from bson import ObjectId

from core import (
    db, hash_password, verify_password, create_access_token, create_refresh_token,
    set_auth_cookies, clear_auth_cookies, public_user, get_current_user,
    rate_limit, client_ip, check_lockout, record_failure, clear_failures, now_iso,
    get_jwt_secret, JWT_ALGORITHM,
)
import jwt

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    business: str | None = ""
    phone: str | None = ""

    @field_validator("password")
    @classmethod
    def strong(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("name")
    @classmethod
    def name_ok(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Please enter your name")
        return v.strip()


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    token: str
    password: str

    @field_validator("password")
    @classmethod
    def strong(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


@router.post("/register")
async def register(body: RegisterIn, request: Request, response: Response):
    rate_limit(f"register:{client_ip(request)}", 5, 60)
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    doc = {
        "email": email, "password_hash": hash_password(body.password), "name": body.name,
        "role": "client", "business": body.business or "", "phone": body.phone or "",
        "email_verified": False, "created_at": now_iso(),
    }
    res = await db.users.insert_one(doc)
    doc["_id"] = res.inserted_id
    access = create_access_token(str(res.inserted_id), email, "client")
    refresh = create_refresh_token(str(res.inserted_id))
    set_auth_cookies(response, access, refresh)
    return {"user": public_user(doc)}


@router.post("/login")
async def login(body: LoginIn, request: Request, response: Response):
    ip = client_ip(request)
    rate_limit(f"login:{ip}", 10, 60)
    email = body.email.lower()
    identifier = f"{ip}:{email}"
    await check_lockout(identifier)
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await record_failure(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await clear_failures(identifier)
    access = create_access_token(str(user["_id"]), email, user.get("role", "client"))
    refresh = create_refresh_token(str(user["_id"]))
    set_auth_cookies(response, access, refresh)
    return {"user": public_user(user)}


@router.post("/logout")
async def logout(response: Response, user: dict = Depends(get_current_user)):
    clear_auth_cookies(response)
    return {"ok": True}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return {"user": public_user(user)}


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(str(user["_id"]), user["email"], user.get("role", "client"))
        response.set_cookie("access_token", access, httponly=True, secure=True,
                            samesite="none", max_age=43200, path="/")
        return {"ok": True}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/forgot-password")
async def forgot_password(body: ForgotIn, request: Request):
    rate_limit(f"forgot:{client_ip(request)}", 5, 300)
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    # Always return ok to avoid account enumeration
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "token": token, "user_id": str(user["_id"]),
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
            "used": False, "created_at": now_iso(),
        })
    return {"ok": True, "message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(body: ResetIn, request: Request):
    rate_limit(f"reset:{client_ip(request)}", 10, 300)
    rec = await db.password_reset_tokens.find_one({"token": body.token})
    if not rec or rec.get("used"):
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    exp = rec["expires_at"]
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset link has expired")
    await db.users.update_one({"_id": ObjectId(rec["user_id"])},
                              {"$set": {"password_hash": hash_password(body.password)}})
    await db.password_reset_tokens.update_one({"token": body.token}, {"$set": {"used": True}})
    return {"ok": True, "message": "Password updated. You can now log in."}
