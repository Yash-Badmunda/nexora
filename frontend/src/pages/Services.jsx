import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Check, Zap } from "lucide-react";
import { Seo, SectionHeading, Button, Reveal } from "../components/ui";
import { SERVICES } from "../data";

export default function Services() {
  const [active, setActive] = useState(SERVICES[0].key);
  const svc = SERVICES.find((s) => s.key === active);

  return (
    <div className="pt-28">
      <Seo title="Services" description="Explore NEXORA's capability zones — websites, portfolios, Google Business, Ads, Local SEO, automation, maintenance and flex printing." />
      <div className="container-nx">
        <Reveal><SectionHeading center kicker="CAPABILITY ZONES" title="Explore what we do." sub="Select a service node to explore its zone." /></Reveal>

        <div className="mt-12 grid lg:grid-cols-[1fr,1.1fr] gap-6">
          {/* Node list */}
          <div className="grid sm:grid-cols-2 gap-3 content-start">
            {SERVICES.map((s) => {
              const on = s.key === active;
              return (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  data-testid={`service-node-${s.key}`}
                  className={`panel text-left p-5 transition-all duration-200 ${on ? "" : "panel-hover"}`}
                  style={on ? { borderColor: s.color, boxShadow: `0 0 0 1px ${s.color}, 0 0 30px -10px ${s.color}` } : {}}
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg grid place-items-center border border-line" style={{ color: s.color }}>
                      <s.icon size={20} />
                    </div>
                    {on && <Zap size={16} style={{ color: s.color }} />}
                  </div>
                  <div className="mt-3 font-display text-sm text-chrome">{s.title}</div>
                  <div className="font-mono text-[10px] tracking-widest mt-1" style={{ color: s.color }}>{s.zone}</div>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="panel p-7 sm:p-9 relative overflow-hidden min-h-[440px]">
            <div className="absolute inset-0 grid-bg opacity-20" />
            <AnimatePresence mode="wait">
              <motion.div
                key={svc.key}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="h-16 w-16 rounded-2xl grid place-items-center border" style={{ color: svc.color, borderColor: `${svc.color}66` }}>
                  <svc.icon size={30} />
                </div>
                <h3 className="mt-5 font-display text-2xl sm:text-3xl text-chrome">{svc.title}</h3>
                <p className="mt-3 text-fog/85">{svc.short}</p>

                <div className="mt-7 grid sm:grid-cols-2 gap-6">
                  <div>
                    <div className="font-mono text-[11px] tracking-widest text-cyan mb-3">BENEFITS</div>
                    <ul className="space-y-2">
                      {svc.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-fog/80"><Check size={16} className="mt-0.5" style={{ color: svc.color }} /> {b}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-mono text-[11px] tracking-widest text-cyan mb-3">TYPICAL USE CASES</div>
                    <div className="flex flex-wrap gap-2">
                      {svc.uses.map((u) => <span key={u} className="chip">{u}</span>)}
                    </div>
                  </div>
                </div>

                <div className="mt-9 flex gap-3">
                  <Button to={svc.key === "print" ? "/quote?type=printing" : "/quote"} data-testid="service-cta">
                    {svc.key === "print" ? "GET A PRINTING QUOTE" : "GET A QUOTE"} <ArrowUpRight size={18} />
                  </Button>
                  <Button to="/contact" variant="ghost">ASK A QUESTION</Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
