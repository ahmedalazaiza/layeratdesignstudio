"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("Layerat App Error Boundary caught an exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 selection:bg-primary selection:text-primary-foreground">
      <div className="max-w-lg w-full rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-2xl text-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-destructive/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mx-auto mb-6 shadow-sm">
          <AlertOctagon size={32} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono font-bold mb-3">
          <span>Application Exception</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
          Something went wrong
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
          An unexpected error occurred while rendering this page. Our team has been notified.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs font-mono hover:shadow-[0_0_25px_rgba(170,255,56,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={14} /> Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-border bg-background hover:bg-muted text-foreground font-bold text-xs font-mono transition-colors flex items-center justify-center gap-2"
          >
            <Home size={14} /> Return Home
          </Link>
        </div>

        {/* Developer Stack Details Toggle */}
        <div className="border-t border-border pt-4 text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
          >
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showDetails ? "Hide technical diagnostic" : "Show technical diagnostic"}
          </button>

          {showDetails && (
            <div className="mt-3 p-3 rounded-xl bg-muted/60 border border-border text-[11px] font-mono text-destructive overflow-x-auto text-left max-h-40">
              <p className="font-bold">{error.message || "Unknown error"}</p>
              {error.digest && <p className="text-muted-foreground mt-1">Digest: {error.digest}</p>}
              {error.stack && (
                <pre className="text-[10px] text-muted-foreground/80 mt-2 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
