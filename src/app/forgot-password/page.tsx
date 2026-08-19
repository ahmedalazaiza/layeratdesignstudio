"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayeratLogo } from "@/components/brand/LayeratLogo";
import { PasswordRecoveryWizard } from "@/components/auth/PasswordRecoveryWizard";

function ForgotPasswordContent() {
  const router = useRouter();

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
            Account Recovery
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Follow the 3-step verification to restore your account access.
          </p>
        </div>

        <PasswordRecoveryWizard
          onSuccess={() => router.push("/login")}
          onBackToLogin={() => router.push("/login")}
        />
      </motion.div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-muted-foreground font-mono">
          Loading recovery...
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
