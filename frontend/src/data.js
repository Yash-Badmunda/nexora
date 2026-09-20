import {
  Globe, GraduationCap, Rocket, MapPin, Megaphone, Search,
  Workflow, Wrench, Printer,
} from "lucide-react";

export const SERVICES = [
  {
    key: "web", icon: Globe, title: "Website Development", zone: "BUILD",
    short: "Fast, modern websites that convert visitors into customers.",
    benefits: ["Mobile-first & responsive", "Built for speed & SEO", "Easy to update"],
    uses: ["Business sites", "Landing pages", "Company profiles"],
    color: "#5ce1ff",
  },
  {
    key: "student", icon: GraduationCap, title: "Student Portfolio Websites", zone: "BUILD",
    short: "Stand out to recruiters with a sharp personal portfolio.",
    benefits: ["Showcase projects", "Resume + contact", "Custom domain ready"],
    uses: ["Students", "Freshers", "Freelancers"],
    color: "#8ea2ff",
  },
  {
    key: "startup", icon: Rocket, title: "Startup Websites", zone: "BUILD",
    short: "Launch-ready sites that make investors and users take you seriously.",
    benefits: ["Product storytelling", "Waitlist / signups", "Scales with you"],
    uses: ["MVPs", "Product launches", "Fundraising"],
    color: "#59f0c8",
  },
  {
    key: "gbp", icon: MapPin, title: "Google Business Profile", zone: "GET FOUND",
    short: "Show up on Google Maps & Search when locals look for you.",
    benefits: ["Profile setup & optimization", "Photos & categories", "Review-ready"],
    uses: ["Shops", "Clinics", "Restaurants"],
    color: "#2cc6e8",
  },
  {
    key: "ads", icon: Megaphone, title: "Google Ads", zone: "GROW",
    short: "Targeted campaigns that put you in front of ready buyers.",
    benefits: ["Campaign setup", "Keyword targeting", "Ongoing management"],
    uses: ["Lead gen", "Promotions", "Local reach"],
    color: "#ffb454",
  },
  {
    key: "seo", icon: Search, title: "Local SEO", zone: "GET FOUND",
    short: "Rank higher for the searches that matter in your area.",
    benefits: ["On-page optimization", "Local citations", "Content structure"],
    uses: ["Service businesses", "Local brands", "Multi-location"],
    color: "#2cc6e8",
  },
  {
    key: "automation", icon: Workflow, title: "Business Automation", zone: "AUTOMATE",
    short: "Let systems handle leads, follow-ups and busywork for you.",
    benefits: ["Lead workflows", "Auto follow-ups", "CRM & sheets sync"],
    uses: ["Lead capture", "Bookings", "Notifications"],
    color: "#59f0c8",
  },
  {
    key: "maintenance", icon: Wrench, title: "Website Maintenance", zone: "AUTOMATE",
    short: "Keep your site fast, secure and always up to date.",
    benefits: ["Updates & backups", "Security checks", "Content edits"],
    uses: ["Ongoing care", "Peace of mind", "Fixes"],
    color: "#8ea2ff",
  },
  {
    key: "print", icon: Printer, title: "Flex Printing & Advertising", zone: "GET SEEN",
    short: "Physical visibility — banners, signage and flex that get noticed.",
    benefits: ["Design + print", "Custom sizes", "Installation support"],
    uses: ["Shop signage", "Event banners", "Promotions"],
    color: "#ffb454",
  },
];

export const AUDIENCES = [
  { key: "business", label: "Businesses", desc: "Get online, get found, get customers.", icon: Globe },
  { key: "startups", label: "Startups", desc: "Launch fast and look investor-ready.", icon: Rocket },
  { key: "students", label: "Students", desc: "A portfolio that opens doors.", icon: GraduationCap },
  { key: "individuals", label: "Individuals", desc: "A personal presence that stands out.", icon: MapPin },
];

