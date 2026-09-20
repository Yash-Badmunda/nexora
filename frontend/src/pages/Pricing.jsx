import React from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { Seo, SectionHeading, Button, Reveal } from "../components/ui";

const TIERS = [
  { name: "LAUNCH", range: "₹3,000 – ₹5,000", care: "₹900/mo",
    feats: ["Up to 3 pages", "Mobile-first design", "Contact form", "Basic SEO setup", "Go-live support"] },
  { name: "BUSINESS", range: "₹8,000 – ₹10,000", care: "₹1,500/mo", featured: true,
    feats: ["Up to 6 pages", "Premium design options", "Dynamic content", "Google Business ready", "SEO structure", "Analytics setup"] },
  { name: "BUSINESS AUTOMATION", range: "₹13,000 – ₹18,000", care: "₹3,000/mo",
    feats: ["Everything in Business", "Lead workflows", "Auto follow-ups", "CRM / sheets sync", "Booking / payments ready", "Priority support"] },
];

const SEPARATE = [
  "Domain (purchased separately)",
  "Hosting (purchased separately)",
  "Paid third-party APIs & services",
  "Payment-provider fees",
  "Google Ads budget (paid to Google)",
  "Printing material, installation & delivery",
];

export default function Pricing() {
  return (
    <div className="pt-28">
      <Seo title="Pricing" description="NEXORA pricing — Launch, Business and Business Automation packages with transparent starting ranges. Configure your exact build for a live estimate." />
      <div className="container-nx">
        <Reveal><SectionHeading center kicker="CONFIGURE YOUR BUILD" title="Transparent pricing." sub="Clear starting ranges. Your exact price is built deterministically from what you choose — never guessed." /></Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06}>
              <div className={`panel p-7 h-full relative flex flex-col ${t.featured ? "border-cyan/50" : ""}`}
                style={t.featured ? { boxShadow: "0 0 0 1px rgba(44,198,232,0.3), 0 30px 70px -34px rgba(44,198,232,0.4)" } : {}}>
                {t.featured && <span className="absolute -top-3 left-7 chip !text-[10px] bg-cyan text-[#04121a] border-cyan">MOST POPULAR</span>}
                <div className="font-display font-bold tracking-widest text-chrome">{t.name}</div>
                <div className="mt-3 font-mono text-2xl text-cyan">{t.range}</div>
                <div className="text-xs text-muted/70 mt-1">Maintenance from {t.care}</div>
                <ul className="mt-6 space-y-2.5 flex-1">
                  {t.feats.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-fog/80"><Check size={16} className="text-cyan mt-0.5" /> {f}</li>
                  ))}
                </ul>
                <Button to="/quote" variant={t.featured ? "primary" : "ghost"} className="mt-7 w-full">CONFIGURE THIS <ArrowUpRight size={16} /></Button>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 panel p-7 max-w-3xl mx-auto">
            <div className="font-mono text-[11px] tracking-widest text-cyan mb-4">BILLED SEPARATELY</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {SEPARATE.map((s) => <div key={s} className="text-sm text-fog/75">• {s}</div>)}
            </div>
            <p className="mt-5 text-xs text-muted/70">
              We never promise rankings, leads, sales, revenue or guaranteed results. Ranges are starting points; we confirm a fixed quote after a quick chat.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
