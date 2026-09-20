import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, AlertCircle, Loader2, MessageCircle, Rocket, Palette, Layers, Printer } from "lucide-react";
import { Seo, SectionHeading, Reveal } from "../components/ui";
import { api, apiError } from "../lib/api";
import { track, whatsappLink } from "../lib/analytics";
import { BUSINESS_TYPES, WEBSITE_TYPES, TIMELINES } from "../data";

const PACKAGES = [
  { key: "launch", label: "Launch", icon: Rocket, desc: "Get online fast", pages: 3 },
  { key: "business", label: "Business", icon: Layers, desc: "Built to grow", pages: 6 },
  { key: "automation", label: "Automation", icon: Rocket, desc: "Website + systems", pages: 10 },
];
const DESIGNS = [
  { key: "standard", label: "Standard", desc: "Clean & professional" },
  { key: "premium", label: "Premium", desc: "Custom, polished" },
  { key: "immersive", label: "Immersive / 3D", desc: "Interactive & animated" },
];
const FEATURES = [
  ["contact_form", "Contact form"], ["database", "Dynamic content"], ["auth", "User login"],
  ["payments", "Online payments"], ["booking", "Booking / scheduling"], ["ai_chatbot", "AI chatbot"],
  ["automation", "Automation"], ["google_business", "Google Business"], ["google_ads", "Google Ads"], ["seo", "Local SEO"],
];

const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

