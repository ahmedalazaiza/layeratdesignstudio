"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, RefreshCw, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/types/api";

import { useAuth } from "@/hooks/useAuth";

interface UnverifiedEmailBannerProps {
  authUser?: User | any | null;
  onVerificationSuccess?: () => void;
}

export function UnverifiedEmailBanner({
  authUser: propUser,
  onVerificationSuccess,
}: UnverifiedEmailBannerProps) {
  const {
    authUser: contextUser,
    requestEmailVerification,
    openEmailVerifyModal,
    refetchUser,
  } = useAuth();

  const authUser = propUser || contextUser;
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  const isUserVerified = Boolean(
    authUser?.isVerified || authUser?.isEmailVerified
  );

  // If no user or already verified, don't show banner
  if (!authUser || isUserVerified) {
    return null;
  }

  const handleManualCheck = async () => {
    try {
      setChecking(true);
      await refetchUser();
      if (onVerificationSuccess) onVerificationSuccess();
    } catch {
      toast.error("Failed to refresh status. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    if (!authUser.email) return;
    try {
      setResending(true);
      await requestEmailVerification();
    } catch (err: any) {
      toast.error(err?.message || "Failed to resend verification link.");
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
              Please verify your email (
              <span className="text-foreground font-bold font-mono">
                {authUser.email}
              </span>
              ) to unlock all free downloads and gifts.
            </p>
          </div>

          {/* Right / Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openEmailVerifyModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary text-primary-foreground font-mono font-bold text-[11px] transition-all hover:shadow-sm cursor-pointer"
            >
              <Check size={11} className="font-bold" />
              <span>Enter Code</span>
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              title="Resend verification email"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-mono font-bold text-[11px] transition-all cursor-pointer disabled:opacity-50"
            >
              <Mail size={11} />
              <span>{resending ? "Sending..." : "Resend"}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default UnverifiedEmailBanner;
