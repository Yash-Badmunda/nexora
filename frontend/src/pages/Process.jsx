import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Seo, SectionHeading, Button, Reveal } from "../components/ui";
import { PROCESS } from "../data";

export default function Process() {
  return (
    <div className="pt-28">
      <Seo title="Process" description="How NEXORA builds — a clear five-step sequence: Discover, Design, Build, Launch, Grow." />
      <div className="container-nx">
        <Reveal><SectionHeading center kicker="BUILD SEQUENCE" title="How we build." sub="A clear, transparent path from idea to launch — and beyond." /></Reveal>

        <div className="mt-14 relative max-w-3xl mx-auto">
          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan/60 via-line to-transparent hidden sm:block" />
          <div className="space-y-6">
            {PROCESS.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.08}>
                <div className="flex gap-5 items-start">
                  <div className="relative shrink-0">
                    <div className="h-14 w-14 rounded-2xl grid place-items-center border border-cyan/40 text-cyan font-mono bg-ink" style={{ boxShadow: "0 0 26px -8px rgba(44,198,232,0.6)" }}>
                      {p.n}
                    </div>
                  </div>
                  <div className="panel panel-hover p-6 flex-1">
                    <h3 className="font-display text-xl text-chrome">{p.title}</h3>
                    <p className="mt-2 text-fog/80">{p.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="text-center mt-14 mb-6">
          <Button to="/quote">START YOUR PROJECT <ArrowUpRight size={18} /></Button>
        </div>
      </div>
    </div>
  );
}
