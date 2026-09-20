"""Deterministic pricing engine (single source of truth).

AI NEVER determines price. This module is fully deterministic: given the same
config it always returns the same estimate range. The frontend fetches RULES to
render a live estimate, but the authoritative estimate is recomputed here on the
server for every submitted quote.
"""
from typing import Dict, List

CURRENCY = "INR"

PACKAGES = {
    "launch": {"key": "launch", "label": "Launch", "base": [3000, 5000], "pagesIncluded": 3,
               "blurb": "A fast, clean presence to get online."},
    "business": {"key": "business", "label": "Business", "base": [8000, 10000], "pagesIncluded": 6,
                 "blurb": "A complete website built to grow."},
    "automation": {"key": "automation", "label": "Business Automation", "base": [13000, 18000], "pagesIncluded": 10,
                   "blurb": "Website + systems that run for you."},
}

EXTRA_PAGE = [400, 700]

DESIGN = {
    "standard": {"key": "standard", "label": "Standard", "add": [0, 0]},
    "premium": {"key": "premium", "label": "Premium", "add": [2000, 4000]},
    "immersive": {"key": "immersive", "label": "Immersive / 3D", "add": [5000, 9000]},
}

FEATURES = {
    "contact_form": {"key": "contact_form", "label": "Contact form", "add": [0, 500]},
    "database": {"key": "database", "label": "Database / dynamic content", "add": [1500, 3000]},
    "auth": {"key": "auth", "label": "User accounts / login", "add": [2000, 4000]},
    "payments": {"key": "payments", "label": "Online payments", "add": [3000, 6000]},
    "booking": {"key": "booking", "label": "Booking / scheduling", "add": [2500, 4500]},
    "ai_chatbot": {"key": "ai_chatbot", "label": "AI chatbot", "add": [4000, 8000]},
    "automation": {"key": "automation", "label": "Business automation", "add": [5000, 10000]},
    "google_business": {"key": "google_business", "label": "Google Business Profile setup", "add": [1500, 2500]},
    "google_ads": {"key": "google_ads", "label": "Google Ads setup (ad budget separate)", "add": [2500, 4000]},
    "seo": {"key": "seo", "label": "Local SEO", "add": [2000, 4000]},
}

MAINTENANCE = {
    "launch": {"from": 900, "label": "Launch care"},
    "business": {"from": 1500, "label": "Business care"},
    "automation": {"from": 3000, "label": "Automation care"},
}

DISCLAIMERS = [
    "Domain purchased separately.",
    "Hosting purchased separately.",
    "Paid third-party APIs & services billed separately.",
    "Payment-provider fees are separate.",
    "Google Ads budget is separate from setup.",
    "Flex printing material, installation & delivery are quoted separately.",
    "This is an estimate range, not a final invoice. We confirm a fixed quote after a quick chat.",
]

RULES = {
    "currency": CURRENCY,
    "packages": PACKAGES,
    "extraPage": EXTRA_PAGE,
    "design": DESIGN,
    "features": FEATURES,
    "maintenance": MAINTENANCE,
    "disclaimers": DISCLAIMERS,
}


def _clamp_int(v, default=0):
    try:
        return max(0, int(v))
    except (TypeError, ValueError):
        return default


def calculate(config: Dict) -> Dict:
    pkg_key = config.get("package") if config.get("package") in PACKAGES else "business"
    pkg = PACKAGES[pkg_key]

    breakdown: List[Dict] = []
    low, high = pkg["base"][0], pkg["base"][1]
    breakdown.append({"label": f"{pkg['label']} package", "low": pkg["base"][0], "high": pkg["base"][1]})

    # Extra pages
    pages = _clamp_int(config.get("pages"), pkg["pagesIncluded"])
    extra = max(0, pages - pkg["pagesIncluded"])
    if extra > 0:
        pl, ph = EXTRA_PAGE[0] * extra, EXTRA_PAGE[1] * extra
        low += pl
        high += ph
        breakdown.append({"label": f"{extra} extra page(s)", "low": pl, "high": ph})

    # Design complexity
    design_key = config.get("designComplexity") if config.get("designComplexity") in DESIGN else "standard"
    d = DESIGN[design_key]
    if d["add"][1] > 0:
        low += d["add"][0]
        high += d["add"][1]
        breakdown.append({"label": f"{d['label']} design", "low": d["add"][0], "high": d["add"][1]})

    # Features
    selected = config.get("features") or []
    for f_key in selected:
        f = FEATURES.get(f_key)
        if not f:
            continue
        low += f["add"][0]
        high += f["add"][1]
        breakdown.append({"label": f["label"], "low": f["add"][0], "high": f["add"][1]})

    # Maintenance (monthly, separate)
    monthly = None
    if config.get("maintenance"):
        m = MAINTENANCE[pkg_key]
        monthly = {"from": m["from"], "label": m["label"]}

    notes: List[str] = []
    if config.get("printing"):
        notes.append("Flex printing / physical advertising requires a separate quote (size, material, quantity, installation & delivery).")

    return {
        "currency": CURRENCY,
        "package": pkg_key,
        "oneTime": {"low": low, "high": high},
        "monthly": monthly,
        "breakdown": breakdown,
        "notes": notes,
        "disclaimers": DISCLAIMERS,
    }
