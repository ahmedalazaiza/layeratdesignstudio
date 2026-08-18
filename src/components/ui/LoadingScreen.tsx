import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { LayeratIconSvg, LayeratLogo } from "../brand/LayeratLogo";

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingScreen({
  isLoading,
  message = "Preparing studio resources...",
}: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="global-loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-foreground select-none"
        >
          {/* Ambient Glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-6">
            {/* Animated Logo Icon */}
            <div className="relative mb-6">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 8,
                  ease: "linear",
                }}
                className="w-24 h-24 rounded-3xl border-2 border-primary/20 border-t-primary flex items-center justify-center p-2"
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-card border border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-primary/20 p-2.5">
                  <LayeratIconSvg color="#aaff38" size={32} />
                </div>
              </div>
            </div>

            {/* Title & Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold mb-3">
              <Sparkles size={12} className="animate-spin" />
              Layerat Design Studio
            </div>

            <h2 className="text-xl font-display font-extrabold text-foreground mb-1 tracking-tight">
              Loading Studio
            </h2>

            <p className="text-xs text-muted-foreground font-mono animate-pulse">
              {message}
            </p>

            {/* Progress Bar */}
            <div className="w-48 h-1 bg-border/60 rounded-full mt-6 overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: "easeInOut",
                }}
                className="w-full h-full bg-primary rounded-full shadow-[0_0_12px_rgba(170,255,56,0.8)]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
