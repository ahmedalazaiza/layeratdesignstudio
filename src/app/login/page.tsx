"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { LayeratLogo } from "@/components/brand/LayeratLogo";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/profile";
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, router, redirectUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailOrUserName: "", password: "", rememberMe: true },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
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
            Sign In to Layerat
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Access your saved UI kits, downloads, and designer profile.
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="space-y-4 mb-6">
          <GoogleSignInButton
            mode="login"
            onSuccess={() => router.push(redirectUrl)}
          />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-mono uppercase text-muted-foreground/60 tracking-wider">
              or with password
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5 font-medium">
              Email or Username
            </label>
            <div className="relative">
              <input
                type="text"
                {...register("emailOrUserName")}
                placeholder="you@example.com or username"
                className={inputClass}
              />
              <Mail
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
              />
            </div>
            {errors.emailOrUserName && (
              <p className="text-xs text-destructive mt-1.5 font-medium">
                {errors.emailOrUserName.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block font-medium">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
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

        <p className="text-xs text-center text-muted-foreground mt-6">
          Don't have an account yet?{" "}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-muted-foreground font-mono">
          Loading sign in...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