export default function Quote() {
  const [params] = useSearchParams();
  const printingDefault = params.get("type") === "printing";

  const [config, setConfig] = useState({
    businessType: "", websiteType: "", package: "business", pages: 6,
    designComplexity: "standard", features: ["contact_form"], maintenance: false, printing: printingDefault,
  });
  const [estimate, setEstimate] = useState(null);
  const [details, setDetails] = useState({ name: "", business: "", email: "", whatsapp: "", timeline: "", notes: "", website: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const calc = useCallback(async (cfg) => {
    try {
      const { data } = await api.post("/pricing/calculate", cfg);
      setEstimate(data);
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => calc(config), 220);
    return () => clearTimeout(id);
  }, [config, calc]);

  const setPackage = (key) => {
    const pkg = PACKAGES.find((p) => p.key === key);
    setConfig((c) => ({ ...c, package: key, pages: Math.max(c.pages, pkg.pages) }));
    track("pricing_interaction", { field: "package", value: key });
  };
  const toggleFeature = (k) => {
    setConfig((c) => ({ ...c, features: c.features.includes(k) ? c.features.filter((x) => x !== k) : [...c.features, k] }));
    track("pricing_interaction", { field: "feature", value: k });
  };
  const setD = (k) => (e) => setDetails((d) => ({ ...d, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (details.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
      setError("Please enter your name and a valid email."); setStatus("error"); return;
    }
    setStatus("loading"); setError("");
    track("quote_submit_attempt");
    try {
      const { data } = await api.post("/quotes", { ...details, config });
      setResult(data);
      setStatus("success");
      track("quote_submission", { email_status: data.email_status });
    } catch (err) {
      setError(apiError(err.response?.data?.detail) || "Could not submit. Please try WhatsApp.");
      setStatus("error");
    }
  };

  const rangeText = useMemo(() => {
    if (!estimate) return "—";
    return `${inr(estimate.oneTime.low)} – ${inr(estimate.oneTime.high)}`;
  }, [estimate]);

  if (status === "success" && result) {
    return (
      <div className="pt-28"><div className="container-nx max-w-xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="panel p-10 text-center" data-testid="quote-success">
          <CheckCircle2 size={54} className="text-cyan mx-auto" />
          <h2 className="mt-5 font-display text-2xl text-chrome">Quote requested</h2>
          <p className="mt-3 text-fog/80">Thanks {details.name.split(" ")[0]}! Your estimate is <span className="text-cyan font-mono">{result.estimate ? `${inr(result.estimate.oneTime.low)} – ${inr(result.estimate.oneTime.high)}` : rangeText}</span>. We'll review and confirm a fixed quote shortly.</p>
          {result.email_status === "failed" && <p className="mt-3 text-xs text-amber-400">We saved your request; email confirmation is pending. We'll still reach out.</p>}
          <a href={whatsappLink(`Hi Nexora, I just requested a quote (${rangeText}). I'd like to discuss.`)} target="_blank" rel="noopener noreferrer" className="btn-primary mt-7 inline-flex" onClick={() => track("whatsapp_click", { source: "quote_success" })}>
            <MessageCircle size={18} /> Discuss on WhatsApp
          </a>
        </motion.div>
      </div></div>
    );
  }

  return (
    <div className="pt-28">
      <Seo title="Get a Quote" description="Configure your build and get a live, deterministic estimate from NEXORA. Website, features, automation and printing." />
      <div className="container-nx">
        <Reveal><SectionHeading center kicker="BUILD CONFIGURATOR" title="Configure your build." sub="Adjust the options — your estimate updates live. Final price is calculated deterministically, never guessed." /></Reveal>

        <div className="mt-12 grid lg:grid-cols-[1.5fr,1fr] gap-6 items-start">
          {/* Configurator */}
          <div className="space-y-6">
            <Block title="1 · About you">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Business type"><Select value={config.businessType} onChange={(e) => setConfig((c) => ({ ...c, businessType: e.target.value }))} options={BUSINESS_TYPES} /></Field>
                <Field label="Website type"><Select value={config.websiteType} onChange={(e) => setConfig((c) => ({ ...c, websiteType: e.target.value }))} options={WEBSITE_TYPES} /></Field>
              </div>
            </Block>

            <Block title="2 · Package">
              <div className="grid sm:grid-cols-3 gap-3">
                {PACKAGES.map((p) => {
                  const on = config.package === p.key;
                  return (
                    <button key={p.key} onClick={() => setPackage(p.key)} data-testid={`quote-package-${p.key}`}
                      className={`panel p-4 text-left transition-all ${on ? "border-cyan/60" : "panel-hover"}`}
                      style={on ? { boxShadow: "0 0 0 1px rgba(44,198,232,0.4)" } : {}}>
                      <p.icon size={20} className={on ? "text-cyan" : "text-muted"} />
                      <div className="mt-2 font-display text-chrome">{p.label}</div>
                      <div className="text-xs text-muted">{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </Block>

            <Block title="3 · Pages & design">
              <Field label={`Number of pages: ${config.pages}`}>
                <input type="range" min="1" max="20" value={config.pages} onChange={(e) => setConfig((c) => ({ ...c, pages: Number(e.target.value) }))} className="w-full accent-cyan" data-testid="quote-pages" />
              </Field>
              <div className="grid sm:grid-cols-3 gap-3 mt-4">
                {DESIGNS.map((d) => {
                  const on = config.designComplexity === d.key;
                  return (
                    <button key={d.key} onClick={() => setConfig((c) => ({ ...c, designComplexity: d.key }))} data-testid={`quote-design-${d.key}`}
                      className={`panel p-4 text-left transition-all ${on ? "border-cyan/60" : "panel-hover"}`} style={on ? { boxShadow: "0 0 0 1px rgba(44,198,232,0.4)" } : {}}>
                      <Palette size={18} className={on ? "text-cyan" : "text-muted"} />
                      <div className="mt-2 font-display text-sm text-chrome">{d.label}</div>
                      <div className="text-xs text-muted">{d.desc}</div>
                    </button>
                  );
                })}
              </div>
            </Block>

            <Block title="4 · Features">
              <div className="grid sm:grid-cols-2 gap-2.5">
                {FEATURES.map(([k, label]) => {
                  const on = config.features.includes(k);
                  return (
                    <button key={k} onClick={() => toggleFeature(k)} data-testid={`quote-feature-${k}`}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${on ? "border-cyan/60 text-chrome bg-cyan/5" : "border-line text-muted hover:border-cyan/30"}`}>
                      <span className={`h-4 w-4 rounded grid place-items-center border ${on ? "bg-cyan border-cyan" : "border-line"}`}>
                        {on && <CheckCircle2 size={12} className="text-[#04121a]" />}
                      </span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </Block>

            <Block title="5 · Extras">
              <label className="flex items-center gap-3 cursor-pointer text-sm text-fog/85">
                <input type="checkbox" checked={config.maintenance} onChange={(e) => setConfig((c) => ({ ...c, maintenance: e.target.checked }))} className="accent-cyan h-4 w-4" data-testid="quote-maintenance" />
                Add a monthly maintenance / care plan
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-sm text-fog/85 mt-3">
                <input type="checkbox" checked={config.printing} onChange={(e) => setConfig((c) => ({ ...c, printing: e.target.checked }))} className="accent-cyan h-4 w-4" data-testid="quote-printing" />
                <span className="inline-flex items-center gap-2"><Printer size={16} className="text-cyan" /> I also need flex printing / physical advertising</span>
              </label>
              {config.printing && <p className="mt-2 text-xs text-muted/80">Printing is quoted separately based on size, quantity, material, installation & delivery.</p>}
            </Block>
          </div>

          {/* Live estimate + details */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="panel p-6 relative overflow-hidden" data-testid="quote-estimate">
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div className="relative">
                <div className="font-mono text-[11px] tracking-widest text-cyan">LIVE ESTIMATE</div>
                <div className="mt-2 font-display text-3xl text-chrome" data-testid="quote-estimate-range">{rangeText}</div>
                {estimate?.monthly && <div className="text-sm text-muted mt-1">+ {inr(estimate.monthly.from)}/mo care</div>}
                {estimate && (
                  <div className="mt-4 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {estimate.breakdown.map((b, i) => (
                      <div key={i} className="flex justify-between text-xs text-muted">
                        <span>{b.label}</span>
                        <span className="font-mono">{b.high > 0 ? `${inr(b.low)}–${inr(b.high)}` : "incl."}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-4 text-[10px] text-muted/60 leading-relaxed">Estimate only. Domain, hosting, paid APIs, provider fees, ad budget & printing are separate.</p>
              </div>
            </div>

            <form onSubmit={submit} className="panel p-6 space-y-4" data-testid="quote-details-form" noValidate>
              <div className="font-mono text-[11px] tracking-widest text-cyan">YOUR DETAILS</div>
              <input type="text" value={details.website} onChange={setD("website")} className="hidden" tabIndex={-1} aria-hidden="true" />
              <input className="input-nx" placeholder="Name *" value={details.name} onChange={setD("name")} data-testid="quote-name" />
              <input className="input-nx" placeholder="Business" value={details.business} onChange={setD("business")} data-testid="quote-business" />
              <input type="email" className="input-nx" placeholder="Email *" value={details.email} onChange={setD("email")} data-testid="quote-email" />
              <input className="input-nx" placeholder="WhatsApp" value={details.whatsapp} onChange={setD("whatsapp")} data-testid="quote-whatsapp" />
              <Select value={details.timeline} onChange={setD("timeline")} options={TIMELINES} placeholder="Timeline" />
              <textarea rows={2} className="input-nx resize-none" placeholder="Notes (optional)" value={details.notes} onChange={setD("notes")} />

              {status === "error" && <div className="flex items-center gap-2 text-sm text-red-400" data-testid="quote-error"><AlertCircle size={16} /> {error}</div>}
              <button type="submit" className="btn-primary w-full" disabled={status === "loading"} data-testid="quote-submit">
                {status === "loading" ? <><Loader2 size={18} className="animate-spin" /> Requesting...</> : <>REQUEST THIS QUOTE <ArrowUpRight size={18} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Block({ title, children }) {
  return (
    <div className="panel p-6">
      <div className="font-display text-chrome mb-4">{title}</div>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return <div><label className="label-nx">{label}</label>{children}</div>;
}
function Select({ value, onChange, options, placeholder = "Select" }) {
  return (
    <select value={value} onChange={onChange} className="input-nx appearance-none cursor-pointer">
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
