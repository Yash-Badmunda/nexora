import React, { useEffect, useState } from "react";
import {
  LayoutGrid, FolderKanban, ListTodo, MessageSquare, FileText, CalendarClock,
  Receipt, CreditCard, Files, Settings as SettingsIcon, Send, Loader2, FolderGit2,
} from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { PageTitle, StatCard, Badge, Empty, Card, Progress, inr } from "../components/dashboard-ui";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const NAV = [
  { key: "overview", label: "Overview", to: "/dashboard", icon: LayoutGrid },
  { key: "projects", label: "Projects", to: "/dashboard/projects", icon: FolderKanban },
  { key: "tasks", label: "Tasks", to: "/dashboard/tasks", icon: ListTodo },
  { key: "messages", label: "Messages", to: "/dashboard/messages", icon: MessageSquare },
  { key: "quotes", label: "Quotes", to: "/dashboard/quotes", icon: FileText },
  { key: "appointments", label: "Appointments", to: "/dashboard/appointments", icon: CalendarClock },
  { key: "invoices", label: "Invoices", to: "/dashboard/invoices", icon: Receipt },
  { key: "payments", label: "Payments", to: "/dashboard/payments", icon: CreditCard },
  { key: "files", label: "Files", to: "/dashboard/files", icon: Files },
  { key: "settings", label: "Settings", to: "/dashboard/settings", icon: SettingsIcon },
];

export default function ClientDashboard({ section = "overview" }) {
  const { user, refresh } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const endpoints = {
    overview: "/client/overview", projects: "/client/projects", tasks: "/client/tasks",
    messages: "/client/messages", quotes: "/client/quotes", appointments: "/client/appointments",
    invoices: "/client/invoices", payments: "/client/payments", files: "/client/files",
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    if (section === "settings") { setLoading(false); return; }
    api.get(endpoints[section]).then(({ data }) => { if (active) setData(data); }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [section]);

  return (
    <DashboardShell nav={NAV} basePath="/dashboard" title="CLIENT WORKSPACE">
      {loading ? <div className="grid place-items-center h-64"><Loader2 className="animate-spin text-cyan" /></div> :
        section === "overview" ? <Overview data={data} /> :
        section === "projects" ? <Projects items={data?.items} /> :
        section === "tasks" ? <Tasks items={data?.items} /> :
        section === "messages" ? <Messages initial={data?.items} /> :
        section === "quotes" ? <Quotes items={data?.items} /> :
        section === "appointments" ? <Appointments items={data?.items} /> :
        section === "invoices" ? <Invoices items={data?.items} /> :
        section === "payments" ? <Payments items={data?.items} /> :
        section === "files" ? <FilesView items={data?.items} /> :
        section === "settings" ? <SettingsView user={user} refresh={refresh} /> : null}
    </DashboardShell>
  );
}

function Overview({ data }) {
  if (!data) return null;
  const s = data.stats;
  return (
    <div>
      <PageTitle title={`Welcome, ${data.profile.name?.split(" ")[0] || ""}`} sub={data.profile.business} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Projects" value={s.activeProjects} icon={FolderGit2} delay={0} />
        <StatCard label="Open Tasks" value={s.openTasks} accent="#59f0c8" icon={ListTodo} delay={0.05} />
        <StatCard label="Appointments" value={s.upcomingAppointments} accent="#8ea2ff" icon={CalendarClock} delay={0.1} />
        <StatCard label="Outstanding" value={inr(s.outstanding)} accent="#ffb454" icon={Receipt} delay={0.15} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <Card>
          <div className="font-display text-chrome mb-4">Projects</div>
          {data.projects?.length ? data.projects.map((p) => (
            <div key={p.project_id} className="py-3 border-b border-line last:border-0">
              <div className="flex justify-between items-center mb-2"><span className="text-sm text-chrome">{p.name}</span><Badge status={p.status} /></div>
              <Progress value={p.progress} />
            </div>
          )) : <Empty>No projects yet.</Empty>}
        </Card>
        <Card>
          <div className="font-display text-chrome mb-4">Your tasks</div>
          {data.tasks?.length ? data.tasks.map((t) => (
            <div key={t.task_id} className="flex justify-between items-center py-2.5 border-b border-line last:border-0">
              <span className="text-sm text-fog/85">{t.title}</span><Badge status={t.status} />
            </div>
          )) : <Empty>You're all caught up.</Empty>}
        </Card>
      </div>
    </div>
  );
}

function Projects({ items }) {
  return (
    <div><PageTitle title="Projects" sub="Your active and past builds." />
      {items?.length ? <div className="grid gap-4 sm:grid-cols-2">{items.map((p) => (
        <Card key={p.project_id}>
          <div className="flex justify-between items-center"><span className="font-display text-chrome">{p.name}</span><Badge status={p.status} /></div>
          <div className="text-xs text-muted mt-1">{p.type}</div>
          <div className="mt-4 flex items-center gap-3"><Progress value={p.progress} /><span className="font-mono text-xs text-cyan">{p.progress}%</span></div>
        </Card>
      ))}</div> : <Empty>No projects yet. Start one from the configurator.</Empty>}
    </div>
  );
}

function Tasks({ items }) {
  return (
    <div><PageTitle title="Tasks" sub="What needs your attention." />
      <Card>{items?.length ? items.map((t) => (
        <div key={t.task_id} className="flex justify-between items-center py-3 border-b border-line last:border-0">
          <div><div className="text-sm text-chrome">{t.title}</div>{t.due_date && <div className="text-xs text-muted">Due {t.due_date}</div>}</div>
          <Badge status={t.status} />
        </div>
      )) : <Empty>No tasks assigned.</Empty>}</Card>
    </div>
  );
}

function Messages({ initial }) {
  const [msgs, setMsgs] = useState(initial || []);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post("/client/messages", { body: text });
      setMsgs((m) => [...m, data.message]); setText("");
    } catch (e) {} finally { setSending(false); }
  };
  return (
    <div><PageTitle title="Messages" sub="Chat with the NEXORA team." />
      <Card className="!p-0 overflow-hidden">
        <div className="h-[52vh] overflow-y-auto p-5 space-y-3">
          {msgs?.length ? msgs.map((m) => (
            <div key={m.message_id} className={`flex ${m.sender === "client" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.sender === "client" ? "bg-cyan text-[#04121a]" : "bg-panel2 border border-line text-fog"}`}>
                <div className="text-[10px] opacity-70 mb-0.5">{m.sender_name}</div>{m.body}
              </div>
            </div>
          )) : <Empty>No messages yet. Say hello!</Empty>}
        </div>
        <form onSubmit={send} className="p-3 border-t border-line flex gap-2">
          <input className="input-nx" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} data-testid="client-message-input" />
          <button className="btn-primary !px-3" disabled={sending} data-testid="client-message-send">{sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button>
        </form>
      </Card>
    </div>
  );
}

