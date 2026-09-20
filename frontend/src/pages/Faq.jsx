import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, ArrowUpRight } from "lucide-react";
import { Seo, SectionHeading, Button, Reveal } from "../components/ui";
import { FAQS } from "../data";

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="pt-28">
      <Seo title="FAQ" description="Answers about NEXORA pricing, timelines, hosting, domains, Google Business, Ads, SEO, maintenance, automation, international clients, payments and flex printing." />
      <div className="container-nx max-w-3xl">
        <Reveal><SectionHeading center kicker="ANSWERS" title="Frequently asked." /></Reveal>
        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => {
            const on = open === i;
            return (
              <Reveal key={i} delay={i * 0.02}>
                <div className={`panel overflow-hidden ${on ? "border-cyan/40" : ""}`}>
                  <button
                    onClick={() => setOpen(on ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                    data-testid={`faq-toggle-${i}`}
                    aria-expanded={on}
                  >
                    <span className="font-display text-base sm:text-lg text-chrome">{f.q}</span>
                    <span className="text-cyan shrink-0">{on ? <Minus size={20} /> : <Plus size={20} />}</span>
                  </button>
                  <AnimatePresence>
                    {on && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="px-5 pb-5 text-fog/80 leading-relaxed">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
        <div className="text-center mt-12">
          <p className="text-fog/80 mb-5">Still have a question?</p>
          <Button to="/contact">ASK US <ArrowUpRight size={18} /></Button>
        </div>
      </div>
    </div>
  );
}
