import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import clsx from "clsx";

export function Seo({ title, description }) {
  useEffect(() => {
    if (title) document.title = `${title} — NEXORA`;
    if (description) {
      let m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute("content", description);
    }
    return () => { document.title = "NEXORA — Build. Grow. Get Found."; };
  }, [title, description]);
  return null;
}

export function Kicker({ children, className }) {
  return <div className={clsx("kicker", className)}>{children}</div>;
}

export function SectionHeading({ kicker, title, sub, center, className }) {
  return (
    <div className={clsx(center && "text-center mx-auto max-w-2xl", className)}>
      {kicker && <Kicker className="mb-3">{kicker}</Kicker>}
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.05] text-chrome">
        {title}
      </h2>
      {sub && <p className="mt-4 text-fog/80 text-base sm:text-lg leading-relaxed">{sub}</p>}
    </div>
  );
}

export function Reveal({ children, delay = 0, y = 24, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Button({ as = "button", to, variant = "primary", className, children, ...props }) {
  const cls = clsx(variant === "primary" ? "btn-primary" : "btn-ghost", className);
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>;
  if (as === "a") return <a className={cls} {...props}>{children}</a>;
  return <button className={cls} {...props}>{children}</button>;
}

export function StatusPill({ label = "SYSTEM ONLINE" }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-cyan">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan" />
      </span>
      {label}
    </span>
  );
}
