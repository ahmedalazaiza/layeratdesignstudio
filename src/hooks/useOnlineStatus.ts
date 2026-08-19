"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored", {
        description: "You are back online. All features and downloads are accessible.",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are currently offline", {
        description: "Some features and live Figma downloads may be unavailable until reconnected.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
