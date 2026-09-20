import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import AIChat from "./components/AIChat";
import { Button } from "./components/ui";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Work from "./pages/Work";
import Pricing from "./pages/Pricing";
import Process from "./pages/Process";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Faq from "./pages/Faq";
import Quote from "./pages/Quote";
import Book from "./pages/Book";
import Legal from "./pages/Legal";
import Login from "./pages/Login";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
      <AIChat />
    </>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-void text-center px-5">
      <div>
        <img src="/nexora-logo.png" alt="NEXORA" className="h-16 w-16 mx-auto mb-6 opacity-60" />
        <div className="font-mono text-cyan tracking-[0.3em] text-sm">404 · SIGNAL LOST</div>
        <h1 className="font-display text-4xl text-chrome mt-3">This node doesn't exist.</h1>
        <p className="text-muted mt-3">The page you're looking for has drifted out of the NEXORA core.</p>
        <Button to="/" className="mt-8">RETURN HOME</Button>
      </div>
    </div>
  );
}

const P = (el) => <PublicLayout>{el}</PublicLayout>;

const CLIENT_SECTIONS = ["projects", "tasks", "messages", "quotes", "appointments", "invoices", "payments", "files", "settings"];
const ADMIN_SECTIONS = ["clients", "leads", "quotes", "appointments", "invoices", "payments", "analytics", "audit"];

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={P(<Home />)} />
          <Route path="/services" element={P(<Services />)} />
          <Route path="/work" element={P(<Work />)} />
          <Route path="/pricing" element={P(<Pricing />)} />
          <Route path="/process" element={P(<Process />)} />
          <Route path="/about" element={P(<About />)} />
          <Route path="/contact" element={P(<Contact />)} />
          <Route path="/faq" element={P(<Faq />)} />
          <Route path="/quote" element={P(<Quote />)} />
          <Route path="/book" element={P(<Book />)} />
          <Route path="/privacy" element={P(<Legal kind="privacy" />)} />
          <Route path="/terms" element={P(<Legal kind="terms" />)} />

          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Login admin />} />

          {/* Client dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute role="client"><ClientDashboard section="overview" /></ProtectedRoute>} />
          {CLIENT_SECTIONS.map((s) => (
            <Route key={s} path={`/dashboard/${s}`} element={<ProtectedRoute role="client"><ClientDashboard section={s} /></ProtectedRoute>} />
          ))}

          {/* Admin dashboard */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard section="overview" /></ProtectedRoute>} />
          {ADMIN_SECTIONS.map((s) => (
            <Route key={s} path={`/admin/dashboard/${s}`} element={<ProtectedRoute role="admin"><AdminDashboard section={s} /></ProtectedRoute>} />
          ))}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
