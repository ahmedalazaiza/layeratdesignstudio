"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { authService } from "@/services/authService";
import {
  forgotPasswordSchema,
  verifyRecoveryCodeSchema,
  recoverPasswordSchema,
  type ForgotPasswordFormData,
  type VerifyRecoveryCodeFormData,
  type RecoverPasswordFormData,
} from "@/lib/validations/auth";
import { toast } from "sonner";

interface PasswordRecoveryWizardProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export function PasswordRecoveryWizard({
  onSuccess,
  onBackToLogin,
}: PasswordRecoveryWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState<string>("");
  const [recoverToken, setRecoverToken] = useState<string>("");
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [resending, setResending] = useState<boolean>(false);
  const [showPass, setShowPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);

  // Resend countdown effect
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // ── Step 1 Form: Request Email OTP ──
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1, isSubmitting: isSubmittingStep1 },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmitStep1 = async (data: ForgotPasswordFormData) => {
    try {
      await authService.forgotPassword(data.email);
      setEmail(data.email);
      setStep(2);
      setResendTimer(60);
      toast.success(`Verification code sent to ${data.email}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to send reset code";
      toast.error(msg);
    }
  };

  // ── Step 2 Form: Verify OTP Code ──
  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: errorsStep2, isSubmitting: isSubmittingStep2 },
  } = useForm<VerifyRecoveryCodeFormData>({
    resolver: zodResolver(verifyRecoveryCodeSchema),
    defaultValues: { email, code: "" },
  });

  const onSubmitStep2 = async (data: VerifyRecoveryCodeFormData) => {
    try {
      const res = await authService.verifyRecoveryCode(email, data.code);
      if (res.recoverToken) {
        setRecoverToken(res.recoverToken);
        setStep(3);
        toast.success("Code verified! Please set your new password.");
      } else {
        toast.error("Invalid token received. Please try again.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Invalid or expired code";
      toast.error(msg);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || resending || !email) return;
    try {
      setResending(true);
      await authService.forgotPassword(email);
      setResendTimer(60);
      toast.success(`New code sent to ${email}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  // ── Step 3 Form: Reset Password with recoverToken ──
  const {
    register: registerStep3,
    handleSubmit: handleSubmitStep3,
    formState: { errors: errorsStep3, isSubmitting: isSubmittingStep3 },
  } = useForm<RecoverPasswordFormData>({
    resolver: zodResolver(recoverPasswordSchema),
    defaultValues: {
      recoverToken,
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmitStep3 = async (data: RecoverPasswordFormData) => {
    try {
      await authService.recoverPassword(recoverToken, data.newPassword);
      setStep(4);
      toast.success("Password reset successfully!");
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to reset password";
      toast.error(msg);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";

  return (
    <div className="w-full">
      {/* Wizard Progress Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-mono font-bold transition-all ${
                step === s
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : step > s
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s ? "✓" : s}
            </div>
          ))}
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {step === 1 && "Step 1: Request Code"}
          {step === 2 && "Step 2: Verify Code"}
          {step === 3 && "Step 3: Reset Password"}
          {step === 4 && "Completed"}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Enter Email ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            <div className="text-left mb-4">
              <h3 className="text-lg font-display font-bold text-foreground">
                Reset your password
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Enter your account email and we will send a secure verification code.
              </p>
            </div>

            <form onSubmit={handleSubmitStep1(onSubmitStep1)} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                  Account Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...registerStep1("email")}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputClass}
                  />
                  <Mail
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                  />
                </div>
                {errorsStep1.email && (
                  <p className="text-xs text-destructive mt-1.5 font-medium">
                    {errorsStep1.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingStep1}
                className="w-full py-3.5 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingStep1 ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ArrowLeft size={13} />
                  Back to Sign In
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── STEP 2: Enter OTP Code ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            <div className="text-left mb-4">
              <h3 className="text-lg font-display font-bold text-foreground">
                Enter Verification Code
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                We sent a code to <strong className="text-foreground">{email}</strong>.
              </p>
            </div>

            <form onSubmit={handleSubmitStep2(onSubmitStep2)} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...registerStep2("code")}
                    placeholder="Enter code"
                    autoFocus
                    className={`${inputClass} tracking-widest font-mono text-center text-lg`}
                  />
                  <KeyRound
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                  />
                </div>
                {errorsStep2.code && (
                  <p className="text-xs text-destructive mt-1.5 font-medium">
                    {errorsStep2.code.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Didn't get the code?</span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || resending}
                  className="text-primary hover:underline font-medium cursor-pointer disabled:opacity-50 disabled:no-underline flex items-center gap-1"
                >
                  {resending && <RefreshCw size={12} className="animate-spin" />}
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmittingStep2}
                className="w-full py-3.5 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingStep2 ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Verifying Code...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ArrowLeft size={13} />
                  Change Email Address
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── STEP 3: Enter New Password ── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            <div className="text-left mb-4">
              <h3 className="text-lg font-display font-bold text-foreground">
                Create new password
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Choose a strong password with at least 6 characters.
              </p>
            </div>

            <form onSubmit={handleSubmitStep3(onSubmitStep3)} className="space-y-4">
              <input type="hidden" value={recoverToken} {...registerStep3("recoverToken")} />

              {/* New Password */}
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    {...registerStep3("newPassword")}
                    placeholder="Min. 6 characters"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errorsStep3.newPassword && (
                  <p className="text-xs text-destructive mt-1.5 font-medium">
                    {errorsStep3.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    {...registerStep3("confirmPassword")}
                    placeholder="Re-enter password"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errorsStep3.confirmPassword && (
                  <p className="text-xs text-destructive mt-1.5 font-medium">
                    {errorsStep3.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingStep3}
                className="w-full py-3.5 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingStep3 ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    Set New Password
                    <ShieldCheck size={16} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* ── STEP 4: Success Message ── */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-3"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground">
              Password Reset Complete!
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your password has been successfully updated. You can now sign in with your new credentials.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onSuccess}
                className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-xs cursor-pointer shadow-sm"
              >
                Continue to Sign In
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
