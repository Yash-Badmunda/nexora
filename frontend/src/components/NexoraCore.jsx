import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const NODES = [
  { key: "BUILD", angle: -90, color: "#5ce1ff" },
  { key: "GROW", angle: -18, color: "#2cc6e8" },
  { key: "AUTOMATE", angle: 54, color: "#59f0c8" },
  { key: "GET FOUND", angle: 126, color: "#8ea2ff" },
  { key: "GET SEEN", angle: 198, color: "#ffb454" },
];

function prefersReducedMotion() {
  return typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function NexoraCore() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const [active, setActive] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    const reduced = prefersReducedMotion();
    let raf;
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    const isSmall = () => window.innerWidth < 640;
    let particles = [];

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = isSmall() ? 26 : 60;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.4,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;

      // connections between near particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!reduced) { p.x += p.vx; p.y += p.vy; }
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < 120) {
            ctx.strokeStyle = `rgba(44,198,232,${(1 - d / 120) * 0.14})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(150,190,210,0.55)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }

      // core glow
      const t = reduced ? 0 : Date.now() / 1000;
      const pulse = reduced ? 0.5 : (Math.sin(t * 1.6) * 0.5 + 0.5);
      const rings = [46, 78, 116];
      rings.forEach((rad, k) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(44,198,232,${0.10 + (k === 0 ? pulse * 0.35 : 0.05)})`;
        ctx.lineWidth = k === 0 ? 2 : 1;
        ctx.arc(cx, cy, rad + (k === 0 ? pulse * 6 : 0), 0, Math.PI * 2);
        ctx.stroke();
      });
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90);
      grad.addColorStop(0, `rgba(92,225,255,${0.28 + pulse * 0.12})`);
      grad.addColorStop(1, "rgba(92,225,255,0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, 90, 0, Math.PI * 2); ctx.fill();

      // spokes to node ring
      const ringR = Math.min(w, h) * 0.4;
      NODES.forEach((n) => {
        const a = (n.angle * Math.PI) / 180;
        const nx = cx + Math.cos(a) * ringR;
        const ny = cy + Math.sin(a) * ringR;
        const isActive = active === n.key;
        ctx.strokeStyle = isActive ? "rgba(92,225,255,0.9)" : "rgba(44,198,232,0.28)";
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.stroke();
        // travelling pulse dot
        if (!reduced) {
          const prog = ((t * 0.35 + n.angle / 360) % 1);
          const px = cx + (nx - cx) * prog;
          const py = cy + (ny - cy) * prog;
          ctx.fillStyle = n.color;
          ctx.beginPath(); ctx.arc(px, py, 2.4, 0, Math.PI * 2); ctx.fill();
        }
      });

      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();
    if (reduced) draw();

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    wrap.addEventListener("mousemove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      wrap.removeEventListener("mousemove", onMove);
    };
  }, [active]);

  return (
    <div ref={wrapRef} className="relative w-full h-[420px] sm:h-[540px] md:h-[600px]" data-testid="nexora-core">
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />

      {/* Central core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
        <motion.img
          src="/nexora-logo.png"
          alt="NEXORA logo"
          className="w-20 sm:w-24 md:w-28 select-none drop-shadow-[0_0_30px_rgba(44,198,232,0.6)]"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
        <span className="mt-2 font-mono text-[10px] tracking-[0.4em] text-cyan/80">NEXORA CORE</span>
      </div>

      {/* Node ring — square container so % positions form a true circle */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square w-[82%] max-w-[520px] pointer-events-none">
        {NODES.map((n, i) => {
          const a = (n.angle * Math.PI) / 180;
          const left = 50 + Math.cos(a) * 50;
          const top = 50 + Math.sin(a) * 50;
          return (
            <div
              key={n.key}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <motion.button
                data-testid={`core-node-${n.key.toLowerCase().replace(" ", "-")}`}
                className="group"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.12, type: "spring", stiffness: 180 }}
                onMouseEnter={() => setActive(n.key)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(n.key)}
                onBlur={() => setActive(null)}
              >
                <span
                  className="flex items-center gap-2 rounded-full border px-3 py-1.5 font-display text-[11px] sm:text-xs font-semibold tracking-wide glass transition-all duration-200 whitespace-nowrap"
                  style={{
                    borderColor: active === n.key ? n.color : "rgba(30,38,48,1)",
                    color: active === n.key ? n.color : "#c3ccd6",
                    boxShadow: active === n.key ? `0 0 24px -6px ${n.color}` : "none",
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: n.color }} />
                  {n.key}
                </span>
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
