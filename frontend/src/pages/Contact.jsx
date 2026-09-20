import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, AlertCircle, MessageCircle, Loader2 } from "lucide-react";
import { Seo, SectionHeading, Reveal } from "../components/ui";
import { api, apiError } from "../lib/api";
import { track, whatsappLink } from "../lib/analytics";
import { BUSINESS_TYPES, WEBSITE_TYPES, TIMELINES, BUDGETS, SERVICES } from "../data";

const empty = { name: "", business: "", email: "", whatsapp: "", businessType: "", service: "", websiteType: "", budget: "", timeline: "", description: "", website: "" };

export default function Contact() {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    if (form.name.trim().length < 2) return "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email.";
    if (form.description.trim().length < 10) return "Tell us a little about your project (10+ characters).";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); setStatus("error"); return; }
    setStatus("loading"); setError("");
    track("contact_submit_attempt");
    try {
      await api.post("/contact", form);
      setStatus("success");
      track("contact_submission");
    } catch (err) {
      setError(apiError(err.response?.data?.detail) || "Could not send. Please try WhatsApp.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="pt-28">
        <div className="container-nx max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="panel p-10 text-center" data-testid="contact-success">
            <CheckCircle2 size={54} className="text-cyan mx-auto" />
            <h2 className="mt-5 font-display text-2xl text-chrome">Message received</h2>
            <p className="mt-3 text-fog/80">Thanks, {form.name.split(" ")[0]}! The NEXORA team will get back to you soon. For anything urgent, message us on WhatsApp.</p>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-7 inline-flex" onClick={() => track("whatsapp_click", { source: "contact_success" })}>
              <MessageCircle size={18} /> WhatsApp us
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28">
      <Seo title="Contact" description="Contact NEXORA — tell us about your project and we'll get back to you. India, serving worldwide." />
      <div className="container-nx grid lg:grid-cols-[1fr,1.4fr] gap-10">
        <Reveal>
          <SectionHeading kicker="COMMUNICATION PORTAL" title="Let's talk." sub="Tell us what you need. We reply fast — WhatsApp is the quickest." />
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click", { source: "contact" })} className="btn-primary mt-8 inline-flex" data-testid="contact-whatsapp">
            <MessageCircle size={18} /> Chat on WhatsApp
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={submit} className="panel p-6 sm:p-8 space-y-5" data-testid="contact-form" noValidate>
            <input type="text" value={form.website} onChange={set("website")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name *"><input className="input-nx" value={form.name} onChange={set("name")} data-testid="contact-name" /></Field>
              <Field label="Business"><input className="input-nx" value={form.business} onChange={set("business")} data-testid="contact-business" /></Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email *"><input type="email" className="input-nx" value={form.email} onChange={set("email")} data-testid="contact-email" /></Field>
              <Field label="WhatsApp"><input className="input-nx" value={form.whatsapp} onChange={set("whatsapp")} placeholder="+91..." data-testid="contact-whatsapp-input" /></Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Business type"><Select value={form.businessType} onChange={set("businessType")} options={BUSINESS_TYPES} placeholder="Select" /></Field>
              <Field label="Service"><Select value={form.service} onChange={set("service")} options={SERVICES.map((s) => s.title)} placeholder="Select" /></Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Website type"><Select value={form.websiteType} onChange={set("websiteType")} options={WEBSITE_TYPES} placeholder="Select" /></Field>
              <Field label="Budget"><Select value={form.budget} onChange={set("budget")} options={BUDGETS} placeholder="Select" /></Field>
              <Field label="Timeline"><Select value={form.timeline} onChange={set("timeline")} options={TIMELINES} placeholder="Select" /></Field>
            </div>
            <Field label="Project description *">
              <textarea rows={4} className="input-nx resize-none" value={form.description} onChange={set("description")} placeholder="What are you looking to build?" data-testid="contact-description" />
            </Field>

            {status === "error" && (
              <div className="flex items-center gap-2 text-sm text-red-400" data-testid="contact-error"><AlertCircle size={16} /> {error}</div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={status === "loading"} data-testid="contact-submit">
              {status === "loading" ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <>Send message <Send size={18} /></>}
            </button>
          </form>
        </Reveal>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div><label className="label-nx">{label}</label>{children}</div>;
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={onChange} className="input-nx appearance-none cursor-pointer">
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
