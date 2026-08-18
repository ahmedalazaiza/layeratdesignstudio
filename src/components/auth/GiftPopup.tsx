import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X, AlertCircle, CheckCircle, Gift, Sparkles, ShieldCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { AuthUser } from "../../types";

const GIFT_KEY = "ld_gift_popup";
const GIFT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface GiftPopupProps {
  authUser: AuthUser | null;
  onSuccess: (user: AuthUser) => void;
  scrollReady: boolean;
}

export function GiftPopup({ authUser, onSuccess, scrollReady }: GiftPopupProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [giftConfig, setGiftConfig] = useState({
    title: "Free Figma Starter Kit",
    description: "50+ components · 3 themes · Variables-ready",
    image_url: "https://images.unsplash.com/photo-1637944059054-7091ca8efe14?w=600&q=80&fit=crop",
    download_url: "",
    file_name: "layerat-starter-kit.fig",
    file_format: "fig",
    file_size: "45 MB",
    is_active: true,
  });

  useEffect(() => {
    const loadGift = async () => {
      const { data } = await supabase
        .from("gift_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (data) {
        setGiftConfig({
          title: data.title || "Free Figma Starter Kit",
          description: data.description || "50+ components · 3 themes · Variables-ready",
          image_url: data.image_url || "https://images.unsplash.com/photo-1637944059054-7091ca8efe14?w=600&q=80&fit=crop",
          download_url: data.download_url || "",
          file_name: data.file_name || "layerat-starter-kit.fig",
          file_format: (data as any).file_format || "fig",
          file_size: (data as any).file_size || "45 MB",
          is_active: data.is_active ?? true,
        });
      }
    };
    loadGift();
  }, []);

  useEffect(() => {
    if (!scrollReady) return;
    if (!giftConfig.is_active) return;

    // If user is already logged in and verified, don't nag with gift popup
    if (authUser?.isVerified) return;

    const stored = localStorage.getItem(GIFT_KEY);
    if (stored) {
      const { ts, action } = JSON.parse(stored);
      if (action === "claimed") return;
      if (Date.now() - ts < GIFT_COOLDOWN_MS) return;
    }

    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, [scrollReady, authUser, giftConfig.is_active]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(
      GIFT_KEY,
      JSON.stringify({ ts: Date.now(), action: "dismissed" })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim() || email.split("@")[0],
          },
        },
      });

      if (signUpError) throw signUpError;

      // Save lead to Supabase
      await supabase.from("leads").upsert(
        {
          email: email.trim(),
          source: "gift_popup",
          gift_downloaded: false, // Will become true only when verified and downloaded
        },
        { onConflict: "email" }
      );

      // Record lead in local storage for marketing panel
      try {
        const existingLeads = JSON.parse(
          localStorage.getItem("layerat_gift_leads") || "[]"
        );
        const newLead = {
          id: `lead_${Date.now()}`,
          name: name.trim() || email.split("@")[0],
          email: email.trim(),
          claimedAt: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          role: "user",
        };
        localStorage.setItem(
          "layerat_gift_leads",
          JSON.stringify([newLead, ...existingLeads])
        );
      } catch {}

      // Store pending gift claim flag
      localStorage.setItem("layerat_pending_gift_email", email.trim());
      localStorage.setItem(
        GIFT_KEY,
        JSON.stringify({ ts: Date.now(), action: "claimed" })
      );

      // Update auth state if session exists
      if (data.user && data.session) {
        const isVerified = Boolean(
          data.user.email_confirmed_at || data.user.confirmed_at
        );
        const newUser: AuthUser = {
          id: data.user.id,
          name:
            name.trim() ||
            data.user.user_metadata?.full_name ||
            email.split("@")[0],
          email: data.user.email || email.trim(),
          role: "user",
          purchases: [],
          wishlist: [],
          createdAt: data.user.created_at || new Date().toISOString(),
          isVerified,
        };
        onSuccess(newUser);
      }

      // DO NOT DOWNLOAD FILE HERE! Show success verification prompt only.
      setStep("success");
    } catch (err: any) {
      console.error("Gift claim error:", err);
      setError(err.message || "Failed to register gift claim. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 rounded-2xl border border-border bg-background/80 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base sm:text-sm";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="gift-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismiss();
          }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-card border border-border rounded-3xl overflow-y-auto max-h-[92vh] shadow-2xl flex flex-col sm:flex-row my-auto"
          >
            {/* ── LEFT: Image panel (Desktop / Tablet) ──────────────────────────────────────── */}
            <div className="relative sm:w-[42%] min-h-[220px] sm:min-h-[500px] overflow-hidden hidden sm:block">
              <img
                src={giftConfig.image_url}
                alt="Free Gift Kit"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Badge */}
              <div className="absolute bottom-5 left-5 right-5">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl px-3.5 py-2">
                  <span className="text-sm">🎁</span>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-white tracking-wider uppercase block font-mono">
                      Exclusive Starter Kit
                    </span>
                    <span className="text-[10px] text-white/70 font-mono">
                      {giftConfig.file_size} · .{giftConfig.file_format.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Form panel ──────────────────────────────────────── */}
            <div className="flex-1 flex flex-col px-6 sm:px-7 py-6 sm:py-8 relative">
              {/* Dismiss */}
              <button
                onClick={handleDismiss}
                aria-label="Close"
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-border hover:border-primary/40 hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer z-10"
              >
                <X size={14} />
              </button>

              {step === "form" ? (
                <>
                  {/* Mobile Compact Gift Badge */}
                  <div className="sm:hidden flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-2xl mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Gift size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold text-primary uppercase block">
                        🎁 Free Exclusive Starter Kit
                      </span>
                      <span className="text-xs font-bold text-foreground truncate block">
                        {giftConfig.title}
                      </span>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="mb-4 sm:mb-5">
                    <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                      <Sparkles size={11} /> 100% Free Gift
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-foreground leading-snug">
                      {giftConfig.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {giftConfig.description}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1">
                    <div>
                      <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1 font-semibold">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ahmed"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1 font-semibold">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide block mb-1 font-semibold">
                        Create Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={6}
                        required
                        className={inputCls}
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-destructive flex items-center gap-1.5">
                        <AlertCircle size={12} /> {error}
                      </p>
                    )}

                    <div className="mt-auto pt-3 space-y-2.5">
                      <button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="w-full py-3.5 rounded-2xl bg-primary text-black font-extrabold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-md shadow-primary/20"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          <>
                            <Gift size={16} />
                            Claim Free Starter Kit
                          </>
                        )}
                      </button>

                      <p className="text-center text-[10px] text-muted-foreground/70 font-mono">
                        🔒 Note: Email verification required to unlock direct download.
                      </p>
                    </div>
                  </form>
                </>
              ) : (
                /* Success Screen */
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary shadow-lg shadow-primary/15"
                  >
                    <CheckCircle size={32} />
                  </motion.div>

                  <h2 className="text-2xl font-display font-bold text-foreground mb-1.5">
                    Gift Claim Registered! 🎁
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
                    We sent a confirmation link to <strong className="text-foreground font-mono">{email}</strong>.
                  </p>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mb-6 max-w-xs text-left leading-relaxed">
                    <div className="flex items-center gap-2 font-bold mb-1 text-amber-200">
                      <ShieldCheck size={14} /> Verification Required
                    </div>
                    Please click the activation link in your email. Once verified, your Starter Kit (.{giftConfig.file_format.toUpperCase()}) will be unlocked and waiting in your Studio Library!
                  </div>

                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="w-full py-3.5 rounded-2xl bg-primary text-black font-extrabold text-xs sm:text-sm hover:shadow-[0_0_20px_rgba(170,255,56,0.3)] transition-all cursor-pointer shadow-md shadow-primary/20"
                  >
                    Got it, I'll check my inbox
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
