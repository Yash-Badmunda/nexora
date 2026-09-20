import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, Users, Flame, FolderKanban, FileText, CalendarClock, Receipt, CreditCard,
  BarChart3, Sparkles, ScrollText, Loader2, X, Search, Send,
} from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { PageTitle, StatCard, Badge, Empty, Card, Progress, inr } from "../components/dashboard-ui";
import { api } from "../lib/api";

const NAV = [
  { key: "overview", label: "Overview", to: "/admin/dashboard", icon: LayoutGrid },
  { key: "clients", label: "Clients", to: "/admin/dashboard/clients", icon: Users },
  { key: "leads", label: "Leads", to: "/admin/dashboard/leads", icon: Flame },
  { key: "quotes", label: "Quotes", to: "/admin/dashboard/quotes", icon: FileText },
  { key: "appointments", label: "Appointments", to: "/admin/dashboard/appointments", icon: CalendarClock },
  { key: "invoices", label: "Invoices", to: "/admin/dashboard/invoices", icon: Receipt },
  { key: "payments", label: "Payments", to: "/admin/dashboard/payments", icon: CreditCard },
  { key: "analytics", label: "Analytics", to: "/admin/dashboard/analytics", icon: BarChart3 },
  { key: "audit", label: "Audit Logs", to: "/admin/dashboard/audit", icon: ScrollText },
];

export default function AdminDashboard({ section = "overview" }) {
  return (
    <DashboardShell nav={NAV} basePath="/admin/dashboard" title="COMMAND CENTER">
      {section === "overview" ? <Overview /> :
       section === "clients" ? <Clients /> :
       section === "leads" ? <Leads /> :
       section === "quotes" ? <Quotes /> :
       section === "appointments" ? <Appointments /> :
       section === "invoices" ? <Invoices /> :
       section === "payments" ? <Payments /> :
       section === "analytics" ? <Analytics /> :
       section === "audit" ? <Audit /> : null}
    </DashboardShell>
  );
}

function useFetch(url, dep = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true; setLoading(true);
    api.get(url).then(({ data }) => { if (active) setData(data); }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, dep); // eslint-disable-line
  return { data, loading, setData };
}

function Spinner() { return <div className="grid place-items-center h-64"><Loader2 className="animate-spin text-cyan" /></div>; }

function Overview() {
  const { data, loading } = useFetch("/admin/overview");
  if (loading) return <Spinner />;
  const s = data?.stats || {};
  return (
    <div>
      <PageTitle title="Command Center" sub="The complete NEXORA ecosystem at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Clients" value={s.totalClients} icon={Users} />
        <StatCard label="Active Projects" value={s.activeProjects} accent="#59f0c8" icon={FolderKanban} delay={0.05} />
        <StatCard label="Pending Quotes" value={s.pendingQuotes} accent="#8ea2ff" icon={FileText} delay={0.1} />
        <StatCard label="New Leads" value={s.newLeads} accent="#ff6b6b" icon={Flame} delay={0.15} />
        <StatCard label="Appointments" value={s.upcomingAppointments} accent="#5ce1ff" icon={CalendarClock} delay={0.2} />
        <StatCard label="Outstanding" value={inr(s.outstanding)} accent="#ffb454" icon={Receipt} delay={0.25} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <Card>
          <div className="font-display text-chrome mb-4">Recent leads</div>
          {data?.recentLeads?.length ? data.recentLeads.map((l) => (
            <div key={l.lead_id} className="flex justify-between items-center py-2.5 border-b border-line last:border-0">
              <div><div className="text-sm text-chrome">{l.name} <span className="text-muted">· {l.business || l.type}</span></div>
                <div className="text-xs text-muted">{l.ai_summary?.slice(0, 60)}</div></div>
              <Badge status={l.lead_temp} />
            </div>
          )) : <Empty>No leads yet.</Empty>}
        </Card>
        <Card>
          <div className="font-display text-chrome mb-4">Recent activity</div>
          {data?.recentActivity?.length ? data.recentActivity.map((a, i) => (
            <div key={i} className="py-2.5 border-b border-line last:border-0 text-sm">
              <span className="text-cyan font-mono text-xs">{a.action}</span> <span className="text-muted">by {a.actor_email}</span>
            </div>
          )) : <Empty>No activity logged.</Empty>}
        </Card>
      </div>
    </div>
  );
}

