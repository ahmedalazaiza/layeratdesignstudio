"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, AlertTriangle } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-destructive text-destructive-foreground text-xs font-mono py-2.5 px-4 sticky top-0 z-[100] border-b border-destructive-foreground/20 shadow-md flex items-center justify-center gap-2"
        >
          <WifiOff size={15} className="shrink-0 animate-pulse" />
          <span className="font-bold">Offline Mode:</span>
          <span>No internet connection detected. Saved cache available; real-time actions are paused.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
