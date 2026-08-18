import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Bulletproof ScrollToTop Component
 * Disables browser auto-restoration and ensures scroll is reset to (0, 0)
 * immediately, on animation frames, and after transition/suspense DOM mounts.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation();

  // Set browser scrollRestoration to manual on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  const executeScrollReset = () => {
    try {
      window.scrollTo(0, 0);
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
      }
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0;
        document.scrollingElement.scrollLeft = 0;
      }
      const root = document.getElementById("root");
      if (root) {
        root.scrollTop = 0;
        root.scrollLeft = 0;
      }
    } catch {}
  };

  useLayoutEffect(() => {
    // 1. Synchronous execution before paint
    executeScrollReset();

    // 2. Next animation frame
    const rafId = requestAnimationFrame(executeScrollReset);

    // 3. Multi-stage timeouts to guarantee top position after Suspense and Framer Motion transitions
    const t1 = setTimeout(executeScrollReset, 50);
    const t2 = setTimeout(executeScrollReset, 150);
    const t3 = setTimeout(executeScrollReset, 250);
    const t4 = setTimeout(executeScrollReset, 400);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [pathname, search]);

  return null;
}
