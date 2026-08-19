import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Search, Layers, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 selection:bg-primary selection:text-primary-foreground">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Neon 404 Badge */}
        <div className="relative inline-block">
          <span className="text-8xl sm:text-9xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-primary via-primary/60 to-transparent tracking-tighter select-none">
            404
          </span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-card border border-border text-xs font-mono font-bold text-muted-foreground shadow-sm">
            Page Not Found
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
            Lost in the Design Canvas?
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The resource, category, or creator profile you are looking for might have been moved or doesn't exist.
          </p>
        </div>

        {/* Quick Links */}
        <div className="p-4 rounded-3xl border border-border bg-card shadow-sm space-y-3">
          <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-wider font-semibold block">
            Popular Destinations
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <Link
              href="/browse"
              className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/40 transition-colors flex items-center gap-2 text-foreground font-medium"
            >
              <Compass size={14} className="text-primary" />
              Browse Kits
            </Link>
            <Link
              href="/publisher"
              className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/40 transition-colors flex items-center gap-2 text-foreground font-medium"
            >
              <Layers size={14} className="text-primary" />
              Publisher
            </Link>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs font-mono hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all"
        >
          <ArrowLeft size={14} /> Back to Layerat Studio
        </Link>
      </div>
    </div>
  );
}
