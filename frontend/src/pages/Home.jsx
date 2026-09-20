import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight, ArrowRight, Hammer, TrendingUp, Workflow, MapPin, Printer, Check,
} from "lucide-react";
import NexoraCore from "../components/NexoraCore";
import { Seo, SectionHeading, Reveal, Button, Kicker, StatusPill } from "../components/ui";
import { SERVICES, AUDIENCES, PROCESS, DEMO_PROJECTS } from "../data";
import { track } from "../lib/analytics";

const MISSIONS = [
  { icon: Hammer, title: "BUILD", desc: "Websites, portfolios & startup sites.", to: "/services" },
  { icon: TrendingUp, title: "GROW", desc: "Google Ads that reach ready buyers.", to: "/services" },
  { icon: Workflow, title: "AUTOMATE", desc: "Systems that handle the busywork.", to: "/services" },
  { icon: MapPin, title: "GET FOUND", desc: "Local SEO & Google Business.", to: "/services" },
  { icon: Printer, title: "GET SEEN", desc: "Flex printing & physical ads.", to: "/services" },
];

export default function Home() {
  return (
    <div>
      <Seo title="Build. Grow. Get Found" description="NEXORA — a digital agency helping businesses, startups and students get noticed online and offline. Websites, Google Business, Ads, SEO, automation & flex printing." />

      {/* HERO */}
      <section className="relative overflow-hidden pt-24 sm:pt-28">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 radial-fade" />
        <div className="container-nx relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-5">
              <span className="chip"><StatusPill label="NEXORA DIGITAL CORE" /></span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
              className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.02] text-chrome"
            >
              BUILD. GROW. <span className="text-cyan glow-text">GET FOUND.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-5 text-fog/85 text-base sm:text-lg max-w-xl mx-auto"
            >
              From digital presence to physical visibility — NEXORA helps you get noticed online and offline.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Button to="/quote" onClick={() => track("cta_click", { cta: "start_project", loc: "hero" })} data-testid="hero-primary-cta">
                START YOUR PROJECT <ArrowUpRight size={18} />
              </Button>
              <Button to="/services" variant="ghost" data-testid="hero-secondary-cta">
                EXPLORE SERVICES <ArrowRight size={18} />
              </Button>
            </motion.div>
          </div>

          <NexoraCore />
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="container-nx py-20 sm:py-28">
        <Reveal><SectionHeading center kicker="WHAT WE DO" title="One core. Nine capabilities." sub="Everything you need to get online and offline — connected through the NEXORA core." /></Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.key} delay={i * 0.04}>
              <Link to="/services" className="panel panel-hover p-6 block h-full group" data-testid={`home-service-${s.key}`}>
                <div className="flex items-start justify-between">
                  <div className="h-11 w-11 rounded-xl grid place-items-center border border-line" style={{ color: s.color }}>
                    <s.icon size={22} />
                  </div>
                  <span className="chip !text-[10px]" style={{ color: s.color, borderColor: `${s.color}55` }}>{s.zone}</span>
                </div>
                <h3 className="mt-5 font-display text-lg text-chrome group-hover:text-cyan transition-colors">{s.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{s.short}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CHOOSE YOUR MISSION */}
      <section className="relative py-20 sm:py-24 border-y border-line bg-ink">
        <div className="container-nx">
          <Reveal><SectionHeading center kicker="CHOOSE YOUR MISSION" title="Where do you want to go?" /></Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {MISSIONS.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.06}>
                <Link to={m.to} className="panel panel-hover p-6 flex flex-col items-center text-center h-full">
                  <div className="h-14 w-14 rounded-full grid place-items-center border border-cyan/40 text-cyan mb-4" style={{ boxShadow: "0 0 26px -8px rgba(44,198,232,0.6)" }}>
                    <m.icon size={24} />
                  </div>
                  <div className="font-display font-bold tracking-widest text-chrome">{m.title}</div>
                  <p className="mt-2 text-xs text-muted">{m.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHO ARE YOU BUILDING FOR */}
      <section className="container-nx py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <SectionHeading kicker="WHO WE BUILD FOR" title="Built for anyone ready to be seen." sub="Businesses, startups, students and individuals — in India and worldwide." />
            <Button to="/quote" className="mt-8">START YOUR PROJECT <ArrowUpRight size={18} /></Button>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {AUDIENCES.map((a, i) => (
              <Reveal key={a.key} delay={i * 0.05}>
                <div className="panel panel-hover p-6 h-full">
                  <a.icon size={22} className="text-cyan" />
                  <h4 className="mt-4 font-display text-base text-chrome">{a.label}</h4>
                  <p className="mt-1.5 text-sm text-muted">{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW WE BUILD */}
      <section className="relative py-20 sm:py-24 border-y border-line bg-ink overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="container-nx relative">
          <Reveal><SectionHeading center kicker="HOW WE BUILD" title="A clear build sequence." /></Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PROCESS.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.06}>
                <div className="panel p-6 h-full relative hud-corner">
                  <div className="font-mono text-cyan text-sm">{p.n}</div>
                  <h4 className="mt-3 font-display text-base text-chrome">{p.title}</h4>
                  <p className="mt-2 text-xs text-muted leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="text-center mt-10"><Button to="/process" variant="ghost">SEE FULL PROCESS <ArrowRight size={16} /></Button></div>
        </div>
      </section>

      {/* DEMO PROJECT WORLDS */}
      <section className="container-nx py-20 sm:py-28">
        <Reveal><SectionHeading center kicker="PROJECT WORLDS" title="Explore demo worlds." sub="Concept builds that show how different businesses come to life. Each is clearly a demo." /></Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {DEMO_PROJECTS.map((p, i) => (
            <Reveal key={p.key} delay={i * 0.06}>
              <Link to="/work" className="group relative block panel overflow-hidden h-72" data-testid={`home-demo-${p.key}`}>
                <img src={p.img} alt={`${p.name} demo`} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
                <span className="absolute top-4 left-4 chip !text-[10px] bg-ink/70" style={{ color: p.accent, borderColor: `${p.accent}66` }}>DEMO PROJECT</span>
                <div className="absolute bottom-0 p-6">
                  <div className="font-mono text-[11px] tracking-widest" style={{ color: p.accent }}>{p.type.toUpperCase()}</div>
                  <h3 className="font-display text-2xl text-chrome mt-1">{p.name}</h3>
                  <p className="text-sm text-fog/80 mt-1">{p.tagline}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* GET SEEN — ONLINE + OFFLINE */}
      <section className="relative py-20 sm:py-24 border-y border-line bg-ink">
        <div className="container-nx grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <Kicker className="mb-3">GET SEEN — ONLINE + OFFLINE</Kicker>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-chrome leading-tight">
              Not just a website. <span className="text-cyan">Real-world visibility.</span>
            </h2>
            <p className="mt-4 text-fog/80">Flex printing, banners, shop signage and event material — designed and printed to get you noticed where it matters.</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-2">
              {["Business banners", "Shop signage", "Event & opening banners", "Custom-size flex", "Promotional banners", "Design + printing"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-fog/80"><Check size={16} className="text-cyan" /> {t}</div>
              ))}
            </div>
            <Button to="/quote?type=printing" className="mt-7" onClick={() => track("cta_click", { cta: "printing_quote", loc: "home" })} data-testid="home-printing-cta">
              GET A PRINTING QUOTE <ArrowUpRight size={18} />
            </Button>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="panel overflow-hidden h-80 relative hud-corner">
              <img src="https://images.unsplash.com/photo-1567443024551-f3e3cc2be870?w=1000&q=70" alt="Flex printing and banners" loading="lazy" className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink/70 to-transparent" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="container-nx py-20 sm:py-28">
        <Reveal><SectionHeading center kicker="PRICING" title="Transparent starting points." sub="Clear ranges. No surprises. Configure your exact build for a live estimate." /></Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { name: "LAUNCH", range: "₹3,000 – ₹5,000", desc: "Get online, fast.", care: "Care from ₹900/mo" },
            { name: "BUSINESS", range: "₹8,000 – ₹10,000", desc: "A site built to grow.", care: "Care from ₹1,500/mo", featured: true },
            { name: "AUTOMATION", range: "₹13,000 – ₹18,000", desc: "Website + systems.", care: "Care from ₹3,000/mo" },
          ].map((p, i) => (
            <Reveal key={p.name} delay={i * 0.06}>
              <div className={`panel p-7 h-full relative ${p.featured ? "border-cyan/50" : ""}`} style={p.featured ? { boxShadow: "0 0 0 1px rgba(44,198,232,0.3), 0 30px 70px -34px rgba(44,198,232,0.4)" } : {}}>
                {p.featured && <span className="absolute -top-3 left-7 chip !text-[10px] bg-cyan text-[#04121a] border-cyan">POPULAR</span>}
                <div className="font-display font-bold tracking-widest text-chrome">{p.name}</div>
                <div className="mt-3 font-mono text-2xl text-cyan">{p.range}</div>
                <p className="mt-2 text-sm text-muted">{p.desc}</p>
                <p className="mt-1 text-xs text-muted/70">{p.care}</p>
                <Button to="/quote" variant={p.featured ? "primary" : "ghost"} className="mt-6 w-full">CONFIGURE</Button>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="text-center text-xs text-muted/70 mt-6 max-w-2xl mx-auto">Domain, hosting, paid APIs, payment-provider fees, Google Ads budget and printing material are billed separately.</p>
      </section>

      {/* FINAL CTA */}
      <section className="container-nx pb-24">
        <Reveal>
          <div className="relative panel overflow-hidden p-10 sm:p-16 text-center">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="absolute inset-0 radial-fade" />
            <div className="relative">
              <img src="/nexora-logo.png" alt="NEXORA" className="h-16 w-16 mx-auto mb-6 animate-float" />
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-chrome">Ready to enter the NEXORA world?</h2>
              <p className="mt-4 text-fog/80 max-w-lg mx-auto">Tell us what you want to build. Get a live estimate in minutes.</p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                <Button to="/quote" onClick={() => track("cta_click", { cta: "start_project", loc: "final" })}>START YOUR PROJECT <ArrowUpRight size={18} /></Button>
                <Button to="/contact" variant="ghost">TALK TO US <ArrowRight size={18} /></Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
