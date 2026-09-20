import { api } from "./api";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function track(event, meta = {}) {
  try {
    if (GA_ID && window.gtag) window.gtag("event", event, meta);
    api.post("/track", { event, meta }).catch(() => {});
  } catch (e) {
    /* analytics must never break UX */
  }
}

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

export function whatsappLink(message) {
  const text = encodeURIComponent(
    message || "Hi Nexora, I'm interested in your services. I'd like to know more."
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
