import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle2, RefreshCw, Sparkles, ShieldAlert, Check } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import type { AuthUser } from "../../types";

interface UnverifiedEmailBannerProps {
  authUser: AuthUser | null;
  onVerificationSuccess?: () => void;
}

export function UnverifiedEmailBanner({
  authUser,
  onVerificationSuccess,
}: UnverifiedEmailBannerProps) {
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  // Auto-check on window focus (when user returns from clicking email link)
  useEffect(() => {
    if (!authUser || authUser.isVerified) return;

    const checkVerification = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && (user.email_confirmed_at || user.confirmed_at)) {
          toast.success("🎉 Email successfully verified! All free downloads unlocked.");
          if (onVerificationSuccess) {
            onVerificationSuccess();
          } else {
            window.location.reload();
          }
        }
      } catch (err) {
        console.error("Verification auto-check error:", err);
      }
    };

    // Check on window focus
    window.addEventListener("focus", checkVerification);

    // Periodic check every 12 seconds
    const interval = setInterval(checkVerification, 12000);

    return () => {
      window.removeEventListener("focus", checkVerification);
      clearInterval(interval);
    };
  }, [authUser, onVerificationSuccess]);

  // If no user or already verified, don't show
  if (!authUser || authUser.isVerified) {
    return null;
  }

  const handleManualCheck = async () => {
    try {
      setChecking(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user && (user.email_confirmed_at || user.confirmed_at)) {
        toast.success("🎉 Email successfully verified! Downloads unlocked.");
        if (onVerificationSuccess) {
          onVerificationSuccess();
        } else {
          window.location.reload();
        }
      } else {
        toast.info("Account still pending verification. Please click the link in your email.", {
          description: `Check spam folder or click 'Resend Link' if you haven't received it at ${authUser.email}.`,
        });
      }
    } catch (err: any) {
      toast.error("Failed to check status. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    if (!authUser.email) return;
    try {
      setResending(true);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: authUser.email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("rate limit")) {
          toast.error("Too many requests. Please wait a minute before requesting another email.");
        } else {
          throw error;
        }
      } else {
        toast.success(`Verification link sent to ${authUser.email}! Please check your inbox.`);
      }
    } catch (err: any) {
      console.error("Resend error:", err);
      toast.error(err.message || "Failed to resend verification link.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="w-full bg-card/95 backdrop-blur-xl border-b border-primary/30 text-foreground overflow-hidden shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Left / Status */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/20 text-foreground dark:text-primary border border-primary/35 shrink-0">
              <Sparkles size={10} className="text-primary" /> Action Required
            </span>
            <p className="truncate text-xs text-foreground/80 dark:text-muted-foreground">
              Please check your inbox (
              <span className="text-foreground font-bold font-mono">
                {authUser.email}
              </span>
              ) and verify your account to unlock all free downloads.
            </p>
          </div>

          {/* Right / Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleManualCheck}
              disabled={checking}
              title="Check if verified"
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-background hover:bg-muted text-foreground border border-border hover:border-primary/50 font-mono font-bold text-[11px] transition-all cursor-pointer disabled:opacity-50"
            >
              {checking ? (
                <RefreshCw size={11} className="animate-spin text-primary" />
              ) : (
                <Check size={11} className="text-primary font-bold" />
              )}
              <span>{checking ? "Checking..." : "I've Verified"}</span>
            </button>

            <button
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary text-black font-mono font-extrabold text-[11px] hover:opacity-95 hover:shadow-[0_0_15px_rgba(170,255,56,0.4)] transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {resending ? (
                <RefreshCw size={11} className="animate-spin text-black" />
              ) : (
                <Mail size={11} className="text-black" />
              )}
              <span>{resending ? "Sending..." : "Resend Link"}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