function Quotes({ items }) {
  return (
    <div><PageTitle title="Quotes" sub="Your requested estimates." />
      {items?.length ? <div className="space-y-3">{items.map((q) => (
        <Card key={q.quote_id}>
          <div className="flex justify-between items-center">
            <div><div className="font-mono text-xs text-muted">{q.quote_id?.slice(0, 12)}</div>
              <div className="text-chrome mt-1">{q.config?.package?.toUpperCase()} · {q.config?.features?.length || 0} features</div></div>
            <div className="text-right"><div className="font-display text-cyan">{inr(q.estimate?.oneTime?.low)}–{inr(q.estimate?.oneTime?.high)}</div><Badge status={q.status} /></div>
          </div>
        </Card>
      ))}</div> : <Empty>No quotes yet.</Empty>}
    </div>
  );
}

function Appointments({ items }) {
  return (
    <div><PageTitle title="Appointments" sub="Your scheduled calls." />
      {items?.length ? <div className="space-y-3">{items.map((a) => (
        <Card key={a.appointment_id}><div className="flex justify-between items-center">
          <div><div className="text-chrome">{a.service}</div><div className="text-xs text-muted">{a.date} at {a.time}</div></div>
          <Badge status={a.status} /></div></Card>
      ))}</div> : <Empty>No appointments scheduled.</Empty>}
    </div>
  );
}

function Invoices({ items }) {
  return (
    <div><PageTitle title="Invoices" sub="Your billing." />
      {items?.length ? <div className="space-y-3">{items.map((i) => (
        <Card key={i.invoice_id}><div className="flex justify-between items-center">
          <div><div className="text-chrome font-mono">{i.number}</div><div className="text-xs text-muted">Due {i.due_date}</div></div>
          <div className="text-right"><div className="font-display text-chrome">{inr(i.amount)}</div><Badge status={i.status} /></div></div></Card>
      ))}</div> : <Empty>No invoices yet.</Empty>}
    </div>
  );
}

function Payments({ items }) {
  return (
    <div><PageTitle title="Payments" sub="Your payment history." />
      {items?.length ? <div className="space-y-3">{items.map((p) => (
        <Card key={p.payment_id}><div className="flex justify-between items-center">
          <div><div className="text-chrome">Invoice {p.invoice_id}</div><div className="text-xs text-muted">via {p.provider}</div></div>
          <div className="text-right"><div className="font-display text-chrome">{inr(p.amount)}</div><Badge status={p.status} /></div></div></Card>
      ))}</div> : <Empty>No payments recorded.</Empty>}
    </div>
  );
}

function FilesView({ items }) {
  return (
    <div><PageTitle title="Files" sub="Shared project files." />
      {items?.length ? <div className="grid gap-3 sm:grid-cols-2">{items.map((f) => (
        <Card key={f.file_id}><div className="flex items-center gap-3"><Files className="text-cyan" size={22} />
          <div><div className="text-sm text-chrome">{f.name}</div><div className="text-xs text-muted">{(f.size / 1024).toFixed(0)} KB</div></div></div></Card>
      ))}</div> : <Empty>No files shared yet.</Empty>}
    </div>
  );
}

function SettingsView({ user, refresh }) {
  const [form, setForm] = useState({ name: user?.name || "", business: user?.business || "", phone: user?.phone || "" });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const save = async (e) => {
    e.preventDefault(); setSaving(true); setSaved(false);
    try { await api.put("/client/settings", form); await refresh(); setSaved(true); } catch (e) {} finally { setSaving(false); }
  };
  return (
    <div><PageTitle title="Settings" sub="Manage your profile." />
      <Card className="max-w-lg">
        <form onSubmit={save} className="space-y-4">
          <div><label className="label-nx">Name</label><input className="input-nx" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="settings-name" /></div>
          <div><label className="label-nx">Business</label><input className="input-nx" value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} /></div>
          <div><label className="label-nx">Phone</label><input className="input-nx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label-nx">Email</label><input className="input-nx opacity-60" value={user?.email} disabled /></div>
          {saved && <div className="text-sm text-emerald-400">Saved!</div>}
          <button className="btn-primary" disabled={saving} data-testid="settings-save">{saving ? <Loader2 size={16} className="animate-spin" /> : "Save changes"}</button>
        </form>
      </Card>
    </div>
  );
}
