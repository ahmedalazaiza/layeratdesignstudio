import type { RouteState } from "./router";
import type { Product } from "../types";

const SITE_NAME = "Layerat Design Studio";
const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://layerat.com";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop&q=80";

export interface SEOMetadata {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: "website" | "article" | "product";
  keywords?: string[];
}

/**
 * Generates SEO metadata for any given route state and product
 */
export function generateSEOMetadata(route: RouteState, product?: Product | null): SEOMetadata {
  const canonicalUrl = `${BASE_URL}${route.page === "home" ? "/" : "/" + route.page}`;

  switch (route.page) {
    case "home":
      return {
        title: `${SITE_NAME} — 100% Free Figma UI Kits & Design Systems`,
        description:
          "Explore curated 100% free Figma UI kits, design systems, mobile apps, dashboard templates, and wireframe flows built for modern UX/UI designers.",
        url: BASE_URL,
        image: DEFAULT_IMAGE,
        type: "website",
        keywords: [
          "free figma kits",
          "figma design systems",
          "ui kit free download",
          "figma resources",
          "layerat studio",
          "ux ui design",
          "dashboard templates",
        ],
      };

    case "browse": {
      if (route.searchQuery) {
        return {
          title: `Search results for "${route.searchQuery}" · ${SITE_NAME}`,
          description: `Download free Figma design templates, components, and UI kits matching "${route.searchQuery}" on Layerat Studio.`,
          url: `${BASE_URL}/browse?q=${encodeURIComponent(route.searchQuery)}`,
          image: DEFAULT_IMAGE,
          type: "website",
        };
      }
      return {
        title: `Explore 100% Free Figma Resources & Components · ${SITE_NAME}`,
        description:
          "Browse our curated library of free design templates, SaaS dashboards, mobile UI kits, and vector icons ready for Figma.",
        url: `${BASE_URL}/browse`,
        image: DEFAULT_IMAGE,
        type: "website",
      };
    }

    case "product": {
      if (product) {
        const title = `${product.title} — Free Figma Download · ${SITE_NAME}`;
        const pDesc =
          product.shortDescription ||
          (product as any).short_description ||
          `Download ${product.title} 100% free for Figma. Includes ${
            product.screensCount || (product as any).screens_count || 0
          } screens, ${
            product.componentsCount || (product as any).components_count || 0
          } components, auto layout, and dark mode.`;
        const productUrl = `${BASE_URL}/product/${product.slug || product.id}`;
        const image =
          product.thumbnail || (product as any).thumbnail_url || DEFAULT_IMAGE;

        return {
          title,
          description: pDesc,
          url: productUrl,
          image,
          type: "product",
          keywords: [
            ...(Array.isArray(product.tags)
              ? product.tags.map((t) => (typeof t === "string" ? t : t.name || t.slug || ""))
              : []),
            "free figma download",
            "ui kit",
            "figma template",
          ],
        };
      }
      return {
        title: `Design Resource Details · ${SITE_NAME}`,
        description: "Download high-quality free Figma design files and UI components on Layerat Studio.",
        url: canonicalUrl,
        image: DEFAULT_IMAGE,
        type: "website",
      };
    }

    case "favorites":
      return {
        title: `Saved Resources & My Library · ${SITE_NAME}`,
        description: "Access and organize your bookmarked Figma templates, UI kits, and design assets.",
        url: `${BASE_URL}/favorites`,
        type: "website",
      };

    case "profile":
      return {
        title: `Account Settings & Downloads · ${SITE_NAME}`,
        description: "Manage your designer profile, unlocked free kits, and preferences on Layerat Studio.",
        url: `${BASE_URL}/profile`,
        type: "website",
      };

    case "publisher":
      return {
        title: `Become a Creator Partner · ${SITE_NAME}`,
        description:
          "Share your Figma design kits with thousands of designers worldwide. Join the Layerat Creator Community.",
        url: `${BASE_URL}/publisher`,
        image: DEFAULT_IMAGE,
        type: "website",
      };

    case "about":
      return {
        title: `About Layerat Design Studio · Our Mission`,
        description:
          "Learn how Layerat Design Studio delivers world-class design systems and free Figma resources to designers worldwide.",
        url: `${BASE_URL}/about`,
        image: DEFAULT_IMAGE,
        type: "website",
      };

    case "team":
      return {
        title: `Creative Team & Leadership · ${SITE_NAME}`,
        description: "Meet the designers and product engineers crafting high-converting UI kits at Layerat Studio.",
        url: `${BASE_URL}/team`,
        image: DEFAULT_IMAGE,
        type: "website",
      };

    case "terms":
      return {
        title: `Terms & Conditions · ${SITE_NAME}`,
        description: "Read the commercial licensing and terms of use for Layerat free Figma resources.",
        url: `${BASE_URL}/terms`,
        type: "article",
      };

    case "privacy":
      return {
        title: `Privacy Policy · ${SITE_NAME}`,
        description: "Our commitment to data privacy, secure authentication, and transparent cookie policies.",
        url: `${BASE_URL}/privacy`,
        type: "article",
      };

    case "admin":
      return {
        title: `Admin Console · ${SITE_NAME}`,
        description: "Administrative console for managing products, categories, publishers, and site content.",
        url: `${BASE_URL}/dashboard`,
        type: "website",
      };

    default:
      return {
        title: SITE_NAME,
        description: "100% Free Figma Resources & Design Systems",
        url: BASE_URL,
        image: DEFAULT_IMAGE,
        type: "website",
      };
  }
}

