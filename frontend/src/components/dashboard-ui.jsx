import React from "react";
import { motion } from "framer-motion";

export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export function PageTitle({ title, sub }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl sm:text-3xl text-chrome">{title}</h1>
      {sub && <p className="text-muted text-sm mt-1">{sub}</p>}
    </div>
  );
}

export function StatCard({ label, value, accent = "#2cc6e8", icon: Icon, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="panel p-5 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-10">{Icon && <Icon size={72} style={{ color: accent }} />}</div>
      <div className="font-mono text-[10px] tracking-widest text-muted uppercase">{label}</div>
      <div className="mt-2 font-display text-2xl sm:text-3xl" style={{ color: accent }}>{value}</div>
    </motion.div>
  );
}

const BADGE = {
  new: "text-cyan bg-cyan/10 border-cyan/30", reviewing: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  in_progress: "text-cyan bg-cyan/10 border-cyan/30", review: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", discovery: "text-fog bg-panel2 border-line",
  todo: "text-muted bg-panel2 border-line", done: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  paid: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", unpaid: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  overdue: "text-red-400 bg-red-400/10 border-red-400/30", success: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  scheduled: "text-cyan bg-cyan/10 border-cyan/30",
  HOT: "text-red-400 bg-red-400/10 border-red-400/30", WARM: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  COLD: "text-sky-300 bg-sky-300/10 border-sky-300/30",
};

export function Badge({ status }) {
  const cls = BADGE[status] || "text-muted bg-panel2 border-line";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wide ${cls}`}>{String(status || "-").replace("_", " ")}</span>;
}

export function Empty({ children }) {
  return <div className="panel p-10 text-center text-muted text-sm">{children}</div>;
}

export function Card({ children, className = "" }) {
  return <div className={`panel p-5 ${className}`}>{children}</div>;
}

export function Progress({ value }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-panel2 overflow-hidden">
      <div className="h-full rounded-full bg-cyan transition-all" style={{ width: `${value || 0}%` }} />
    </div>
  );
}
