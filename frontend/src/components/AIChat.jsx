import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import { track } from "../lib/analytics";

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, I'm NOVA — NEXORA's assistant. Ask me about our services, process or pricing." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const history = messages.slice(-6);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    track("ai_chat_message");
    try {
      const { data } = await api.post("/ai/chat", { message: text, history });
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "I couldn't respond right now. Please try again or reach us on WhatsApp." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => { setOpen((v) => !v); track("ai_chat_open"); }}
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full glass border border-cyan/40 text-cyan font-display font-semibold text-sm px-4 py-3"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.4, type: "spring" }}
        whileHover={{ scale: 1.05 }}
        style={{ boxShadow: "0 0 30px -8px rgba(44,198,232,0.6)" }}
        aria-label="Open NOVA assistant"
        data-testid="ai-chat-toggle"
      >
        <Sparkles size={18} /> <span className="hidden sm:inline">Ask NOVA</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-20 left-5 z-50 w-[92vw] max-w-sm panel overflow-hidden"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            data-testid="ai-chat-panel"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-panel2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-cyan/15 grid place-items-center text-cyan"><Bot size={18} /></div>
                <div>
                  <div className="font-display text-sm text-chrome">NOVA</div>
                  <div className="font-mono text-[9px] tracking-widest text-cyan">NEXORA ASSISTANT</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-chrome" aria-label="Close"><X size={18} /></button>
            </div>

            <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user" ? "bg-cyan text-[#04121a]" : "bg-panel2 border border-line text-fog"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start"><div className="bg-panel2 border border-line rounded-2xl px-4 py-3">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse [animation-delay:0.4s]" />
                  </span>
                </div></div>
              )}
            </div>

            <form onSubmit={send} className="p-3 border-t border-line flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about NEXORA..."
                className="input-nx !py-2.5"
                data-testid="ai-chat-input"
              />
              <button type="submit" className="btn-primary !px-3 !py-2.5" disabled={loading} data-testid="ai-chat-send">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
