import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { Seo, SectionHeading, Button, Reveal } from "../components/ui";
import { DEMO_PROJECTS } from "../data";

export default function Work() {
  const [open, setOpen] = useState(null);
  return (
    <div className="pt-28">
      <Seo title="Work" description="Explore NEXORA demo project worlds — concept builds for a restaurant, gym, student portfolio and startup. Clearly marked demos." />
      <div className="container-nx">
        <Reveal>
          <SectionHeading center kicker="PROJECT WORLDS" title="Explore demo worlds." sub="These are fictional concept builds — not real clients — created to show how different businesses come to life." />
        </Reveal>

        <div className="mt-6 flex justify-center">
          <span className="chip text-cyan border-cyan/40">ALL PROJECTS ON THIS PAGE ARE DEMOS</span>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {DEMO_PROJECTS.map((p, i) => (
            <Reveal key={p.key} delay={i * 0.06}>
              <div className="panel overflow-hidden group" data-testid={`work-project-${p.key}`}>
                <div className="relative h-60 overflow-hidden">
                  <img src={p.img} alt={`${p.name} demo world`} loading="lazy" className="w-full h-full object-cover opacity-55 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/50 to-transparent" />
                  <span className="absolute top-4 left-4 chip !text-[10px] bg-ink/80" style={{ color: p.accent, borderColor: `${p.accent}66` }}>DEMO PROJECT</span>
                  <div className="absolute bottom-4 left-6">
                    <div className="font-mono text-[11px] tracking-widest" style={{ color: p.accent }}>{p.type.toUpperCase()}</div>
                    <h3 className="font-display text-3xl text-chrome">{p.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-fog/80">{p.tagline}</p>
                  <button
                    onClick={() => setOpen(open === p.key ? null : p.key)}
                    className="mt-4 font-mono text-[11px] tracking-widest text-cyan hover:text-cyan-bright"
                    data-testid={`work-expand-${p.key}`}
                  >
                    {open === p.key ? "— HIDE DETAILS" : "+ VIEW WORLD DETAILS"}
                  </button>
                  <AnimatePresence>
                    {open === p.key && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <ul className="mt-4 space-y-2">
                          {p.features.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-sm text-fog/80"><Check size={16} style={{ color: p.accent }} /> {f}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="text-center mt-14 mb-8">
          <p className="text-fog/80 mb-5">Want a world like this for your business?</p>
          <Button to="/quote">START YOUR PROJECT <ArrowUpRight size={18} /></Button>
        </div>
      </div>
    </div>
  );
}
