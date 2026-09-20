import React from "react";
import { ArrowUpRight, Globe, Target, Shield, Zap } from "lucide-react";
import { Seo, SectionHeading, Button, Reveal, Kicker } from "../components/ui";

const VALUES = [
  { icon: Zap, title: "Fast & modern", desc: "Production-ready builds, optimized for speed and SEO." },
  { icon: Target, title: "Outcome-focused", desc: "We build to help you get found — online and offline." },
  { icon: Shield, title: "Honest & clear", desc: "Transparent pricing. No fake results, no empty promises." },
  { icon: Globe, title: "India → worldwide", desc: "Based in India, serving clients across the globe." },
];

export default function About() {
  return (
    <div className="pt-28">
      <Seo title="About" description="NEXORA is a digital agency helping businesses, startups, students and individuals get noticed online and offline." />
      <div className="container-nx">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <Kicker className="mb-3">DISCOVER NEXORA</Kicker>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-chrome leading-[1.05]">
              From digital presence to <span className="text-cyan glow-text">physical visibility.</span>
            </h1>
            <p className="mt-5 text-fog/85 leading-relaxed">
              NEXORA is a digital agency. We help businesses, startups, students and individuals get noticed —
              building websites and digital systems, and putting brands in front of people both online and in the real world.
            </p>
            <p className="mt-4 text-fog/80 leading-relaxed">
              We keep things simple and honest: clear pricing, real work, and no exaggerated claims. Whether you need
              a first website, a Google Business Profile, ads, automation or a printed banner — we help you build, grow and get found.
            </p>
            <Button to="/quote" className="mt-8">START YOUR PROJECT <ArrowUpRight size={18} /></Button>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="panel p-10 relative overflow-hidden hud-corner">
              <div className="absolute inset-0 grid-bg opacity-20" />
              <img src="/nexora-logo.png" alt="NEXORA" className="h-24 w-24 mx-auto animate-float relative" />
              <div className="mt-6 text-center relative">
                <div className="font-display font-bold tracking-[0.35em] text-2xl">NEXORA</div>
                <div className="font-mono text-[11px] tracking-[0.3em] text-cyan mt-2">BUILD. GROW. GET FOUND.</div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-20">
          <Reveal><SectionHeading center kicker="HOW WE WORK" title="What we stand for." /></Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.05}>
                <div className="panel panel-hover p-6 h-full">
                  <v.icon size={22} className="text-cyan" />
                  <h4 className="mt-4 font-display text-base text-chrome">{v.title}</h4>
                  <p className="mt-2 text-sm text-muted">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
