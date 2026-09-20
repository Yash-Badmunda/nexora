import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarClock, CheckCircle2, AlertCircle, MessageCircle, Loader2 } from "lucide-react";
import { Seo, SectionHeading, Reveal } from "../components/ui";
import { api, apiError } from "../lib/api";
import { track, whatsappLink } from "../lib/analytics";
import { SERVICES } from "../data";

const empty = { service: "", date: "", time: "", name: "", email: "", whatsapp: "", business: "", notes: "", website: "" };
const TIMES = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

export default function Book() {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    track("booking_started");
    api.get("/booking/status").then(({ data }) => setConfigured(data.configured)).catch(() => setConfigured(false));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || !form.service || !form.date || !form.time) {
      setError("Please fill service, date, time, name and a valid email."); setStatus("error"); return;
    }
    setStatus("loading"); setError("");
    try {
      await api.post("/booking", form);
      setStatus("success");
      track("booking_completed", { service: form.service });
    } catch (err) {
      setError(apiError(err.response?.data?.detail) || "Could not submit. Please try WhatsApp.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="pt-28"><div className="container-nx max-w-xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="panel p-10 text-center" data-testid="booking-success">
          <CheckCircle2 size={54} className="text-cyan mx-auto" />
          <h2 className="mt-5 font-display text-2xl text-chrome">Request received</h2>
          <p className="mt-3 text-fog/80">We'll confirm your <strong className="text-chrome">{form.service}</strong> slot for {form.date} at {form.time} on WhatsApp. Nothing is booked until we confirm.</p>
          <a href={whatsappLink(`Hi Nexora, I requested a ${form.service} on ${form.date} at ${form.time}.`)} target="_blank" rel="noopener noreferrer" className="btn-primary mt-7 inline-flex">
            <MessageCircle size={18} /> Confirm on WhatsApp
          </a>
        </motion.div>
      </div></div>
    );
  }

  return (
    <div className="pt-28">
      <Seo title="Book a Call" description="Request a call with NEXORA to discuss your project. We confirm your slot on WhatsApp." />
      <div className="container-nx max-w-2xl">
        <Reveal><SectionHeading center kicker="BOOK A CALL" title="Request a slot." sub="Pick a preferred time — we'll confirm availability on WhatsApp." /></Reveal>

        {!configured && (
          <div className="mt-8 panel p-5 flex items-start gap-3 border-cyan/30" data-testid="booking-notice">
            <CalendarClock size={20} className="text-cyan shrink-0 mt-0.5" />
            <p className="text-sm text-fog/85">Live scheduling is currently being configured. Submit your preferred time below and we'll confirm on WhatsApp — or message us directly.</p>
          </div>
        )}

        <Reveal delay={0.1}>
          <form onSubmit={submit} className="mt-8 panel p-6 sm:p-8 space-y-5" data-testid="booking-form" noValidate>
            <input type="text" value={form.website} onChange={set("website")} className="hidden" tabIndex={-1} aria-hidden="true" />
            <Field label="Service *">
              <select value={form.service} onChange={set("service")} className="input-nx appearance-none cursor-pointer" data-testid="booking-service">
                <option value="">Select a service</option>
                <option value="Discovery Call">Discovery Call</option>
                {SERVICES.map((s) => <option key={s.key} value={s.title}>{s.title}</option>)}
              </select>
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Preferred date *"><input type="date" min={new Date().toISOString().slice(0, 10)} className="input-nx" value={form.date} onChange={set("date")} data-testid="booking-date" /></Field>
              <Field label="Preferred time *">
                <select value={form.time} onChange={set("time")} className="input-nx appearance-none cursor-pointer" data-testid="booking-time">
                  <option value="">Select</option>
                  {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name *"><input className="input-nx" value={form.name} onChange={set("name")} data-testid="booking-name" /></Field>
              <Field label="Email *"><input type="email" className="input-nx" value={form.email} onChange={set("email")} data-testid="booking-email" /></Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="WhatsApp"><input className="input-nx" value={form.whatsapp} onChange={set("whatsapp")} placeholder="+91..." /></Field>
              <Field label="Business"><input className="input-nx" value={form.business} onChange={set("business")} /></Field>
            </div>
            <Field label="Notes"><textarea rows={3} className="input-nx resize-none" value={form.notes} onChange={set("notes")} placeholder="Anything we should know?" /></Field>

            {status === "error" && <div className="flex items-center gap-2 text-sm text-red-400" data-testid="booking-error"><AlertCircle size={16} /> {error}</div>}

            <button type="submit" className="btn-primary w-full" disabled={status === "loading"} data-testid="booking-submit">
              {status === "loading" ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : "Request this slot"}
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
