"use client";

import React, { Suspense, useEffect, useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * ScrollToTop Component for Next.js App Router
 * Resets scroll to (0, 0) upon page route or search parameter changes.
 */
function ScrollToTopInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    } catch {}
  };

  useLayoutEffect(() => {
    executeScrollReset();
    const rafId = requestAnimationFrame(executeScrollReset);
    const t1 = setTimeout(executeScrollReset, 50);
    const t2 = setTimeout(executeScrollReset, 150);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, searchParams]);

  return null;
}

export function ScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollToTopInner />
    </Suspense>
  );
}

export default ScrollToTop;
