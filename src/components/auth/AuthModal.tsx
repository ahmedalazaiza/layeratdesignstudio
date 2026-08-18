import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Mail,
  X,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  User,
} from "lucide-react";
import { LayeratLogo } from "../brand/LayeratLogo";
import { supabase } from "../../lib/supabase";
import { sanitizeAuthInput } from "../../lib/cookieStorage";
import type { AuthUser, Page } from "../../types";

interface AuthModalProps {
  mode: "login" | "register" | "forgot_password";
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  onSwitchMode: (mode: "login" | "register" | "forgot_password") => void;
  onNavigate?: (page: Page) => void;
}

export function AuthModal({
  mode,
  onClose,
  onSuccess,
  onSwitchMode,
  onNavigate,
}: AuthModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "check_email" | "reset_success"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputClass =
    "w-full px-4 py-3.5 pr-12 rounded-2xl border border-border bg-background/80 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base sm:text-sm";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const { email, password, fullName, isValidEmail, isValidPassword } =
      sanitizeAuthInput(form.email, form.password, form.name);

    if (!isValidEmail) {
      setErrorMsg("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    if (mode === "forgot_password") {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });

        if (error && error.message.toLowerCase().includes("rate limit")) {
          setErrorMsg("Too many requests. Please wait a moment and try again.");
          toast.error("Too many requests. Please wait a moment.");
          setStatus("error");
          return;
        }

        setStatus("reset_success");
        toast.success("Password reset link sent to your email.");
        return;
      } catch (err: any) {
        setStatus("reset_success");
        return;
      }
    }

    if (!isValidPassword) {
      setErrorMsg("Password must be at least 6 characters.");
      toast.error("Password must be at least 6 characters.");
      setStatus("error");
      return;
    }

    if (mode === "register" && form.password !== form.confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify your password.");
      toast.error("Passwords do not match.");
      setStatus("error");
      return;
    }

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        // If email confirmation is required in Supabase
        if (data.user && !data.session) {
          setStatus("check_email");
          toast.info("Confirmation email sent! Please check your inbox.");
          return;
        }

        // If email confirmation is disabled or auto-confirmed
        if (data.user && data.session) {
          const userEmail = (data.user.email || email).toLowerCase().trim();
          const isAdmin = userEmail === "ahmedazy.uxui@gmail.com";
          const newUser: AuthUser = {
            id: data.user.id,
            name: fullName || data.user.email?.split("@")[0] || "User",
            email: data.user.email || email,
            role: isAdmin ? "admin" : "user",
            purchases: [],
            wishlist: [],
            createdAt: data.user.created_at || new Date().toISOString(),
          };
          toast.success("Account created successfully! Welcome to Layerat.");
          onSuccess(newUser);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name, avatar_url")
            .eq("id", data.user.id)
            .maybeSingle();

          const userEmail = (data.user.email || form.email).toLowerCase().trim();
          const isAdmin =
            userEmail === "ahmedazy.uxui@gmail.com" ||
            profile?.role === "admin";

          const loggedUser: AuthUser = {
            id: data.user.id,
            name:
              profile?.full_name ||
              data.user.user_metadata?.full_name ||
              data.user.email?.split("@")[0] ||
              "User",
            email: data.user.email || form.email,
            avatar: profile?.avatar_url || undefined,
            role: isAdmin ? "admin" : "user",
            purchases: [],
            wishlist: [],
            createdAt: data.user.created_at || new Date().toISOString(),
          };
          toast.success(`Welcome back, ${loggedUser.name}!`);
          onSuccess(loggedUser);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      const msg =
        err.message ||
        (mode === "login"
          ? "Invalid email or password."
          : "Failed to sign up.");
      setErrorMsg(msg);
      toast.error(msg);
      setStatus("error");
    }
  };

  const isResetSuccess = status === "reset_success";
  const isCheckEmail = status === "check_email";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] my-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full border border-border hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 cursor-pointer z-10 text-muted-foreground hover:text-foreground"
          >
            <X size={15} />
          </button>

          {/* Brand Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center">
              <LayeratLogo height={22} className="h-5.5 w-auto" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Sparkles size={11} /> 100% Free Library
            </span>
          </div>

          {isCheckEmail ? (
            <div className="py-4 text-center">
              <div className="mb-5 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/10">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground mb-2">
                Verify your email
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                We sent an activation link to{" "}
                <span className="font-semibold text-foreground font-mono">
                  {form.email}
                </span>
                . Please click the link in your inbox to activate your account and start downloading design kits.
              </p>
              <button
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
                  setStatus("idle");
                  setErrorMsg("");
                  onSwitchMode("login");
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.3)] transition-all cursor-pointer shadow-md shadow-primary/20"
              >
                Back to sign in
              </button>
            </div>
          ) : isResetSuccess ? (
            <div className="py-4 text-center">
              <div className="mb-5 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/10">
                <Mail size={32} />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground mb-2">
                Check your inbox
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                We sent a password reset link to{" "}
                <span className="font-semibold text-foreground font-mono">
                  {form.email}
                </span>
                . Follow the link to set a new password for your account.
              </p>
              <button
                type="button"
                onClick={() => {
                  setForm((f) => ({
                    ...f,
                    email: "",
                    password: "",
                    confirmPassword: "",
                  }));
                  setStatus("idle");
                  onSwitchMode("login");
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.3)] transition-all cursor-pointer shadow-md shadow-primary/20"
              >
                Continue to sign in
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-display font-extrabold text-foreground">
                  {mode === "login"
                    ? "Welcome back"
                    : mode === "forgot_password"
                    ? "Reset password"
                    : "Create your account"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {mode === "login"
                    ? "Sign in with your email to unlock one-click downloads"
                    : mode === "forgot_password"
                    ? "Enter your email to receive recovery instructions"
                    : "Get free access to hundreds of Figma kits & components"}
                </p>
              </div>

              {/* ── EMAIL & PASSWORD FORM ─────────────────────────────────── */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-semibold">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Ahmed Al-Azaiza"
                        className={inputClass}
                      />
                      <User
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-semibold">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="name@company.com"
                      className={inputClass}
                    />
                    <Mail
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                    />
                  </div>
                </div>

                {mode !== "forgot_password" && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide font-semibold">
                        Password
                      </label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => onSwitchMode("forgot_password")}
                          className="text-xs text-primary font-medium hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        minLength={6}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "register" && (
                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-semibold">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        minLength={6}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2"
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {/* Consent Terms & Privacy on Register */}
                {mode === "register" && (
                  <p className="text-[11px] text-muted-foreground/80 leading-relaxed pt-1">
                    By creating an account, you agree to our{" "}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onNavigate) {
                          onNavigate("terms");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      className="text-foreground underline hover:text-primary font-medium cursor-pointer"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onNavigate) {
                          onNavigate("privacy");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      className="text-foreground underline hover:text-primary font-medium cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                    .
                  </p>
                )}

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_35px_rgba(170,255,56,0.4)] transition-all duration-300 cursor-pointer disabled:opacity-60 mt-2 shadow-md shadow-primary/20"
                >
                  {status === "loading" ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === "login"
                          ? "Sign in"
                          : mode === "forgot_password"
                          ? "Send Reset Link"
                          : "Create Free Account"}
                      </span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              {/* Mode Switcher */}
              <div className="mt-5 pt-4 border-t border-border/60 text-center">
                {mode === "login" ? (
                  <p className="text-xs text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => onSwitchMode("register")}
                      className="text-primary font-bold hover:underline cursor-pointer"
                    >
                      Create one for free
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => onSwitchMode("login")}
                      className="text-primary font-bold hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