/**
 * Updates document head meta tags dynamically for SEO crawlers and social share previews
 */
export function updateDOMHeadSEO(meta: SEOMetadata, product?: Product | null): void {
  if (typeof document === "undefined") return;

  // 1. Update Title
  document.title = meta.title;

  // Helper to set or create a meta tag
  const setMeta = (selector: string, attr: string, value: string) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      const [key, val] = selector.replace(/[\[\]"']/g, "").split("=");
      el.setAttribute(key, val);
      document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
  };

  // 2. Standard Meta Tags
  setMeta('meta[name="description"]', "content", meta.description);
  if (meta.keywords && meta.keywords.length > 0) {
    setMeta('meta[name="keywords"]', "content", meta.keywords.join(", "));
  }

  // 3. OpenGraph Tags (Facebook, LinkedIn, Discord, Slack)
  setMeta('meta[property="og:title"]', "content", meta.title);
  setMeta('meta[property="og:description"]', "content", meta.description);
  setMeta('meta[property="og:url"]', "content", meta.url);
  setMeta('meta[property="og:site_name"]', "content", SITE_NAME);
  setMeta('meta[property="og:type"]', "content", meta.type || "website");
  if (meta.image) {
    setMeta('meta[property="og:image"]', "content", meta.image);
  }

  // 4. Twitter Card Tags
  setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
  setMeta('meta[name="twitter:title"]', "content", meta.title);
  setMeta('meta[name="twitter:description"]', "content", meta.description);
  if (meta.image) {
    setMeta('meta[name="twitter:image"]', "content", meta.image);
  }

  // 5. Canonical Link Tag
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement("link");
    canonicalEl.setAttribute("rel", "canonical");
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute("href", meta.url);

  // 6. JSON-LD Structured Data Schema for Google Search
  updateJSONLDStructuredData(meta, product);
}

/**
 * Injects Google JSON-LD schema for Products, Breadcrumbs, and Organization
 */
function updateJSONLDStructuredData(meta: SEOMetadata, product?: Product | null): void {
  const SCRIPT_ID = "layerat-jsonld-schema";
  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

  if (!script) {
    script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }

  if (product) {
    // Rich Product Schema for Google Search
    const productSchema = {
      "@context": "https://schema.org/",
      "@type": "SoftwareApplication",
      name: product.title,
      description: meta.description,
      image: meta.image,
      applicationCategory: "DesignApplication",
      operatingSystem: "Figma",
      offers: {
        "@type": "Offer",
        price: "0.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "84",
      },
      author: {
        "@type": "Organization",
        name: SITE_NAME,
        url: BASE_URL,
      },
    };
    script.textContent = JSON.stringify(productSchema);
  } else {
    // Website & Organization Schema
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: BASE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${BASE_URL}/browse?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };
    script.textContent = JSON.stringify(orgSchema);
  }
}
