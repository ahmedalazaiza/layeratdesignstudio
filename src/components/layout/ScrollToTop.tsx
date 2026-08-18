import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 * Automatically resets window scroll to the top on every route navigation.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll window to top smoothly/instant on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" as ScrollBehavior,
    });
  }, [pathname, search]);

  return null;
}