export const PROCESS = [
  { n: "01", title: "Discover", desc: "We learn your goals, audience and what success looks like." },
  { n: "02", title: "Design", desc: "We craft a clear, on-brand experience — reviewed with you." },
  { n: "03", title: "Build", desc: "We develop it fast, secure and optimized for speed & SEO." },
  { n: "04", title: "Launch", desc: "We ship it live, connect your domain and set up analytics." },
  { n: "05", title: "Grow", desc: "Optional Ads, SEO, automation & care to keep momentum." },
];

export const DEMO_PROJECTS = [
  {
    key: "restaurant", name: "Spice Route", type: "Restaurant", accent: "#ffb454",
    tagline: "A warm, appetite-first dining world.",
    features: ["Digital menu", "Table booking", "Google Business ready"],
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=70",
  },
  {
    key: "gym", name: "IronPulse", type: "Gym", accent: "#59f0c8",
    tagline: "High-energy fitness command center.",
    features: ["Class schedule", "Membership signup", "Trainer profiles"],
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=70",
  },
  {
    key: "portfolio", name: "Aarav.dev", type: "Student Portfolio", accent: "#8ea2ff",
    tagline: "A recruiter-ready personal brand.",
    features: ["Project showcase", "Resume download", "Contact form"],
    img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=70",
  },
  {
    key: "startup", name: "Nimbus", type: "Startup", accent: "#5ce1ff",
    tagline: "Launch-ready SaaS storytelling.",
    features: ["Product tour", "Waitlist capture", "Pricing tiers"],
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=70",
  },
];

export const FAQS = [
  { q: "How much does a website cost?", a: "Our packages start from ₹3,000 (Launch), ₹8,000 (Business) and ₹13,000 (Business Automation). Final pricing depends on pages, design and features — use the Quote configurator for a live estimate." },
  { q: "How long does development take?", a: "Most Launch sites go live in a few days; Business and Automation projects take longer depending on scope. We confirm a timeline after a quick chat." },
  { q: "Is hosting and domain included?", a: "No. Domain, hosting, paid APIs and third-party services are billed separately so you fully own them. We help you set everything up." },
  { q: "Do you work with clients outside India?", a: "Yes. NEXORA is based in India and serves clients worldwide. WhatsApp is the fastest way to reach us across time zones." },
  { q: "Can you set up my Google Business Profile?", a: "Yes — we set up and optimize your Google Business Profile so you appear on Maps and local Search." },
  { q: "How do Google Ads costs work?", a: "We charge for campaign setup and management. Your ad budget is paid separately, directly to Google." },
  { q: "What does SEO include?", a: "On-page optimization, local citations and content structure. We never promise specific rankings — search results depend on many factors." },
  { q: "What is business automation?", a: "We connect your website to workflows that capture leads, send follow-ups and sync with tools like email, sheets or a CRM." },
  { q: "Do you offer maintenance?", a: "Yes. Care plans start from ₹900/mo (Launch), ₹1,500/mo (Business) and ₹3,000/mo (Automation)." },
  { q: "How does flex printing pricing work?", a: "Printing is quoted per job — it depends on size, quantity, material, design, installation and delivery. Request a printing quote and we'll get back with details." },
  { q: "How do payments work?", a: "Online payments are processed securely through a payment provider. Provider fees are separate. We never store card data." },
  { q: "Can you build custom functionality?", a: "Yes — logins, databases, bookings, AI chatbots and more. Add them in the Quote configurator to see how they affect your estimate." },
];

export const BUSINESS_TYPES = ["Restaurant / Cafe", "Gym / Fitness", "Retail / Shop", "Clinic / Healthcare", "Salon / Spa", "Education / Coaching", "Startup / SaaS", "Freelancer / Individual", "Student", "Other"];
export const WEBSITE_TYPES = ["Business Website", "Portfolio", "Landing Page", "E-commerce", "Booking Site", "Startup / Product", "Other"];
export const TIMELINES = ["ASAP", "Within 1 week", "This month", "1–2 months", "Flexible"];
export const BUDGETS = ["₹3,000 – ₹5,000", "₹8,000 – ₹10,000", "₹13,000 – ₹18,000", "₹18,000+", "Not sure yet"];
