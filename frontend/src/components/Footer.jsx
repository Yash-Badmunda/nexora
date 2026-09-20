import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { whatsappLink, track } from "../lib/analytics";

const BUSINESS_EMAIL = "yashbadmunda@gmail.com";

export default function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink mt-24" data-testid="footer">
      <div className="container-nx py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/nexora-logo.png" alt="NEXORA" className="h-10 w-10 object-contain" />
            <span className="font-display font-bold tracking-[0.3em] text-lg">NEXORA</span>
          </Link>
          <p className="mt-3 font-mono text-[11px] tracking-[0.3em] text-cyan">BUILD. GROW. GET FOUND.</p>
          <p className="mt-4 text-sm text-muted leading-relaxed max-w-xs">
            From digital presence to physical visibility — helping businesses get noticed online and offline.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm tracking-widest text-chrome mb-4">EXPLORE</h4>
          <ul className="space-y-2.5 text-sm text-muted">
            {[["/services", "Services"], ["/work", "Work"], ["/pricing", "Pricing"], ["/process", "Process"], ["/about", "About"]].map(([to, l]) => (
              <li key={to}><Link to={to} className="hover:text-cyan transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm tracking-widest text-chrome mb-4">ACT</h4>
          <ul className="space-y-2.5 text-sm text-muted">
            <li><Link to="/quote" className="hover:text-cyan transition-colors">Get a Quote</Link></li>
            <li><Link to="/book" className="hover:text-cyan transition-colors">Book a Call</Link></li>
            <li><Link to="/contact" className="hover:text-cyan transition-colors">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-cyan transition-colors">FAQ</Link></li>
            <li><Link to="/login" className="hover:text-cyan transition-colors">Client Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm tracking-widest text-chrome mb-4">CONNECT</h4>
          <ul className="space-y-3 text-sm text-muted">
            <li>
              <a
                href={whatsappLink()}
                target="_blank" rel="noopener noreferrer"
                onClick={() => track("whatsapp_click", { source: "footer" })}
                className="inline-flex items-center gap-2 hover:text-cyan transition-colors"
                data-testid="footer-whatsapp"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${BUSINESS_EMAIL}`} className="inline-flex items-center gap-2 hover:text-cyan transition-colors">
                <Mail size={16} /> {BUSINESS_EMAIL}
              </a>
            </li>
            <li className="inline-flex items-center gap-2"><MapPin size={16} /> India — Serving Worldwide</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-nx py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <span>© {new Date().getFullYear()} NEXORA. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-cyan transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-cyan transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
