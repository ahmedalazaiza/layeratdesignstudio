"use client";

import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0d0f12] text-[#f4f4f5] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full rounded-3xl border border-[#27272a] bg-[#18181b] p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#f4f4f5] mb-2 font-display">
              Critical System Crash
            </h1>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              A fatal application error prevented Layerat Studio from initializing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#aaff38] text-[#0d0f12] font-bold text-xs font-mono hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={14} /> Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
