import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { StatusPill, Button } from "./ui";

const LINKS = [
  { to: "/services", label: "SERVICES" },
  { to: "/work", label: "WORK" },
  { to: "/pricing", label: "PRICING" },
  { to: "/process", label: "PROCESS" },
  { to: "/about", label: "ABOUT" },
  { to: "/contact", label: "CONTACT" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-line" : "bg-transparent"
      }`}
    >
      <nav className="container-nx flex items-center justify-between h-16 sm:h-[72px]" aria-label="Primary">
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="nav-logo">
          <img src="/nexora-logo.png" alt="NEXORA" className="h-9 w-9 object-contain" />
          <span className="font-display font-bold tracking-[0.3em] text-lg text-chrome group-hover:text-cyan transition-colors">
            NEXORA
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-full font-display text-[12.5px] tracking-wide transition-colors ${
                  isActive ? "text-cyan" : "text-fog/80 hover:text-chrome"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <StatusPill />
          <Button to="/quote" className="!px-5 !py-2.5 text-[12px]" data-testid="nav-cta">
            START YOUR PROJECT <ArrowUpRight size={16} />
          </Button>
        </div>

        <button
          className="lg:hidden p-2 text-chrome"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          data-testid="mobile-menu-toggle"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="lg:hidden fixed inset-0 top-16 z-40 glass"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-testid="mobile-menu"
          >
            <motion.div
              className="container-nx py-8 flex flex-col gap-1"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
              {LINKS.map((l) => (
                <motion.div key={l.to} variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}>
                  <NavLink
                    to={l.to}
                    data-testid={`mobile-nav-${l.label.toLowerCase()}`}
                    className={({ isActive }) =>
                      `block py-4 border-b border-line font-display text-xl tracking-wide ${
                        isActive ? "text-cyan" : "text-chrome"
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div className="mt-6" variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
                <Button to="/quote" className="w-full" data-testid="mobile-nav-cta">
                  START YOUR PROJECT <ArrowUpRight size={18} />
                </Button>
                <Link to="/login" className="block text-center mt-4 font-mono text-xs tracking-[0.2em] text-muted">
                  CLIENT LOGIN
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
