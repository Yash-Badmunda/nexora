import os
import re
import ipaddress
import logging
import httpx
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("nexora.email")

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "NEXORA")
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except httpx.HTTPStatusError as e:
        logger.error(f"Email send failed: {e.response.status_code} {e.response.text}")
        return None
    except Exception as e:
        logger.error(f"Email send error: {str(e)}")
        return None


def _wrap(inner: str) -> str:
    return (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        'style="background:#0b0e11;padding:24px 0;font-family:Arial,Helvetica,sans-serif">'
        '<tr><td align="center">'
        '<table role="presentation" width="600" cellpadding="0" cellspacing="0" '
        'style="max-width:600px;background:#12171d;border:1px solid #1e2630;border-radius:14px;overflow:hidden">'
        '<tr><td style="padding:22px 28px;border-bottom:1px solid #1e2630">'
        '<span style="font-size:22px;font-weight:800;letter-spacing:3px;color:#e6edf3">NEXORA</span>'
        '<span style="display:block;font-size:11px;letter-spacing:2px;color:#2cc6e8;margin-top:2px">BUILD. GROW. GET FOUND.</span>'
        '</td></tr>'
        f'<tr><td style="padding:28px">{inner}</td></tr>'
        '<tr><td style="padding:18px 28px;border-top:1px solid #1e2630;font-size:11px;color:#6b7683">'
        'Sent by NEXORA. India — serving worldwide. We never ask for your password or card details by email.'
        '</td></tr></table></td></tr></table>'
    )


def _row(label: str, value: str) -> str:
    return (f'<tr><td style="padding:6px 0;color:#8b95a1;font-size:13px;width:180px;vertical-align:top">{escape(label)}</td>'
            f'<td style="padding:6px 0;color:#e6edf3;font-size:13px">{escape(value or "-")}</td></tr>')


def quote_notification_html(data: dict, estimate: dict) -> str:
    cfg = data.get("config", {})
    feats = ", ".join(cfg.get("features", []) or []) or "-"
    est = f"{estimate['currency']} {estimate['oneTime']['low']:,} – {estimate['oneTime']['high']:,}"
    monthly = ""
    if estimate.get("monthly"):
        monthly = f" | Maintenance from {estimate['currency']} {estimate['monthly']['from']:,}/mo"
    inner = (
        '<h2 style="color:#e6edf3;font-size:18px;margin:0 0 14px">New Quote Request</h2>'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
        + _row("Name", data.get("name", ""))
        + _row("Business", data.get("business", ""))
        + _row("Email", data.get("email", ""))
        + _row("WhatsApp", data.get("whatsapp", ""))
        + _row("Business type", cfg.get("businessType", ""))
        + _row("Website type", cfg.get("websiteType", ""))
        + _row("Package", str(cfg.get("package", "")))
        + _row("Pages", str(cfg.get("pages", "")))
        + _row("Design", str(cfg.get("designComplexity", "")))
        + _row("Features", feats)
        + _row("Printing", "Yes" if cfg.get("printing") else "No")
        + _row("Timeline", data.get("timeline", ""))
        + _row("Estimate", est + monthly)
        + _row("Notes", data.get("notes", ""))
        + _row("Source", data.get("source", "website"))
        + _row("Received", data.get("created_at", ""))
        + '</table>'
    )
    return _wrap(inner)


def contact_notification_html(data: dict) -> str:
    inner = (
        '<h2 style="color:#e6edf3;font-size:18px;margin:0 0 14px">New Contact Lead</h2>'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
        + _row("Name", data.get("name", ""))
        + _row("Business", data.get("business", ""))
        + _row("Email", data.get("email", ""))
        + _row("WhatsApp", data.get("whatsapp", ""))
        + _row("Business type", data.get("businessType", ""))
        + _row("Service", data.get("service", ""))
        + _row("Website type", data.get("websiteType", ""))
        + _row("Budget", data.get("budget", ""))
        + _row("Timeline", data.get("timeline", ""))
        + _row("Message", data.get("description", ""))
        + _row("Received", data.get("created_at", ""))
        + '</table>'
    )
    return _wrap(inner)


def customer_confirmation_html(name: str, kind: str = "request") -> str:
    inner = (
        f'<h2 style="color:#e6edf3;font-size:18px;margin:0 0 12px">Thanks, {escape(name or "there")}!</h2>'
        f'<p style="color:#c3ccd6;font-size:14px;line-height:1.6;margin:0 0 12px">'
        f'We\'ve received your {escape(kind)} and the NEXORA team will get back to you shortly. '
        'For anything urgent, reply to this email and we\'ll jump in.</p>'
        '<p style="color:#8b95a1;font-size:13px;margin:0">— Team NEXORA</p>'
    )
    return _wrap(inner)
