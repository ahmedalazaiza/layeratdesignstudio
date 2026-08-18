import type { Page, Product } from "../types";
import { generateSEOMetadata, updateDOMHeadSEO } from "./seo";

export interface RouteState {
  page: Page;
  productId?: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  searchQuery?: string;
}

const SITE_NAME = "Layerat Design Studio";

/**
 * Returns the page title matching the given route
 */
export function getRouteTitle(route: RouteState, product?: Product | null): string {
  const meta = generateSEOMetadata(route, product);
  return meta.title;
}

/**
 * Parse the current browser URL into a RouteState object
 */
export function parseCurrentRoute(): RouteState {
  if (typeof window === "undefined") {
    return { page: "home" };
  }

  const pathname = window.location.pathname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);

  // 1. Dashboard / Admin
  if (pathname === "/dashboard" || pathname === "/admin") {
    return { page: "admin" };
  }

  // 2. Product Detail: /product/:slugOrId
  const productMatch = pathname.match(/^\/product\/([^/?#]+)/);
  if (productMatch) {
    return {
      page: "product",
      productId: decodeURIComponent(productMatch[1]),
    };
  }

  // 3. Browse / Explore / Search
  if (pathname === "/browse" || pathname === "/explore") {
    return {
      page: "browse",
      categoryId: searchParams.get("category") || null,
      subcategoryId: searchParams.get("subcategory") || null,
      searchQuery: searchParams.get("q") || "",
    };
  }

  // 4. Favorites / Saved Library
  if (pathname === "/favorites" || pathname === "/library" || pathname === "/saved") {
    return { page: "favorites" };
  }

  // 5. Publisher / Creator Program
  if (pathname === "/publisher" || pathname === "/join" || pathname === "/creator") {
    return { page: "publisher" };
  }

  // 6. About Us
  if (pathname === "/about" || pathname === "/story") {
    return { page: "about" };
  }

  // 7. Team
  if (pathname === "/team" || pathname === "/creators") {
    return { page: "team" };
  }

  // 8. Terms of Service
  if (pathname === "/terms" || pathname === "/terms-of-service" || pathname === "/license") {
    return { page: "terms" };
  }

  // 9. Privacy Policy
  if (pathname === "/privacy" || pathname === "/privacy-policy") {
    return { page: "privacy" };
  }

  // 10. Profile / Account Settings
  if (pathname === "/profile" || pathname === "/account") {
    return { page: "profile" };
  }

  // Default: Home Page
  return { page: "home" };
}

/**
 * Convert a RouteState object into a clean URL string
 */
export function buildRouteUrl(route: RouteState, product?: Product | null): string {
  switch (route.page) {
    case "home":
      return "/";
    case "browse": {
      const params = new URLSearchParams();
      if (route.categoryId) params.set("category", route.categoryId);
      if (route.subcategoryId) params.set("subcategory", route.subcategoryId);
      if (route.searchQuery && route.searchQuery.trim().length > 0) {
        params.set("q", route.searchQuery.trim());
      }
      const qs = params.toString();
      return qs ? `/browse?${qs}` : "/browse";
    }
    case "product": {
      const slugOrId = product?.slug || route.productId;
      return slugOrId ? `/product/${encodeURIComponent(slugOrId)}` : "/browse";
    }
    case "favorites":
      return "/favorites";
    case "publisher":
      return "/publisher";
    case "about":
      return "/about";
    case "team":
      return "/team";
    case "terms":
      return "/terms";
    case "privacy":
      return "/privacy";
    case "profile":
      return "/profile";
    case "admin":
      return "/dashboard";
    default:
      return "/";
  }
}

/**
 * Update the browser URL and history without full page reload, while dynamically syncing SEO head tags
 */
export function pushRoute(
  route: RouteState,
  product?: Product | null,
  replace: boolean = false
): void {
  if (typeof window === "undefined" || !window.history) return;

  const url = buildRouteUrl(route, product);
  const meta = generateSEOMetadata(route, product);

  // Sync title, description, canonical link, and JSON-LD schema dynamically
  updateDOMHeadSEO(meta, product);

  if (replace) {
    window.history.replaceState(route, meta.title, url);
  } else if (window.location.pathname + window.location.search !== url) {
    window.history.pushState(route, meta.title, url);
  }
}
