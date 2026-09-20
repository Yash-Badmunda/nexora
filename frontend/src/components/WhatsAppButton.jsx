import React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { whatsappLink, track } from "../lib/analytics";

export default function WhatsAppButton() {
  return (
    <motion.a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("whatsapp_click", { source: "floating" })}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] text-[#04121a] font-display font-semibold text-sm px-4 py-3 shadow-[0_10px_40px_-8px_rgba(37,211,102,0.6)]"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring" }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Chat on WhatsApp"
      data-testid="whatsapp-float"
    >
      <MessageCircle size={20} />
      <span className="hidden sm:inline">WhatsApp</span>
    </motion.a>
  );
}
