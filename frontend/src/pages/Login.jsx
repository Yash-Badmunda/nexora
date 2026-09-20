import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Seo } from "../components/ui";
import { apiError } from "../lib/api";

export default function Login({ admin = false }) {
  const { login, register, user, ready } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", business: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) navigate(user.role === "admin" ? "/admin/dashboard" : "/dashboard", { replace: true });
  }, [ready, user, navigate]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      let u;
      if (mode === "register" && !admin) {
        u = await register({ name: form.name, email: form.email, password: form.password, business: form.business });
      } else {
        u = await login(form.email, form.password);
      }
      if (admin && u.role !== "admin") {
        setError("This login is for administrators only.");
        setLoading(false);
        return;
      }
      navigate(u.role === "admin" ? "/admin/dashboard" : "/dashboard", { replace: true });
    } catch (err) {
      setError(apiError(err.response?.data?.detail) || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-void relative overflow-hidden px-5">
      <Seo title={admin ? "Admin Login" : "Client Login"} />
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 radial-fade" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md panel p-8">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-6">
          <img src="/nexora-logo.png" alt="NEXORA" className="h-11 w-11" />
          <span className="font-display font-bold tracking-[0.3em] text-xl">NEXORA</span>
        </Link>

        <div className="text-center mb-6">
          <div className="font-mono text-[11px] tracking-widest text-cyan flex items-center justify-center gap-2">
            {admin && <Shield size={13} />} {admin ? "ADMIN COMMAND CENTER" : mode === "login" ? "CLIENT ACCESS" : "CREATE ACCOUNT"}
          </div>
          <h1 className="font-display text-2xl text-chrome mt-2">
            {admin ? "Administrator Login" : mode === "login" ? "Welcome back" : "Join NEXORA"}
          </h1>
        </div>

        <form onSubmit={submit} className="space-y-4" data-testid="auth-form" noValidate>
          {mode === "register" && !admin && (
            <>
              <input className="input-nx" placeholder="Full name" value={form.name} onChange={set("name")} data-testid="auth-name" />
              <input className="input-nx" placeholder="Business (optional)" value={form.business} onChange={set("business")} />
            </>
          )}
          <input type="email" className="input-nx" placeholder="Email" value={form.email} onChange={set("email")} data-testid="auth-email" />
          <input type="password" className="input-nx" placeholder="Password" value={form.password} onChange={set("password")} data-testid="auth-password" />

          {error && <div className="text-sm text-red-400" data-testid="auth-error">{error}</div>}

          <button type="submit" className="btn-primary w-full" disabled={loading} data-testid="auth-submit">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>{mode === "login" ? "Sign in" : "Create account"} <ArrowRight size={18} /></>}
          </button>
        </form>

        {!admin && (
          <div className="mt-6 text-center text-sm text-muted">
            {mode === "login" ? (
              <>New to NEXORA?{" "}
                <button onClick={() => { setMode("register"); setError(""); }} className="text-cyan hover:text-cyan-bright" data-testid="switch-register">Create an account</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("login"); setError(""); }} className="text-cyan hover:text-cyan-bright" data-testid="switch-login">Sign in</button>
              </>
            )}
          </div>
        )}
        <div className="mt-4 text-center">
          <Link to={admin ? "/login" : "/admin/login"} className="font-mono text-[10px] tracking-widest text-muted/60 hover:text-cyan">
            {admin ? "CLIENT LOGIN →" : "ADMIN LOGIN →"}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
