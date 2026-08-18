import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle, Mail, X, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabase";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "creator";
  purchases: string[];
  wishlist: string[];
  createdAt: string;
  bio?: string;
  website?: string;
};

interface AuthModalProps {
  mode: "login" | "register" | "forgot_password";
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  onSwitchMode: (mode: "login" | "register" | "forgot_password") => void;
}

function AuthModal({ mode, onClose, onSuccess, onSwitchMode }: AuthModalProps) {
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
    "w-full px-5 py-3.5 pr-12 rounded-xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    if (mode === "forgot_password") {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(
          form.email,
          {
            redirectTo: window.location.origin,
          }
        );

        // حتى لو الإيميل مش موجود أو في rate limit، نعرض رسالة عامة
        // ما نكشفش إذا الحساب موجود ولا لا
        if (error && error.message.toLowerCase().includes("rate limit")) {
          setErrorMsg("Too many requests. Please wait a bit and try again.");
          setStatus("error");
          return;
        }

        setStatus("reset_success");
        return;
      } catch (err: any) {
        // في معظم الحالات نعرض نجاح عام
        setStatus("reset_success");
        return;
      }
    }
    if (mode === "register" && form.password !== form.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setStatus("error");
      return;
    }

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.name,
            },
          },
        });

        if (error) throw error;

        if (data.user && !data.session) {
          setStatus("check_email");
          return;
        }

        if (data.user && data.session) {
          const newUser: AuthUser = {
            id: data.user.id,
            name: form.name || data.user.email?.split("@")[0] || "User",
            email: data.user.email || form.email,
            role: "user",
            purchases: [],
            wishlist: [],
            createdAt: data.user.created_at || new Date().toISOString(),
          };
          onSuccess(newUser);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", data.user.id)
            .maybeSingle();

          const loggedUser: AuthUser = {
            id: data.user.id,
            name:
              profile?.full_name ||
              data.user.user_metadata?.full_name ||
              data.user.email?.split("@")[0] ||
              "User",
            email: data.user.email || form.email,
            role: (profile?.role as "user" | "admin") || "user",
            purchases: [],
            wishlist: [],
            createdAt: data.user.created_at || new Date().toISOString(),
          };
          onSuccess(loggedUser);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
    // شيلنا الـ finally اللي كان بيرجع status لـ idle بالغلط
  };

  const renderPasswordField = (
    name: "password" | "confirmPassword",
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    placeholder: string,
    label: string,
    show: boolean,
    setShow: (value: boolean) => void,
    required: boolean = true,
    minLength?: number
  ) => (
    <div className="relative">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
        {label}
      </label>
      <input
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        className={inputClass}
      />
      <button
        type="button"
        aria-label={
          show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`
        }
        onClick={() => setShow(!show)}
        className="absolute right-3 top-[42px] flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );

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
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full border border-border hover:border-primary/40 hover:bg-primary/10 transition-all duration-200"
          >
            <X size={15} />
          </button>

          <div
            className="text-3xl text-foreground leading-none mb-2"
            style={{ fontFamily: "'Cookie', cursive" }}
          >
            Layerat<span style={{ color: "#aaff38" }}>.</span>
          </div>
          <p className="text-xs text-muted-foreground mb-8 font-mono">
            Design Studio Marketplace
          </p>

          {isCheckEmail ? (
            <>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle size={28} />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                We sent a confirmation link to{" "}
                <span className="font-semibold text-foreground">
                  {form.email}
                </span>
                . Click it to verify your account, then sign in to continue.
              </p>
              <button
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
                  setStatus("idle");
                  setErrorMsg("");
                  onSwitchMode("login");
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_40px_rgba(170,255,56,0.25)] transition-all duration-300"
              >
                Back to sign in
              </button>
            </>
          ) : isResetSuccess ? (
            <>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail size={28} />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                We sent a password reset link to{" "}
                <span className="font-semibold text-foreground">
                  {form.email}
                </span>
                .
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
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_40px_rgba(170,255,56,0.25)] transition-all duration-300"
              >
                Continue to sign in
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-display font-bold text-foreground mb-6">
                {mode === "login"
                  ? "Welcome back"
                  : mode === "forgot_password"
                  ? "Reset password"
                  : "Create your account"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>
                )}

                {mode !== "forgot_password" && (
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                )}

                {mode === "forgot_password" ? (
                  <div>
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                ) : (
                  <>
                    {renderPasswordField(
                      "password",
                      form.password,
                      handleChange,
                      "••••••••",
                      "Password",
                      showPassword,
                      setShowPassword,
                      true,
                      6
                    )}

                    {mode === "register" &&
                      renderPasswordField(
                        "confirmPassword",
                        form.confirmPassword,
                        handleChange,
                        "••••••••",
                        "Confirm Password",
                        showConfirmPassword,
                        setShowConfirmPassword,
                        true
                      )}
                  </>
                )}

                {mode === "login" && (
                  <div className="flex justify-end -mt-1">
                    <button
                      type="button"
                      onClick={() => onSwitchMode("forgot_password")}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {status === "error" && errorMsg && (
                  <div className="flex items-center gap-2 text-sm text-destructive-foreground bg-destructive/20 rounded-xl px-4 py-3">
                    <AlertCircle size={14} />
                    {errorMsg}
                  </div>
                )}

                {mode === "register" && (
                  <p className="text-[11px] text-muted-foreground/70 leading-relaxed text-center">
                    By creating an account, you agree to our{" "}
                    <button
                      type="button"
                      onClick={() => {}}
                      className="text-primary hover:underline font-medium"
                    >
                      Terms of Use
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() => {}}
                      className="text-primary hover:underline font-medium"
                    >
                      Privacy Policy
                    </button>
                    .
                  </p>
                )}
                {(status as string) === "reset_success" &&
                  mode === "forgot_password" && (
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                      If an account exists with this email, you will receive a
                      password reset link shortly.
                    </p>
                  )}

                {mode === "forgot_password" ? (
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_40px_rgba(170,255,56,0.25)] disabled:opacity-60 transition-all duration-300 mt-2"
                  >
                    {status === "loading" ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending link...
                      </span>
                    ) : (
                      "Send reset link"
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_40px_rgba(170,255,56,0.25)] disabled:opacity-60 transition-all duration-300 mt-2"
                  >
                    {status === "loading" ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        {mode === "login"
                          ? "Signing in..."
                          : "Creating account..."}
                      </span>
                    ) : mode === "login" ? (
                      "Sign In"
                    ) : (
                      "Create Account"
                    )}
                  </button>
                )}
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                {mode === "login"
                  ? "New to Layerat?"
                  : mode === "register"
                  ? "Already have an account?"
                  : "Remembered your password?"}{" "}
                <button
                  onClick={() =>
                    onSwitchMode(
                      mode === "login"
                        ? "register"
                        : mode === "register"
                        ? "login"
                        : "login"
                    )
                  }
                  className="text-primary font-semibold hover:underline"
                >
                  {mode === "login"
                    ? "Create account"
                    : mode === "register"
                    ? "Sign in"
                    : "Back to sign in"}
                </button>
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
export { AuthModal };