function Clients() {
  const [q, setQ] = useState("");
  const { data, loading } = useFetch(`/admin/clients?q=${encodeURIComponent(q)}`, [q]);
  const [selected, setSelected] = useState(null);
  return (
    <div>
      <PageTitle title="Clients" sub="Every NEXORA client workspace." />
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input className="input-nx !pl-9" placeholder="Search clients..." value={q} onChange={(e) => setQ(e.target.value)} data-testid="admin-client-search" />
      </div>
      {loading ? <Spinner /> : data?.items?.length ? (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-panel2 text-muted font-mono text-[11px] uppercase tracking-wider">
              <tr><th className="text-left p-4">Client</th><th className="text-left p-4 hidden sm:table-cell">Business</th><th className="text-left p-4 hidden md:table-cell">Projects</th><th className="text-left p-4">Action</th></tr>
            </thead>
            <tbody>
              {data.items.map((c) => (
                <tr key={c.id} className="border-t border-line hover:bg-panel2/50">
                  <td className="p-4"><div className="text-chrome">{c.name}</div><div className="text-xs text-muted">{c.email}</div></td>
                  <td className="p-4 hidden sm:table-cell text-fog/80">{c.business || "-"}</td>
                  <td className="p-4 hidden md:table-cell text-fog/80">{c.projects}</td>
                  <td className="p-4"><button onClick={() => setSelected(c.id)} className="text-cyan hover:text-cyan-bright font-mono text-xs" data-testid={`admin-view-client-${c.id}`}>VIEW →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty>No clients found.</Empty>}
      <AnimatePresence>{selected && <ClientDrawer id={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </div>
  );
}

function ClientDrawer({ id, onClose }) {
  const { data, loading } = useFetch(`/admin/clients/${id}`, [id]);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState(null);
  useEffect(() => { if (data) setMsgs(data.messages); }, [data]);
  const sendMsg = async () => {
    if (!text.trim()) return;
    const { data: r } = await api.post("/admin/messages", { client_id: id, body: text });
    setMsgs((m) => [...(m || []), r.message]); setText("");
  };
  return (
    <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div className="relative w-full max-w-lg bg-ink border-l border-line h-full overflow-y-auto p-6" initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} data-testid="admin-client-drawer">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-chrome"><X size={20} /></button>
        {loading || !data ? <Spinner /> : (
          <div className="space-y-6">
            <div>
              <div className="font-display text-2xl text-chrome">{data.profile.name}</div>
              <div className="text-sm text-muted">{data.profile.business} · {data.profile.email}</div>
            </div>
            <Section title="Projects">{data.projects.length ? data.projects.map((p) => (
              <div key={p.project_id} className="py-2 border-b border-line last:border-0"><div className="flex justify-between"><span className="text-sm text-chrome">{p.name}</span><Badge status={p.status} /></div><div className="mt-2"><Progress value={p.progress} /></div></div>
            )) : <Muted>No projects.</Muted>}</Section>
            <Section title="Quotes">{data.quotes.length ? data.quotes.map((q) => (
              <Row key={q.quote_id} l={q.config?.package?.toUpperCase() || "QUOTE"} r={`${inr(q.estimate?.oneTime?.low)}–${inr(q.estimate?.oneTime?.high)}`} />
            )) : <Muted>No quotes.</Muted>}</Section>
            <Section title="Invoices">{data.invoices.length ? data.invoices.map((i) => (
              <div key={i.invoice_id} className="flex justify-between py-2 border-b border-line last:border-0"><span className="text-sm text-fog/80 font-mono">{i.number}</span><span className="flex items-center gap-2 text-chrome">{inr(i.amount)} <Badge status={i.status} /></span></div>
            )) : <Muted>No invoices.</Muted>}</Section>
            <Section title="Appointments">{data.appointments.length ? data.appointments.map((a) => (
              <Row key={a.appointment_id} l={a.service} r={`${a.date} ${a.time}`} />
            )) : <Muted>None.</Muted>}</Section>
            <Section title="Files">{data.files.length ? data.files.map((f) => <Muted key={f.file_id}>{f.name}</Muted>) : <Muted>No files.</Muted>}</Section>
            <Section title="Messages">
              <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                {msgs?.length ? msgs.map((m) => (
                  <div key={m.message_id} className={`text-sm rounded-lg px-3 py-2 ${m.sender === "admin" ? "bg-cyan/10 text-cyan" : "bg-panel2 text-fog"}`}><span className="text-[10px] opacity-60">{m.sender_name}: </span>{m.body}</div>
                )) : <Muted>No messages.</Muted>}
              </div>
              <div className="flex gap-2">
                <input className="input-nx !py-2" placeholder="Reply to client..." value={text} onChange={(e) => setText(e.target.value)} data-testid="admin-message-input" />
                <button onClick={sendMsg} className="btn-primary !px-3 !py-2" data-testid="admin-message-send"><Send size={16} /></button>
              </div>
            </Section>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
const Section = ({ title, children }) => <div><div className="font-mono text-[11px] tracking-widest text-cyan mb-2">{title.toUpperCase()}</div><div className="panel p-4">{children}</div></div>;
const Muted = ({ children }) => <div className="text-sm text-muted py-1">{children}</div>;
const Row = ({ l, r }) => <div className="flex justify-between py-2 border-b border-line last:border-0"><span className="text-sm text-fog/80">{l}</span><span className="text-sm text-chrome">{r}</span></div>;

function Leads() {
  const { data, loading, setData } = useFetch("/admin/leads");
  const [busy, setBusy] = useState(null);
  const summarize = async (id) => {
    setBusy(id);
    try { const { data: r } = await api.post("/admin/ai/summarize", { lead_id: id });
      setData((d) => ({ items: d.items.map((l) => l.lead_id === id ? { ...l, ai_summary: r.summary, lead_temp: r.lead_temp } : l) })); } catch (e) {} finally { setBusy(null); }
  };
  const setStatus = async (id, status) => {
    await api.patch(`/admin/leads/${id}`, { status });
    setData((d) => ({ items: d.items.map((l) => l.lead_id === id ? { ...l, status } : l) }));
  };
  if (loading) return <Spinner />;
  return (
    <div><PageTitle title="Leads" sub="Deterministically classified. AI summaries for review only." />
      {data?.items?.length ? <div className="space-y-3">{data.items.map((l) => (
        <Card key={l.lead_id}>
          <div className="flex flex-wrap justify-between gap-3 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><span className="text-chrome font-display">{l.name}</span><Badge status={l.lead_temp} /><span className="chip !text-[9px]">{l.type}</span></div>
              <div className="text-xs text-muted mt-1">{l.business} · {l.email} · {l.whatsapp}</div>
              <div className="text-sm text-fog/80 mt-2">{l.ai_summary}</div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <select value={l.status} onChange={(e) => setStatus(l.lead_id, e.target.value)} className="input-nx !py-1.5 !px-3 text-xs w-32" data-testid={`lead-status-${l.lead_id}`}>
                {["new", "reviewing", "contacted", "won", "lost"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => summarize(l.lead_id)} className="btn-ghost !py-1.5 !px-3 text-xs" disabled={busy === l.lead_id} data-testid={`lead-ai-${l.lead_id}`}>
                {busy === l.lead_id ? <Loader2 size={14} className="animate-spin" /> : <><Sparkles size={14} /> AI re-summarize</>}
              </button>
            </div>
          </div>
        </Card>
      ))}</div> : <Empty>No leads yet.</Empty>}
    </div>
  );
}

function Quotes() {
  const { data, loading } = useFetch("/admin/quotes");
  if (loading) return <Spinner />;
  return (
    <div><PageTitle title="Quotes" sub="Every quote requested." />
      {data?.items?.length ? <div className="space-y-3">{data.items.map((q) => (
        <Card key={q.quote_id}><div className="flex flex-wrap justify-between gap-3">
          <div><div className="text-chrome">{q.name} <span className="text-muted">· {q.business}</span></div>
            <div className="text-xs text-muted mt-1">{q.config?.package?.toUpperCase()} · {q.config?.pages} pages · {q.config?.features?.join(", ")}</div></div>
          <div className="text-right"><div className="font-display text-cyan">{inr(q.estimate?.oneTime?.low)}–{inr(q.estimate?.oneTime?.high)}</div><Badge status={q.lead_temp} /></div>
        </div></Card>
      ))}</div> : <Empty>No quotes yet.</Empty>}
    </div>
  );
}

function Appointments() {
  const { data, loading } = useFetch("/admin/appointments");
  if (loading) return <Spinner />;
  return (
    <div><PageTitle title="Appointments" sub="Booking requests & scheduled calls." />
      <div className="font-mono text-[11px] tracking-widest text-cyan mb-3">REQUESTS</div>
      {data?.requests?.length ? <div className="space-y-2 mb-8">{data.requests.map((r) => (
        <Card key={r.lead_id}><div className="flex justify-between"><div><div className="text-chrome">{r.name} · {r.service}</div><div className="text-xs text-muted">{r.date} at {r.time} · {r.email}</div></div><Badge status={r.status} /></div></Card>
      ))}</div> : <Empty>No booking requests.</Empty>}
    </div>
  );
}

function Invoices() {
  const { data, loading } = useFetch("/admin/invoices");
  if (loading) return <Spinner />;
  return (<div><PageTitle title="Invoices" sub="All client invoices." />
    {data?.items?.length ? <div className="space-y-2">{data.items.map((i) => (
      <Card key={i.invoice_id}><div className="flex justify-between"><span className="font-mono text-fog/80">{i.number}</span><span className="flex items-center gap-2 text-chrome">{inr(i.amount)} <Badge status={i.status} /></span></div></Card>
    ))}</div> : <Empty>No invoices.</Empty>}</div>);
}

function Payments() {
  const { data, loading } = useFetch("/admin/payments");
  if (loading) return <Spinner />;
  return (<div><PageTitle title="Payments" sub="Server-verified payments." />
    {data?.items?.length ? <div className="space-y-2">{data.items.map((p) => (
      <Card key={p.payment_id}><div className="flex justify-between"><span className="text-fog/80">Invoice {p.invoice_id} · {p.provider}</span><span className="flex items-center gap-2 text-chrome">{inr(p.amount)} <Badge status={p.status} /></span></div></Card>
    ))}</div> : <Empty>No payments recorded. Cashfree wiring pending.</Empty>}</div>);
}

function Analytics() {
  const { data, loading } = useFetch("/admin/analytics");
  if (loading) return <Spinner />;
  const max = Math.max(1, ...(data?.byEvent || []).map((e) => e.count));
  return (<div><PageTitle title="Analytics" sub="Tracked engagement events." />
    <StatCard label="Total events" value={data?.total || 0} />
    <Card className="mt-4">{data?.byEvent?.length ? data.byEvent.map((e) => (
      <div key={e.event} className="py-2 border-b border-line last:border-0">
        <div className="flex justify-between text-sm"><span className="text-fog/80 font-mono text-xs">{e.event}</span><span className="text-cyan">{e.count}</span></div>
        <div className="mt-1.5"><Progress value={(e.count / max) * 100} /></div>
      </div>
    )) : <Empty>No events tracked yet. Interact with the public site to generate data.</Empty>}</Card>
  </div>);
}

function Audit() {
  const { data, loading } = useFetch("/admin/audit");
  if (loading) return <Spinner />;
  return (<div><PageTitle title="Audit Logs" sub="Sensitive admin actions are recorded." />
    <Card>{data?.items?.length ? data.items.map((a, i) => (
      <div key={i} className="py-2.5 border-b border-line last:border-0 flex justify-between text-sm">
        <span><span className="text-cyan font-mono text-xs">{a.action}</span> <span className="text-muted">· {a.target?.slice(0, 20)}</span></span>
        <span className="text-muted text-xs">{a.actor_email}</span>
      </div>
    )) : <Empty>No audit entries yet.</Empty>}</Card>
  </div>);
}
