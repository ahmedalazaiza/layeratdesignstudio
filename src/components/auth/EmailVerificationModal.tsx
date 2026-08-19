"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  KeyRound,
  X,
  RefreshCw,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { emailOtpSchema, type EmailOtpFormData } from "@/lib/validations/auth";
import { toast } from "sonner";

export function EmailVerificationModal() {
  const {
    authUser,
    emailVerifyModal,
    closeEmailVerifyModal,
    verifyEmail,
    requestEmailVerification,
  } = useAuth();

  const [resendTimer, setResendTimer] = useState<number>(0);
  const [resending, setResending] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EmailOtpFormData>({
    resolver: zodResolver(emailOtpSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (data: EmailOtpFormData) => {
    try {
      await verifyEmail(data.code);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        reset();
        closeEmailVerifyModal();
      }, 1800);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Invalid or expired verification code";
      toast.error(msg);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resending) return;
    try {
      setResending(true);
      await requestEmailVerification();
      setResendTimer(60);
    } catch (err: any) {
      toast.error(err?.message || "Failed to resend verification code");
    } finally {
      setResending(false);
    }
  };

  if (!emailVerifyModal.isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeEmailVerifyModal();
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
            onClick={closeEmailVerifyModal}
            className="absolute top-5 right-5 w-8 h-8 rounded-full border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>

          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                <CheckCircle2 size={30} />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground">
                Email Verified!
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your email has been confirmed. All studio features and download perks are now unlocked.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3 text-primary">
                  <Mail size={22} />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground">
                  Verify your email
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Enter the 6-digit code sent to{" "}
                  <strong className="text-foreground font-mono">
                    {authUser?.email || "your email"}
                  </strong>
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      {...register("code")}
                      placeholder="000000"
                      autoFocus
                      maxLength={10}
                      className="w-full px-4 py-3.5 rounded-2xl border border-border bg-background text-foreground text-center font-mono text-xl tracking-widest placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  {errors.code && (
                    <p className="text-xs text-destructive mt-1.5 text-center font-medium">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-muted-foreground">Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendTimer > 0 || resending}
                    className="text-primary hover:underline font-medium cursor-pointer disabled:opacity-50 disabled:no-underline flex items-center gap-1"
                  >
                    {resending && <RefreshCw size={12} className="animate-spin" />}
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Account
                      <ShieldCheck size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
