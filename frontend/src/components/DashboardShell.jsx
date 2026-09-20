import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { StatusPill } from "./ui";

export default function DashboardShell({ nav, basePath, title, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const doLogout = async () => { await logout(); navigate("/", { replace: true }); };

  const isActive = (to) => location.pathname === to || (to !== basePath && location.pathname.startsWith(to));

  const SideContent = () => (
    <>
      <Link to="/" className="flex items-center gap-2.5 px-2 mb-8">
        <img src="/nexora-logo.png" alt="NEXORA" className="h-9 w-9" />
        <div>
          <div className="font-display font-bold tracking-[0.25em] text-chrome">NEXORA</div>
          <div className="font-mono text-[9px] tracking-widest text-cyan">{title}</div>
        </div>
      </Link>
      <nav className="space-y-1">
        {nav.map((n) => {
          const active = isActive(n.to);
          return (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} data-testid={`dash-nav-${n.key}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? "bg-cyan/10 text-cyan border border-cyan/30" : "text-muted hover:text-chrome hover:bg-panel2 border border-transparent"}`}>
              <n.icon size={18} /> {n.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-void">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-line bg-ink p-4 z-30">
        <div className="flex-1 overflow-y-auto"><SideContent /></div>
        <button onClick={doLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-red-400 hover:bg-panel2 transition-all" data-testid="dash-logout">
          <LogOut size={18} /> Sign out
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 glass border-b border-line flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center gap-2"><img src="/nexora-logo.png" alt="NEXORA" className="h-8 w-8" /><span className="font-display font-bold tracking-widest text-sm">NEXORA</span></Link>
        <button onClick={() => setOpen(true)} className="text-chrome p-2" aria-label="Open menu"><Menu size={22} /></button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="lg:hidden fixed inset-0 z-50 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <motion.aside className="relative w-72 bg-ink border-r border-line p-4 flex flex-col" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}>
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-muted" aria-label="Close"><X size={22} /></button>
              <div className="flex-1 overflow-y-auto"><SideContent /></div>
              <button onClick={doLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-red-400"><LogOut size={18} /> Sign out</button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="lg:pl-64 pt-14 lg:pt-0 min-h-screen">
        <div className="hidden lg:flex items-center justify-between px-8 h-16 border-b border-line bg-ink/60">
          <StatusPill />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted">{user?.email}</span>
            <span className="h-8 w-8 rounded-full bg-cyan/15 text-cyan grid place-items-center font-display font-bold">{(user?.name || "?")[0]}</span>
          </div>
        </div>
        <div className="p-5 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
