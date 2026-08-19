"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mail,
  X,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { LayeratLogo } from "../brand/LayeratLogo";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { PasswordRecoveryWizard } from "./PasswordRecoveryWizard";
import { authService } from "@/services/authService";
import { useAuth, type AuthModalMode } from "@/hooks/useAuth";
import {
  loginSchema,
  signupSchema,
  type LoginFormData,
  type SignupFormData,
} from "@/lib/validations/auth";
import type { Page } from "@/types/api";

interface AuthModalProps {
  mode?: AuthModalMode;
  onClose?: () => void;
  onSuccess?: (user?: any) => void;
  onSwitchMode?: (mode: AuthModalMode) => void;
  onNavigate?: (page: Page) => void;
}

export function AuthModal(props: AuthModalProps) {
  const {
    authModal,
    closeAuthModal,
    setAuthModalMode,
    login,
    signup,
  } = useAuth();

  // If props are passed, use them; otherwise use context
  const isOpen = props.mode !== undefined || authModal.isOpen;
  const currentMode = props.mode || authModal.mode;
  const handleClose = props.onClose || closeAuthModal;
  const handleSwitchMode = (m: "login" | "register" | "forgot_password") => {
    if (props.onSwitchMode) props.onSwitchMode(m);
    else setAuthModalMode(m);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Username availability state
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Login Form ──
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: errorsLogin, isSubmitting: isSubmittingLogin },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailOrUserName: "", password: "", rememberMe: true },
  });

  // ── Signup Form ──
  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: errorsSignup, isSubmitting: isSubmittingSignup },
    watch: watchSignup,
    setValue: setSignupValue,
    reset: resetSignup,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      userName: "",
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: true,
    },
  });

  const watchedUserName = watchSignup("userName");

  // Debounced username availability check
  useEffect(() => {
    if (currentMode !== "register") return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const clean = (watchedUserName || "").toLowerCase().trim();
    if (!clean || clean.length < 3) {
      setUsernameStatus(clean.length > 0 ? "invalid" : "idle");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(clean)) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const isAvailable = await authService.checkUserName(clean);
        setUsernameStatus(isAvailable ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 450);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [watchedUserName, currentMode]);

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const res = await login({
        emailOrUserName: data.emailOrUserName,
        password: data.password,
      });
      if (props.onSuccess) props.onSuccess(res.user);
      resetLogin();
      handleClose();
    } catch {
      // Handled in mutation toast
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    if (usernameStatus === "taken") return;
    try {
      const res = await signup({
        userName: data.userName.toLowerCase().trim(),
        displayName: data.displayName || data.userName,
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });
      if (props.onSuccess) props.onSuccess(res.user);
      resetSignup();
      handleClose();
    } catch {
      // Handled in mutation toast
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full px-4 py-3.5 pr-12 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] my-auto"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer z-10"
          >
            <X size={15} />
          </button>

          {/* Header Branding */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3">
              <LayeratLogo size="md" />
            </div>

            {currentMode === "login" && (
              <>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Welcome back to Layerat
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Sign in to download unlimited free Figma kits & templates.
                </p>
              </>
            )}

            {currentMode === "register" && (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-semibold mb-2">
                  <Sparkles size={11} />
                  <span>100% Free Lifetime Access</span>
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Join the Studio
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Get instant access to free Figma design systems and resources.
                </p>
              </>
            )}
          </div>

          {/* ── Mode Switcher Tab (Login / Signup) ── */}
          {currentMode !== "forgot_password" && (
            <div className="flex p-1 rounded-2xl bg-muted/60 border border-border/80 mb-6">
              <button
                type="button"
                onClick={() => handleSwitchMode("login")}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentMode === "login"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode("register")}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentMode === "register"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* ── Google One-Click OAuth ── */}
          {currentMode !== "forgot_password" && (
            <div className="space-y-4 mb-5">
              <GoogleSignInButton
                mode={currentMode === "register" ? "signup" : "login"}
                onSuccess={() => {
                  if (props.onSuccess) props.onSuccess();
                  handleClose();
                }}
              />

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] font-mono uppercase text-muted-foreground/60 tracking-wider">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {currentMode === "login" && (
            <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4">
              {/* Email or Username */}
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                  Email or Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...registerLogin("emailOrUserName")}
                    placeholder="user@example.com or username"
                    autoComplete="username"
                    className={inputClass}
                  />
                  <Mail
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                  />
                </div>
                {errorsLogin.emailOrUserName && (
                  <p className="text-xs text-destructive mt-1.5 font-medium">
                    {errorsLogin.emailOrUserName.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("forgot_password")}
                    className="text-xs text-primary hover:underline font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...registerLogin("password")}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errorsLogin.password && (
                  <p className="text-xs text-destructive mt-1.5 font-medium">
                    {errorsLogin.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingLogin}
                className="w-full py-3.5 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingLogin ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── SIGNUP FORM ── */}
          {currentMode === "register" && (
            <form onSubmit={handleSubmitSignup(onSignupSubmit)} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...registerSignup("displayName")}
                    placeholder="Ahmed Alazaiza"
                    autoComplete="name"
                    className={inputClass}
                  />
                  <User
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                  />
                </div>
                {errorsSignup.displayName && (
                  <p className="text-xs text-destructive mt-1.5 font-medium">
                    {errorsSignup.displayName.message}
                  </p>
                )}
              </div>

              {/* Username with Real-Time Debounce */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block font-medium">
                    Username <span className="text-primary">*</span>
                  </label>
                  {usernameStatus === "checking" && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                      <Loader2 size={11} className="animate-spin text-primary" />
                      Checking...
                    </span>
                  )}
                  {usernameStatus === "available" && (
                    <span className="text-[11px] text-emerald-500 flex items-center gap-1 font-mono font-medium">
                      <CheckCircle2 size={11} />
                      Available
                    </span>
                  )}
                  {usernameStatus === "taken" && (
                    <span className="text-[11px] text-destructive flex items-center gap-1 font-mono font-medium">
                      <AlertCircle size={11} />
                      Username taken
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    {...registerSignup("userName", {
                      onChange: (e) => {
                        // Enforce lowercase typing on input
                        setSignupValue("userName", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                      },
                    })}
                    placeholder="alex_ux"
                    autoComplete="username"
                    className={`${inputClass} font-mono lowercase`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground/50">
                    @
                  </span>
                </div>
                {errorsSignup.userName && (
                  <p className="text-xs text-destructive mt-1.5 font-medium">
                    {errorsSignup.userName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                  Email Address <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...registerSignup("email")}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputClass}
                  />
                  <Mail
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                  />
                </div>
                {errorsSignup.email && (
                  <p className="text-xs text-destructive mt-1.5 font-medium">
                    {errorsSignup.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                  Password <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...registerSignup("password")}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errorsSignup.password && (
                  <p className="text-xs text-destructive mt-1.5 font-medium">
                    {errorsSignup.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                  Confirm Password <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...registerSignup("confirmPassword")}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errorsSignup.confirmPassword && (
                  <p className="text-xs text-destructive mt-1.5 font-medium">
                    {errorsSignup.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingSignup || usernameStatus === "checking" || usernameStatus === "taken"}
                className="w-full py-3.5 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingSignup ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Free Account
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── 3-STEP PASSWORD RECOVERY WIZARD ── */}
          {currentMode === "forgot_password" && (
            <PasswordRecoveryWizard
              onSuccess={() => handleSwitchMode("login")}
              onBackToLogin={() => handleSwitchMode("login")}
            />
          )}

          {/* Footer security note */}
          <div className="mt-6 pt-4 border-t border-border/50 text-center">
            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-primary shrink-0" />
              <span>SSL encrypted · No credit card required</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
