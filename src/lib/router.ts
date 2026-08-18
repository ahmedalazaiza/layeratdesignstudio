import type { Page, Product } from "../types";

export interface RouteState {
  page: Page;
  productId?: string;
  categoryId?: string | null;
  searchQuery?: string;
}

const SITE_NAME = "Layerat Design Studio";

/**
 * Returns the page title matching the given route
 */
export function getRouteTitle(route: RouteState, product?: Product | null): string {
  switch (route.page) {
    case "home":
      return `${SITE_NAME} — 100% Free Figma Resources & Design Systems`;
    case "browse":
      if (route.searchQuery) {
        return `Search "${route.searchQuery}" — ${SITE_NAME}`;
      }
      return `Browse Free Figma UI Kits & Resources — ${SITE_NAME}`;
    case "product":
      if (product) {
        return `${product.title} — Free Figma Kit · ${SITE_NAME}`;
      }
      return `Product Details — ${SITE_NAME}`;
    case "favorites":
      return `My Library & Unlocked Gifts — ${SITE_NAME}`;
    case "publisher":
      return `Join as Creator Partner & Publisher — ${SITE_NAME}`;
    case "about":
      return `About Us & Mission — ${SITE_NAME}`;
    case "team":
      return `Our Creative Team — ${SITE_NAME}`;
    case "profile":
      return `My Profile & Account Settings — ${SITE_NAME}`;
    case "admin":
      return `Admin Console — ${SITE_NAME}`;
    default:
      return SITE_NAME;
  }
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

  // 2. Product Detail: /product/:id
  const productMatch = pathname.match(/^\/product\/([^/]+)/);
  if (productMatch) {
    return {
      page: "product",
      productId: decodeURIComponent(productMatch[1]),
    };
  }

  // 3. Browse
  if (pathname === "/browse" || pathname === "/explore") {
    return {
      page: "browse",
      categoryId: searchParams.get("category") || null,
      searchQuery: searchParams.get("q") || "",
    };
  }

  // 4. Favorites / Library
  if (pathname === "/favorites" || pathname === "/library" || pathname === "/saved") {
    return { page: "favorites" };
  }

  // 5. Publisher / Join
  if (pathname === "/publisher" || pathname === "/join" || pathname === "/creator") {
    return { page: "publisher" };
  }

  // 6. About
  if (pathname === "/about" || pathname === "/story") {
    return { page: "about" };
  }

  // 7. Team
  if (pathname === "/team" || pathname === "/creators") {
    return { page: "team" };
  }

  // 8. Profile
  if (pathname === "/profile" || pathname === "/account") {
    return { page: "profile" };
  }

  // Default: Home
  return { page: "home" };
}

/**
 * Convert a RouteState object into a clean URL string
 */
export function buildRouteUrl(route: RouteState): string {
  switch (route.page) {
    case "home":
      return "/";
    case "browse": {
      const params = new URLSearchParams();
      if (route.categoryId) params.set("category", route.categoryId);
      if (route.searchQuery && route.searchQuery.trim().length > 0) {
        params.set("q", route.searchQuery.trim());
      }
      const qs = params.toString();
      return qs ? `/browse?${qs}` : "/browse";
    }
    case "product":
      return route.productId ? `/product/${encodeURIComponent(route.productId)}` : "/browse";
    case "favorites":
      return "/favorites";
    case "publisher":
      return "/publisher";
    case "about":
      return "/about";
    case "team":
      return "/team";
    case "profile":
      return "/profile";
    case "admin":
      return "/dashboard";
    default:
      return "/";
  }
}

/**
 * Update the browser URL and history without full page reload
 */
export function pushRoute(route: RouteState, product?: Product | null, replace: boolean = false) {
  if (typeof window === "undefined" || !window.history) return;

  const url = buildRouteUrl(route);
  const title = getRouteTitle(route, product);

  document.title = title;

  if (replace) {
    window.history.replaceState(route, title, url);
  } else if (window.location.pathname + window.location.search !== url) {
    window.history.pushState(route, title, url);
  }
}
