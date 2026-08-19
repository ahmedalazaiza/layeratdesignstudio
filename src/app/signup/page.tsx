"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { LayeratLogo } from "@/components/brand/LayeratLogo";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { signupSchema, type SignupFormData } from "@/lib/validations/auth";

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/profile";
  const { signup, isAuthenticated } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, router, redirectUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
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

  const watchedUserName = watch("userName");

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

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
  }, [watchedUserName]);

  const onSubmit = async (data: SignupFormData) => {
    if (usernameStatus === "taken") return;
    try {
      await signup({
        userName: data.userName.toLowerCase().trim(),
        displayName: data.displayName || data.userName,
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });
      router.push(redirectUrl);
    } catch {
      // Handled in context toast
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 pr-12 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all text-sm";

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3">
            <LayeratLogo size="md" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Create Your Account
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Join the community and download 100% free Figma UI kits.
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="space-y-4 mb-6">
          <GoogleSignInButton
            mode="signup"
            onSuccess={() => router.push(redirectUrl)}
          />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-mono uppercase text-muted-foreground/60 tracking-wider">
              or register with email
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
              Full Name (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                {...register("displayName")}
                placeholder="Ahmed Alazaiza"
                className={inputClass}
              />
              <User
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
              />
            </div>
            {errors.displayName && (
              <p className="text-xs text-destructive mt-1.5 font-medium">
                {errors.displayName.message}
              </p>
            )}
          </div>

          {/* Username */}
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
                {...register("userName", {
                  onChange: (e) => {
                    setValue("userName", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                  },
                })}
                placeholder="alex_ux"
                className={`${inputClass} font-mono lowercase`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground/50">
                @
              </span>
            </div>
            {errors.userName && (
              <p className="text-xs text-destructive mt-1.5 font-medium">
                {errors.userName.message}
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
                {...register("email")}
                placeholder="you@example.com"
                className={inputClass}
              />
              <Mail
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive mt-1.5 font-medium">
                {errors.email.message}
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
                {...register("password")}
                placeholder="Min. 6 characters"
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
            {errors.password && (
              <p className="text-xs text-destructive mt-1.5 font-medium">
                {errors.password.message}
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
                {...register("confirmPassword")}
                placeholder="Repeat password"
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
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1.5 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || usernameStatus === "checking" || usernameStatus === "taken"}
            className="w-full py-3.5 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
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

        <p className="text-xs text-center text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-muted-foreground font-mono">
          Loading sign up...
        </div>
      }
    >
      <SignupFormContent />
    </Suspense>
  );
}
