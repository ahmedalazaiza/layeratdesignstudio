import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { AuthUser } from "../../types";


// ─── Gift Popup ───────────────────────────────────────────────────────────────

/*
 * Admin-configurable gift settings.
 * TODO: Replace with GET ${API_BASE}/admin/gift-config
 * resp: { productId, title, description, downloadUrl, fileName }
 * The backend should return a signed/time-limited download URL.
 */
const GIFT_CONFIG = {
  productId: "gift_layerat_starter_kit",
  title: "Free Figma Starter Kit",
  description: "50+ components · 3 themes · Variables-ready",
  downloadUrl: "",
  fileName: "layerat-starter-kit.fig",
};

const GIFT_KEY = "ld_gift_popup";
const GIFT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface GiftPopupProps {
  authUser: AuthUser | null;
  onSuccess: (user: AuthUser) => void;
  scrollReady: boolean;
}

function GiftPopup({ authUser, onSuccess, scrollReady }: GiftPopupProps) {
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
    image_url: "",
    download_url: "",
    file_name: "gift-file.fig",
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
          title: data.title || "",
          description: data.description || "",
          image_url: data.image_url || "",
          download_url: data.download_url || "",
          file_name: data.file_name || "gift-file.fig",
          is_active: data.is_active ?? true,
        });
      }
    };
    loadGift();
  }, []);
  useEffect(() => {
    if (!scrollReady) return;
    if (!giftConfig.is_active) return;

    const stored = localStorage.getItem(GIFT_KEY);
    if (stored) {
      const { ts, action } = JSON.parse(stored);
      if (action === "claimed") return;
      if (Date.now() - ts < GIFT_COOLDOWN_MS) return;
    }

    // Small delay for smooth UX after scroll trigger
    const timer = setTimeout(() => setVisible(true), 700);
    return () => clearTimeout(timer);
  }, [scrollReady, authUser]);

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

      await supabase.from("leads").upsert(
        {
          email: email.trim(),
          source: "gift_popup",
          gift_downloaded: true,
        },
        { onConflict: "email" }
      );

      if (data.user && !data.session) {
        setStep("success");
        if (giftConfig.download_url) {
          window.open(giftConfig.download_url, "_blank", "noopener,noreferrer");
        }
        localStorage.setItem(
          GIFT_KEY,
          JSON.stringify({ ts: Date.now(), action: "claimed" })
        );
        setLoading(false);
        return;
      }
      
      if (data.user && data.session) {
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
        };

        localStorage.setItem(
          GIFT_KEY,
          JSON.stringify({ ts: Date.now(), action: "claimed" })
        );

        onSuccess(newUser);
        setStep("success");

        if (giftConfig.download_url) {
          const a = document.createElement("a");
          a.href = giftConfig.download_url || GIFT_CONFIG.downloadUrl;
          a.download = giftConfig.file_name || GIFT_CONFIG.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        setTimeout(() => setVisible(false), 4500);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3.5 rounded-xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="gift-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismiss();
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col sm:flex-row"
          >
            {/* ── LEFT: Image panel ──────────────────────────────────────── */}
            <div className="relative sm:w-[42%] min-h-[220px] sm:min-h-[520px] overflow-hidden hidden sm:block">
              <img
                src={
                  giftConfig.image_url ||
                  "https://images.unsplash.com/photo-1637944059054-7091ca8efe14?w=600&q=80&fit=crop&crop=center"
                }
                alt="Design workspace"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Overlay gradient so it blends into the card edge */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/20" />
              {/* Free gift badge pinned to bottom */}
              <div className="absolute bottom-5 left-5">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/15 rounded-full px-4 py-2">
                  <span className="text-base">🎁</span>
                  <span className="text-[11px] font-bold text-white tracking-widest uppercase">
                    Free Gift
                  </span>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Form panel ──────────────────────────────────────── */}
            <div className="flex-1 flex flex-col px-8 py-9 relative">
              {/* Dismiss */}
              <button
                onClick={handleDismiss}
                aria-label="Close"
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-border hover:border-primary/40 hover:bg-primary/8 transition-all duration-200"
              >
                <X size={14} className="text-muted-foreground" />
              </button>

              {step === "form" ? (
                <>
                  {/* Header */}
                  <div className="mb-7">
                    <h2 className="text-2xl font-display font-bold text-foreground leading-snug mb-3">
                      {giftConfig.title ||
                        "There's a free gift waiting for you!"}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {giftConfig.description ||
                        "Register with your email and get this free resource added to your library instantly — no credit card needed."}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(giftConfig.description || GIFT_CONFIG.description)
                        .split(" · ")
                        .map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] text-primary font-medium bg-primary/8 border border-primary/15 px-2.5 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Form */}
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3 flex-1"
                  >
                    <div>
                      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        placeholder="Your name (optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                      />
                      <div>
                        <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a password"
                          minLength={6}
                          required
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5">
                        <AlertCircle size={12} /> {error}
                      </p>
                    )}

                    <div className="mt-auto pt-5 space-y-3">
                      <button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                          <>
                            <Download size={15} />
                            Register &amp; Get the Gift
                          </>
                        )}
                      </button>

                      <p className="text-center text-[11px] text-muted-foreground/50">
                        No spam, ever. Unsubscribe at any time.
                      </p>
                    </div>
                  </form>
                </>
              ) : (
                /* Success */
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18 }}
                    className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center"
                  >
                    <CheckCircle size={32} className="text-accent" />
                  </motion.div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                    You're all set! 🎉
                  </h2>
                  <p className="text-sm text-muted-foreground mb-1">
                    Your download has started automatically.
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    The kit has been added to your library.
                  </p>
                  <div className="mt-7 flex items-center justify-center gap-2 text-xs text-muted-foreground/40">
                    <div className="w-3 h-3 border-2 border-muted-foreground/25 border-t-muted-foreground/60 rounded-full animate-spin" />
                    Closing in a moment…
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export { GiftPopup };
