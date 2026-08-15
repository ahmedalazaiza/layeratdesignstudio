import { supabase } from "../lib/supabase";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import {
  Sun, Moon, Menu, X, Search, ChevronLeft, ChevronDown, ChevronRight,
  Star, Download, Eye, Heart, ArrowUpRight, Check, User, Settings,
  LogOut, Package, Layers, Smartphone, FileText, Layout, Bell, Lock,
  Mail, CheckCircle, Filter, ExternalLink, Bookmark, Award, Clock,
  Users, Briefcase, Plus, Minus, Globe, AlertCircle, Send, Shield,
  Zap, Code, MapPin
} from "lucide-react";

// ─── Backend Config ──────────────────────────────────────────────────────────
// Set VITE_API_URL in .env.local to point at your backend
export const API_BASE: string =
  (import.meta as any).env?.VITE_API_URL ?? "https://api.layerat.com";

/*
 * ====================================================================
 *  API ENDPOINT REFERENCE  –  hand this to your backend developer
 * ====================================================================
 *
 *  AUTH
 *  ────────────────────────────────────────────────────────────────────
 *  POST   /auth/register      body: { name, email, password }
 *                             resp: { user: AuthUser, token: string }
 *
 *  POST   /auth/login         body: { email, password }
 *                             resp: { user: AuthUser, token: string }
 *
 *  GET    /auth/me            header: Authorization: Bearer <token>
 *                             resp: { user: AuthUser }
 *                             call on app mount to restore session
 *
 *  POST   /auth/logout        header: Bearer <token>
 *                             resp: { success: true }
 *
 *  PUT    /auth/profile       header: Bearer <token>
 *                             body: { name?, bio?, website?, avatar? }
 *                             resp: { user: AuthUser }
 *
 *  POST   /auth/password      header: Bearer <token>
 *                             body: { currentPassword, newPassword }
 *                             resp: { success: true }
 *
 *  PRODUCTS
 *  ────────────────────────────────────────────────────────────────────
 *  GET    /products           query: ?page&limit&category&subcategory
 *                                    &q&sort&isFree&tags
 *                             resp: { products: Product[], total, page, pages }
 *
 *  GET    /products/featured  resp: { products: Product[] }
 *
 *  GET    /products/:slug     resp: { product: Product }
 *
 *  POST   /products/:id/view  call on product detail mount – increments viewsCount
 *
 *  PURCHASES & DOWNLOADS
 *  ────────────────────────────────────────────────────────────────────
 *  GET    /purchases          header: Bearer <token>
 *                             resp: { purchases: Purchase[] }
 *
 *  POST   /purchases          header: Bearer <token>
 *                             body: { productId, paymentMethodId }
 *                             resp: { purchase: Purchase, clientSecret? }
 *                             integrate Stripe on frontend with clientSecret
 *
 *  GET    /products/:id/download  header: Bearer <token>  (must own product)
 *                                 resp: redirect to signed S3/CDN URL
 *
 *  WISHLIST
 *  ────────────────────────────────────────────────────────────────────
 *  GET    /wishlist           header: Bearer <token>
 *                             resp: { items: Product[] }
 *
 *  POST   /wishlist/:id       header: Bearer <token>  (toggle)
 *                             resp: { added: boolean }
 *
 *  REVIEWS
 *  ────────────────────────────────────────────────────────────────────
 *  GET    /products/:id/reviews   resp: { reviews: Review[], rating, count }
 *  POST   /products/:id/reviews   header: Bearer <token>
 *                                 body: { rating: 1-5, comment: string }
 *
 *  CATEGORIES
 *  ────────────────────────────────────────────────────────────────────
 *  GET    /categories         resp: { categories: Category[] }
 * ====================================================================
 */

// ─── Types ───────────────────────────────────────────────────────────────────

type Page = "home" | "browse" | "product" | "profile" | "publisher" | "team" | "about" | "favorites";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: React.ElementType;
  color: string;
  subcategories: Subcategory[];
}

interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  price: number;           // USD; 0 when isFree
  discountPrice?: number;  // active sale price
  currency: string;        // "USD"
  isFree: boolean;
  thumbnail: string;       // cover image URL
  galleryImages: string[]; // 6+ preview images for detail page
  figmaPreviewUrl?: string; // Figma Community or embed URL
  categoryId: string;
  subcategoryId: string;
  tags: string[];
  // File specs
  fileSize: string;          // e.g. "18.4 MB"
  formats: string[];         // ["Figma"] or ["Figma", "Sketch"]
  screensCount: number;
  componentsCount: number;
  version: string;           // e.g. "v2.0.0"
  // Figma feature flags (show as badges in detail)
  supportsVariables: boolean;
  supportsAutoLayout: boolean;
  supportsLightDark: boolean;
  // License
  licenseType: "personal" | "commercial";
  // Stats – read from /products/:id/stats or embed in product response
  downloadsCount: number;
  viewsCount: number;
  rating: number;        // 0–5 float
  reviewsCount: number;
  // Secure download URL – backend returns a signed, time-limited link
  downloadFileUrl: string;
}

// Mirrors the backend User model; extend fields as needed
interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;    // URL; null → show initials fallback
  bio?: string;
  website?: string;
  role: "user" | "creator" | "admin";
  purchases: string[];  // product IDs
  wishlist: string[];   // product IDs
  createdAt: string;    // ISO 8601
}

interface BrowseFilters {
  query: string;
  categoryId: string | null;
  subcategoryId: string | null;
  isFree: boolean | null;   // null = show all
  sortBy: "newest" | "downloads" | "rating" | "price-asc" | "price-desc";
}

// ─── Static Data ─────────────────────────────────────────────────────────────
// TODO: Replace with GET ${API_BASE}/categories

const CATEGORIES: Category[] = [
  {
    id: "ui-kits", name: "UI Kits & Systems", slug: "ui-kits",
    icon: Layers, color: "#aaff38",
    subcategories: [
      { id: "mobile-ui", name: "Mobile UI Kits (iOS & Android)", slug: "mobile-ui" },
      { id: "web-saas-ui", name: "Web & SaaS UI Kits", slug: "web-saas-ui" },
      { id: "design-systems", name: "Design Systems & Tokens", slug: "design-systems" },
      { id: "dashboard-admin", name: "Dashboard & Admin Kits", slug: "dashboard-admin" },
    ],
  },
  {
    id: "templates", name: "Templates & Landing Pages", slug: "templates",
    icon: Layout, color: "#60a5fa",
    subcategories: [
      { id: "saas-landing", name: "SaaS & Tech Landing Pages", slug: "saas-landing" },
      { id: "portfolio-agency", name: "Portfolio & Agency", slug: "portfolio-agency" },
      { id: "ecommerce", name: "E-Commerce Websites", slug: "ecommerce" },
      { id: "mobile-web", name: "Mobile Responsive Web Apps", slug: "mobile-web" },
    ],
  },
  {
    id: "wireframes", name: "Wireframes & UX Flows", slug: "wireframes",
    icon: FileText, color: "#f59e0b",
    subcategories: [
      { id: "wireframe-kits", name: "Low-Fidelity & High-Fidelity Wireframes", slug: "wireframe-kits" },
      { id: "user-flows", name: "User Flows & Journey Maps", slug: "user-flows" },
      { id: "ia-kits", name: "Information Architecture Kits", slug: "ia-kits" },
      { id: "ux-audit", name: "UX Audit & Heuristic Templates", slug: "ux-audit" },
    ],
  },
  {
    id: "icons-assets", name: "Icons & Visual Assets", slug: "icons-assets",
    icon: Package, color: "#c084fc",
    subcategories: [
      { id: "3d-assets", name: "3D UI Assets", slug: "3d-assets" },
      { id: "vector-icons", name: "Vector System Icons", slug: "vector-icons" },
      { id: "lottie-icons", name: "Animated Lottie Icons", slug: "lottie-icons" },
      { id: "device-mockups", name: "Device Mockups", slug: "device-mockups" },
    ],
  },
];

// TODO: Replace with GET ${API_BASE}/products (paginated)
const PRODUCTS: Product[] = [
  {
    id: "p1", slug: "orbit-saas-ui-kit",
    title: "Orbit SaaS UI Kit",
    shortDescription: "Complete SaaS product UI kit with 180+ screens — dashboards, onboarding, auth, settings and more.",
    fullDescription: "Orbit is a premium Figma UI kit built for modern SaaS products. Covering every core flow from landing pages to complex dashboards, Orbit ships with 180 screens across 12 categories, 340+ auto-layout components, a full token system compatible with Figma Variables, and both light and dark mode. Built with real product teams in mind — every component is structured, named, and documented for smooth developer handoff.",
    price: 0, currency: "USD", isFree: true,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=560&fit=crop&auto=format",
    galleryImages: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1516321165247-4aa89a48be55?w=900&h=620&fit=crop&auto=format",
    ],
    figmaPreviewUrl: "https://www.figma.com/community",
    categoryId: "ui-kits", subcategoryId: "web-saas-ui",
    tags: ["SaaS", "Dashboard", "Web", "Dark Mode", "Components", "Design System"],
    fileSize: "24.2 MB", formats: ["Figma"], screensCount: 180,
    componentsCount: 340, version: "v2.1.0",
    supportsVariables: true, supportsAutoLayout: true, supportsLightDark: true,
    licenseType: "commercial",
    downloadsCount: 3820, viewsCount: 14200, rating: 4.9, reviewsCount: 187,
    downloadFileUrl: `${API_BASE}/products/p1/download`,
  },
  {
    id: "p2", slug: "mobilefirst-ios-kit",
    title: "MobileFirst iOS UI Kit",
    shortDescription: "120 screens crafted to iOS Human Interface Guidelines — fully customizable, production-ready.",
    fullDescription: "MobileFirst is a comprehensive iOS UI kit designed to align perfectly with Apple Human Interface Guidelines while staying highly customizable. It covers all common mobile app flows: auth, home feeds, profiles, settings, messaging, e-commerce, and more. All components use Auto Layout, and the kit ships with a Figma Variables token system to switch themes in seconds.",
    price: 0, currency: "USD", isFree: true,
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=560&fit=crop&auto=format",
    galleryImages: [
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&h=620&fit=crop&auto=format",
    ],
    categoryId: "ui-kits", subcategoryId: "mobile-ui",
    tags: ["iOS", "Mobile", "iPhone", "SwiftUI", "Auto Layout", "Variables"],
    fileSize: "18.8 MB", formats: ["Figma"], screensCount: 120,
    componentsCount: 260, version: "v1.4.0",
    supportsVariables: true, supportsAutoLayout: true, supportsLightDark: true,
    licenseType: "commercial",
    downloadsCount: 2140, viewsCount: 9800, rating: 4.8, reviewsCount: 124,
    downloadFileUrl: `${API_BASE}/products/p2/download`,
  },
  {
    id: "p3", slug: "flowmaster-ux-kit",
    title: "FlowMaster UX Flow Kit",
    shortDescription: "Free user flow & journey map kit — 60+ ready-made flow templates for any product type.",
    fullDescription: "FlowMaster is a free Figma resource for UX designers who want to document and communicate product flows faster. The kit includes 60+ pre-built flow diagrams covering e-commerce checkouts, onboarding journeys, mobile app navigation trees, and service blueprints. Every diagram uses a consistent visual language with clear annotation components, decision nodes, and swimlane templates.",
    price: 0, currency: "USD", isFree: true,
    thumbnail: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=560&fit=crop&auto=format",
    galleryImages: [
      "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1509537257950-20f875b03669?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&h=620&fit=crop&auto=format",
    ],
    categoryId: "wireframes", subcategoryId: "user-flows",
    tags: ["User Flows", "Journey Maps", "UX", "Free", "Flowchart", "Service Blueprint"],
    fileSize: "8.1 MB", formats: ["Figma"], screensCount: 60,
    componentsCount: 140, version: "v1.0.0",
    supportsVariables: false, supportsAutoLayout: true, supportsLightDark: false,
    licenseType: "personal",
    downloadsCount: 8760, viewsCount: 31000, rating: 4.7, reviewsCount: 342,
    downloadFileUrl: `${API_BASE}/products/p3/download`,
  },
  {
    id: "p4", slug: "dashpro-admin-kit",
    title: "DashPro Admin Kit",
    shortDescription: "Enterprise-grade admin dashboard kit — data tables, charts, user management, and 90+ components.",
    fullDescription: "DashPro is purpose-built for enterprise admin interfaces. Forget generic dashboards — DashPro covers every admin use case: user management panels, permission matrices, complex data tables with inline editing, multi-chart analytics pages, notification systems, and audit logs. Designed for handoff efficiency: every component is annotated with interaction states and responsive breakpoints.",
    price: 0, currency: "USD", isFree: true,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=560&fit=crop&auto=format",
    galleryImages: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&h=620&fit=crop&auto=format",
    ],
    categoryId: "ui-kits", subcategoryId: "dashboard-admin",
    tags: ["Admin", "Dashboard", "Enterprise", "Data Tables", "Charts", "Analytics"],
    fileSize: "31.5 MB", formats: ["Figma"], screensCount: 95,
    componentsCount: 420, version: "v3.0.1",
    supportsVariables: true, supportsAutoLayout: true, supportsLightDark: true,
    licenseType: "commercial",
    downloadsCount: 1980, viewsCount: 8400, rating: 4.9, reviewsCount: 98,
    downloadFileUrl: `${API_BASE}/products/p4/download`,
  },
  {
    id: "p5", slug: "nexus-design-system",
    title: "Nexus Design System",
    shortDescription: "Production-grade Figma design system with 600+ components, token library, and full documentation.",
    fullDescription: "Nexus is the most comprehensive design system kit in our library. Built to bridge the gap between design and code, Nexus ships with 600+ components organized across 18 categories, a complete Figma Variables token architecture covering colors, typography, spacing, shadows, and radii, plus a documentation template you can fill in and share with your team. Light, dark, and high-contrast modes included.",
    price: 0, currency: "USD", isFree: true,
    thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=560&fit=crop&auto=format",
    galleryImages: [
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1558655146-d09347e92766?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=900&h=620&fit=crop&auto=format",
    ],
    categoryId: "ui-kits", subcategoryId: "design-systems",
    tags: ["Design System", "Tokens", "Variables", "Components", "Documentation", "Atomic Design"],
    fileSize: "52.8 MB", formats: ["Figma"], screensCount: 0,
    componentsCount: 620, version: "v4.2.0",
    supportsVariables: true, supportsAutoLayout: true, supportsLightDark: true,
    licenseType: "commercial",
    downloadsCount: 4310, viewsCount: 19600, rating: 5.0, reviewsCount: 261,
    downloadFileUrl: `${API_BASE}/products/p5/download`,
  },
  {
    id: "p6", slug: "launchpad-saas-landing",
    title: "LaunchPad SaaS Landing",
    shortDescription: "High-converting SaaS landing page template — hero, features, pricing, testimonials, FAQ and footer.",
    fullDescription: "LaunchPad is a conversion-optimized landing page template for SaaS startups and tech products. It includes 14 pre-designed sections covering every element of a great SaaS landing page: hero with social proof, feature grids, product screenshots, pricing tables, customer testimonials, comparison tables, FAQ accordions, and newsletter CTAs. Fully responsive across mobile, tablet, and desktop.",
    price: 0, currency: "USD", isFree: true,
    thumbnail: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&h=560&fit=crop&auto=format",
    galleryImages: [
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1558655146-d09347e92766?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=900&h=620&fit=crop&auto=format",
    ],
    categoryId: "templates", subcategoryId: "saas-landing",
    tags: ["Landing Page", "SaaS", "Startup", "Marketing", "Responsive", "Conversion"],
    fileSize: "11.3 MB", formats: ["Figma"], screensCount: 14,
    componentsCount: 85, version: "v1.2.0",
    supportsVariables: false, supportsAutoLayout: true, supportsLightDark: true,
    licenseType: "commercial",
    downloadsCount: 5620, viewsCount: 22400, rating: 4.8, reviewsCount: 318,
    downloadFileUrl: `${API_BASE}/products/p6/download`,
  },
  {
    id: "p7", slug: "iconvault-vector-pack",
    title: "IconVault Vector Pack",
    shortDescription: "2,400+ consistent vector icons in outline, filled, and duotone styles — organized and ready to export.",
    fullDescription: "IconVault gives you 2,400 vector icons across 80 categories — from interface basics to industry-specific sets like finance, healthcare, logistics, and travel. Three visual styles (outline, filled, duotone) let you match any product aesthetic. All icons are built on a 24×24 grid, use consistent 1.5px stroke weights, and are organized into a Figma component set with searchable names for fast insertion.",
    price: 0, currency: "USD", isFree: true,
    thumbnail: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&h=560&fit=crop&auto=format",
    galleryImages: [
      "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1558655146-d09347e92766?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=900&h=620&fit=crop&auto=format",
    ],
    categoryId: "icons-assets", subcategoryId: "vector-icons",
    tags: ["Icons", "Vector", "SVG", "Outline", "Filled", "Duotone", "UI Icons"],
    fileSize: "9.6 MB", formats: ["Figma", "SVG", "PDF"], screensCount: 0,
    componentsCount: 2400, version: "v5.0.0",
    supportsVariables: true, supportsAutoLayout: false, supportsLightDark: false,
    licenseType: "commercial",
    downloadsCount: 9840, viewsCount: 38200, rating: 4.9, reviewsCount: 573,
    downloadFileUrl: `${API_BASE}/products/p7/download`,
  },
  {
    id: "p8", slug: "device-studio-mockups",
    title: "Device Studio 3D Mockups",
    shortDescription: "50 premium 3D device mockups — iPhone, MacBook, iPad, iMac, and Android in realistic scenes.",
    fullDescription: "Device Studio gives you a professional library of 50 photorealistic 3D device mockups for presenting your UI work. Includes iPhone 15 Pro, MacBook Pro, iPad Pro, iMac, Apple Watch, and Samsung Galaxy — all in multiple angles and lighting setups. Drop your screens in as linked Figma frames and they render instantly. Perfectly sized for Dribbble shots, case studies, and client presentations.",
    price: 0, currency: "USD", isFree: true,
    thumbnail: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&h=560&fit=crop&auto=format",
    galleryImages: [
      "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&h=620&fit=crop&auto=format",
    ],
    categoryId: "icons-assets", subcategoryId: "device-mockups",
    tags: ["Mockups", "3D", "iPhone", "MacBook", "Presentation", "Portfolio"],
    fileSize: "43.2 MB", formats: ["Figma"], screensCount: 50,
    componentsCount: 50, version: "v1.1.0",
    supportsVariables: false, supportsAutoLayout: false, supportsLightDark: false,
    licenseType: "commercial",
    downloadsCount: 6130, viewsCount: 24700, rating: 4.7, reviewsCount: 298,
    downloadFileUrl: `${API_BASE}/products/p8/download`,
  },
  {
    id: "p9", slug: "shopflow-ecommerce-template",
    title: "ShopFlow E-Commerce Template",
    shortDescription: "Complete e-commerce Figma template — product listing, PDP, cart, checkout, account, and order tracking.",
    fullDescription: "ShopFlow is a complete, pixel-perfect e-commerce UI template covering every customer touchpoint. From homepage hero banners to post-purchase order tracking, ShopFlow includes 80 screens across the full shopping journey. Designed to convert: product listing pages with advanced filter UX, detailed product pages with image galleries, a streamlined multi-step checkout, and a comprehensive account area for order history and returns.",
    price: 0, currency: "USD", isFree: true,
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=560&fit=crop&auto=format",
    galleryImages: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&h=620&fit=crop&auto=format",
    ],
    categoryId: "templates", subcategoryId: "ecommerce",
    tags: ["E-Commerce", "Shop", "Product Page", "Checkout", "Cart", "Retail"],
    fileSize: "27.4 MB", formats: ["Figma"], screensCount: 80,
    componentsCount: 195, version: "v2.3.0",
    supportsVariables: true, supportsAutoLayout: true, supportsLightDark: true,
    licenseType: "commercial",
    downloadsCount: 3460, viewsCount: 13800, rating: 4.8, reviewsCount: 201,
    downloadFileUrl: `${API_BASE}/products/p9/download`,
  },
  {
    id: "p10", slug: "ux-audit-master-kit",
    title: "UX Audit Master Kit",
    shortDescription: "Free UX audit framework — heuristic checklists, severity rating matrix, and report templates.",
    fullDescription: "The UX Audit Master Kit is a free, professional-grade audit framework that helps designers and consultants evaluate any digital product quickly and systematically. Based on Nielsen's 10 Usability Heuristics, it includes a 120-point checklist, a severity rating matrix (0–4), finding documentation cards, and a presentation-ready report template. Great for freelancers onboarding new clients or in-house teams running quarterly product health checks.",
    price: 0, currency: "USD", isFree: true,
    thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=560&fit=crop&auto=format",
    galleryImages: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1509537257950-20f875b03669?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&h=620&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=620&fit=crop&auto=format",
    ],
    categoryId: "wireframes", subcategoryId: "ux-audit",
    tags: ["UX Audit", "Heuristics", "Free", "Checklist", "Accessibility", "Report Template"],
    fileSize: "5.3 MB", formats: ["Figma", "PDF"], screensCount: 22,
    componentsCount: 60, version: "v1.0.0",
    supportsVariables: false, supportsAutoLayout: true, supportsLightDark: false,
    licenseType: "personal",
    downloadsCount: 12400, viewsCount: 48600, rating: 4.8, reviewsCount: 619,
    downloadFileUrl: `${API_BASE}/products/p10/download`,
  },
];

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const handler = () => setY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return y;
}

function useCountUp(target: number, inView: boolean, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return count;
}

// ─── Custom Cursor ────────────────────────────────────────────────────────────

function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", move);

    let raf: number;
    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (dotRef.current) dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${ring.current.x - 20}px, ${ring.current.y - 20}px)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const grow = () => { ringRef.current?.classList.add("scale-150", "opacity-50"); };
    const shrink = () => { ringRef.current?.classList.remove("scale-150", "opacity-50"); };
    document.querySelectorAll("a,button,[data-cursor-grow]").forEach(el => {
      el.addEventListener("mouseenter", grow);
      el.addEventListener("mouseleave", shrink);
    });

    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dotRef} className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-[9999] hidden md:block transition-none" />
      <div ref={ringRef} className="fixed top-0 left-0 w-10 h-10 border border-primary/60 rounded-full pointer-events-none z-[9998] hidden md:block transition-transform duration-150" />
    </>
  );
}

// ─── Tilt Card ────────────────────────────────────────────────────────────────

function TiltCard({ children, className, onClick }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    setTilt({ x, y });
  }, []);

  const SLOW = "transform 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease";
  const FAST = "transform 0.1s ease, box-shadow 0.5s ease, border-color 0.5s ease";

  return (
    <div
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setActive(false); }}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: active ? FAST : SLOW,
      }}
    >
      {children}
    </div>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────

interface AuthModalProps {
  mode: "login" | "register";
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  onSwitchMode: (mode: "login" | "register") => void;
}

function AuthModal({ mode, onClose, onSuccess, onSwitchMode }: AuthModalProps) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatus("loading");
  setErrorMsg("");

  if (mode === "register" && form.password !== form.confirmPassword) {
    setErrorMsg("Passwords do not match.");
    setStatus("error");
    return;
  }

  try {
    if (mode === "register") {
      // تسجيل حساب جديد
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const newUser: AuthUser = {
          id: data.user.id,
          name: form.name || data.user.email?.split("@")[0] || "User",
          email: data.user.email || form.email,
          role: "user",
          purchases: [],
          wishlist: [],
          createdAt: new Date().toISOString(),
        };
        onSuccess(newUser);
      }
    } else {
      // تسجيل دخول
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;

      if (data.user) {
        const loggedUser: AuthUser = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
          email: data.user.email || form.email,
          role: "user",
          purchases: [],
          wishlist: [],
          createdAt: data.user.created_at || new Date().toISOString(),
        };
        onSuccess(loggedUser);
      }
    }
  } catch (err: any) {
    setErrorMsg(err.message || "Something went wrong. Please try again.");
    setStatus("error");
  } finally {
    setStatus("idle");
  }
};
  const inputClass = "w-full px-5 py-3.5 rounded-xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl">

          <button onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full border border-border hover:border-primary/40 hover:bg-primary/10 transition-all duration-200">
            <X size={15} />
          </button>

          {/* Logo */}
          <div className="text-3xl text-foreground leading-none mb-2" style={{ fontFamily: "'Cookie', cursive" }}>
            Layerat<span style={{ color: "#aaff38" }}>.</span>
          </div>
          <p className="text-xs text-muted-foreground mb-8 font-mono">Design Studio Marketplace</p>

          <h2 className="text-xl font-display font-bold text-foreground mb-6">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  placeholder="Your name" className={inputClass} />
              </div>
            )}

            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                placeholder="you@example.com" className={inputClass} />
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required
                placeholder="••••••••" minLength={6} className={inputClass} />
            </div>

            {mode === "register" && (
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Confirm Password</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required
                  placeholder="••••••••" className={inputClass} />
              </div>
            )}

            {status === "error" && errorMsg && (
              <div className="flex items-center gap-2 text-sm text-destructive-foreground bg-destructive/20 rounded-xl px-4 py-3">
                <AlertCircle size={14} />
                {errorMsg}
              </div>
            )}

            <button type="submit" disabled={status === "loading"}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_40px_rgba(170,255,56,0.25)] disabled:opacity-60 transition-all duration-300 mt-2">
              {status === "loading" ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                mode === "login" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? "New to Layerat?" : "Already have an account?"}{" "}
            <button onClick={() => onSwitchMode(mode === "login" ? "register" : "login")}
              className="text-primary font-semibold hover:underline">
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Gift Popup ───────────────────────────────────────────────────────────────

/*
 * Admin-configurable gift settings.
 * TODO: Replace with GET ${API_BASE}/admin/gift-config
 * resp: { productId, title, description, downloadUrl, fileName }
 * The backend should return a signed/time-limited download URL.
 */
const GIFT_CONFIG = {
  productId: "gift_layerat_starter_kit",
  title: "Free Figma Starter Kit",
  description: "50+ components · 3 themes · Variables-ready",
  downloadUrl: `${API_BASE}/gifts/layerat-starter-kit.fig`,
  fileName: "layerat-starter-kit.fig",
};

const GIFT_KEY = "ld_gift_popup";
const GIFT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface GiftPopupProps {
  authUser: AuthUser | null;
  onSuccess: (user: AuthUser) => void;
  scrollReady: boolean;
}

function GiftPopup({ authUser, onSuccess, scrollReady }: GiftPopupProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!scrollReady) return;
    if (authUser) return;

    const stored = localStorage.getItem(GIFT_KEY);
    if (stored) {
      const { ts, action } = JSON.parse(stored);
      if (action === "claimed") return;
      if (Date.now() - ts < GIFT_COOLDOWN_MS) return;
    }

    // Small delay for smooth UX after scroll trigger
    const timer = setTimeout(() => setVisible(true), 700);
    return () => clearTimeout(timer);
  }, [scrollReady, authUser]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(GIFT_KEY, JSON.stringify({ ts: Date.now(), action: "dismissed" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    try {
      /*
       * TODO: Replace simulation with real API call:
       * POST ${API_BASE}/auth/gift-register
       * body: { name, email }
       * resp: { user: AuthUser, token: string, downloadUrl: string }
       *
       * Backend should:
       *   1. Find or create user by email (auto-generate temp password, email it)
       *   2. Add GIFT_CONFIG.productId to user.purchases
       *   3. Return a signed, time-limited downloadUrl for the gift file
       */
      await new Promise(r => setTimeout(r, 1100));

      const giftUser: AuthUser = {
        id: `u_${Date.now()}`,
        name: name.trim() || email.split("@")[0],
        email: email.trim(),
        role: "user",
        purchases: [GIFT_CONFIG.productId],
        wishlist: [],
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("ld_token", "simulated_token_gift");
      localStorage.setItem("ld_user", JSON.stringify(giftUser));
      localStorage.setItem(GIFT_KEY, JSON.stringify({ ts: Date.now(), action: "claimed" }));

      onSuccess(giftUser);
      setStep("success");

      const a = document.createElement("a");
      a.href = GIFT_CONFIG.downloadUrl;
      a.download = GIFT_CONFIG.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => setVisible(false), 4500);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3.5 rounded-xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="gift-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col sm:flex-row"
          >
            {/* ── LEFT: Image panel ──────────────────────────────────────── */}
            <div className="relative sm:w-[42%] min-h-[220px] sm:min-h-[520px] overflow-hidden hidden sm:block">
              <img
                src="https://images.unsplash.com/photo-1637944059054-7091ca8efe14?w=600&q=80&fit=crop&crop=center"
                alt="Design workspace"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Overlay gradient so it blends into the card edge */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/20" />
              {/* Free gift badge pinned to bottom */}
              <div className="absolute bottom-5 left-5">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/15 rounded-full px-4 py-2">
                  <span className="text-base">🎁</span>
                  <span className="text-[11px] font-bold text-white tracking-widest uppercase">Free Gift</span>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Form panel ──────────────────────────────────────── */}
            <div className="flex-1 flex flex-col px-8 py-9 relative">
              {/* Dismiss */}
              <button
                onClick={handleDismiss}
                aria-label="Close"
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-border hover:border-primary/40 hover:bg-primary/8 transition-all duration-200"
              >
                <X size={14} className="text-muted-foreground" />
              </button>

              {step === "form" ? (
                <>
                  {/* Header */}
                  <div className="mb-7">
                    <h2 className="text-2xl font-display font-bold text-foreground leading-snug mb-3">
                      There's a free gift<br />waiting for you!
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Register with your email and get{" "}
                      <span className="font-semibold text-foreground">{GIFT_CONFIG.title}</span>{" "}
                      added to your library instantly — no credit card needed.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {GIFT_CONFIG.description.split(" · ").map(tag => (
                        <span key={tag} className="text-[11px] text-primary font-medium bg-primary/8 border border-primary/15 px-2.5 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1">
                    <div>
                      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5">Name</label>
                      <input
                        type="text"
                        placeholder="Your name (optional)"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-1.5">Email</label>
                      <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5">
                        <AlertCircle size={12} /> {error}
                      </p>
                    )}

                    <div className="mt-auto pt-5 space-y-3">
                      <button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                          <>
                            <Download size={15} />
                            Register &amp; Get the Gift
                          </>
                        )}
                      </button>

                      <p className="text-center text-[11px] text-muted-foreground/50">
                        No spam, ever. Unsubscribe at any time.
                      </p>
                    </div>
                  </form>
                </>
              ) : (
                /* Success */
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18 }}
                    className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center"
                  >
                    <CheckCircle size={32} className="text-accent" />
                  </motion.div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">You're all set! 🎉</h2>
                  <p className="text-sm text-muted-foreground mb-1">Your download has started automatically.</p>
                  <p className="text-xs text-muted-foreground/60">The kit has been added to your library.</p>
                  <div className="mt-7 flex items-center justify-center gap-2 text-xs text-muted-foreground/40">
                    <div className="w-3 h-3 border-2 border-muted-foreground/25 border-t-muted-foreground/60 rounded-full animate-spin" />
                    Closing in a moment…
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

interface NavbarProps {
  isDark: boolean;
  onToggle: () => void;
  page: Page;
  onNavigate: (p: Page) => void;
  authUser: AuthUser | null;
  onAuthOpen: (mode: "login" | "register") => void;
  onLogout: () => void;
  onSearch: (q: string) => void;
  wishlistCount: number;
}

function Navbar({ isDark, onToggle, page, onNavigate, authUser, onAuthOpen, onLogout, onSearch, wishlistCount }: NavbarProps) {
  const scrollY = useScrollY();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const solid = scrollY > 40 || menuOpen || searchOpen;

  const handleSearch = () => {
    if (searchVal.trim()) {
      onSearch(searchVal.trim());
      setSearchOpen(false);
      setSearchVal("");
      setMenuOpen(false);
    }
  };

  // Initials fallback for user avatar
  const initials = authUser
    ? authUser.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${solid ? "bg-background/90 backdrop-blur-xl border-b border-border" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 lg:px-10 flex items-center justify-between h-16 lg:h-20 gap-4">

        {/* Logo */}
        <button onClick={() => { onNavigate("home"); setMenuOpen(false); }}
          className="shrink-0 text-4xl text-foreground hover:opacity-80 transition-opacity leading-none"
          style={{ fontFamily: "'Cookie', cursive" }}>
          Layerat<span style={{ color: "#aaff38" }}>.</span>
        </button>

        {/* Desktop center nav */}
        <div className="hidden md:flex items-center gap-1">
          <button onClick={() => onNavigate("home")}
            className={`text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5 relative group ${page === "home" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
            Home
            <span className="absolute -bottom-0.5 left-3 right-3 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat.id}
              onClick={() => { onNavigate("browse"); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5 relative group">
              {cat.name.split(" ")[0]}
              <span className="absolute -bottom-0.5 left-3 right-3 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </button>
          ))}
          <button onClick={() => onNavigate("browse")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5">
            Browse All
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Search toggle (desktop) */}
          <div className="hidden md:block relative">
            <AnimatePresence>
              {searchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                  className="flex items-center overflow-hidden">
                  <div className="flex items-center border border-border rounded-xl bg-card overflow-hidden w-full">
                    <Search size={14} className="ml-3 text-muted-foreground shrink-0" />
                    <input autoFocus value={searchVal} onChange={e => setSearchVal(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSearch()}
                      placeholder="Search resources..."
                      className="flex-1 px-3 py-2 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none" />
                    <button onClick={() => setSearchOpen(false)}
                      className="mr-2 p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <button onClick={() => setSearchOpen(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-card hover:border-primary/50 hover:bg-primary/10 transition-all duration-300">
                  <Search size={16} className="text-muted-foreground" />
                </button>
              )}
            </AnimatePresence>
          </div>

          {/* Favorites */}
          <button onClick={() => onNavigate("favorites")}
            className={`relative w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${page === "favorites" ? "border-primary/50 bg-primary/10" : "border-border bg-card hover:border-primary/50 hover:bg-primary/10"}`}>
            <Heart size={16} className={page === "favorites" ? "text-primary fill-current" : "text-muted-foreground"} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button onClick={onToggle}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-card hover:border-primary/50 hover:bg-primary/10 transition-all duration-300">
            {isDark ? <Sun size={16} className="text-primary" /> : <Moon size={16} className="text-foreground" />}
          </button>

          {/* Auth / User */}
          {authUser ? (
            <div className="relative hidden md:block">
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 transition-all duration-200">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {initials}
                </div>
                <span className="text-sm font-medium text-foreground max-w-[80px] truncate">{authUser.name.split(" ")[0]}</span>
                <ChevronDown size={13} className={`text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground truncate">{authUser.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{authUser.email}</p>
                    </div>
                    {[
                      { icon: User, label: "Profile", action: () => { onNavigate("profile"); setProfileOpen(false); } },
                      { icon: Package, label: "My Library", action: () => { onNavigate("profile"); setProfileOpen(false); } },
                      { icon: Settings, label: "Settings", action: () => { onNavigate("profile"); setProfileOpen(false); } },
                    ].map(({ icon: Icon, label, action }) => (
                      <button key={label} onClick={action}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors">
                        <Icon size={14} />
                        {label}
                      </button>
                    ))}
                    <div className="border-t border-border">
                      <button onClick={() => { onLogout(); setProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors">
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => onAuthOpen("login")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full border border-border hover:border-primary/30 hover:bg-primary/5">
                Sign In
              </button>
              <button onClick={() => onAuthOpen("register")}
                className="text-sm font-semibold px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                Get Started
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className="md:hidden w-9 h-9 flex items-center justify-center" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-5 pb-6">

            {/* Mobile search */}
            <div className="py-4 border-b border-border/50">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-card">
                <Search size={16} className="text-muted-foreground shrink-0" />
                <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="Search resources..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none" />
              </div>
            </div>

            {/* Home + Categories */}
            <button onClick={() => { onNavigate("home"); setMenuOpen(false); }}
              className="flex items-center gap-3 w-full text-left py-3 text-base font-medium text-foreground border-b border-border/30 transition-colors">
              <Layout size={16} className="text-primary" />
              Home
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat.id}
                onClick={() => { onNavigate("browse"); setMenuOpen(false); }}
                className="flex items-center gap-3 w-full text-left py-3 text-base text-muted-foreground hover:text-foreground border-b border-border/30 last:border-0 transition-colors">
                <cat.icon size={16} style={{ color: cat.color }} />
                {cat.name}
              </button>
            ))}

            {/* Auth buttons */}
            {authUser ? (
              <div className="mt-4 space-y-2">
                <button onClick={() => { onNavigate("favorites"); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border border-border text-foreground text-sm font-medium hover:border-primary/40 transition-colors">
                  <Heart size={15} />
                  My Favorites
                  {wishlistCount > 0 && <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{wishlistCount}</span>}
                </button>
                <button onClick={() => { onNavigate("profile"); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border border-border text-foreground text-sm font-medium hover:border-primary/40 transition-colors">
                  <User size={15} /> My Profile
                </button>
                <button onClick={() => { onLogout(); setMenuOpen(false); }}
                  className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <button onClick={() => { onAuthOpen("register"); setMenuOpen(false); }}
                  className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm">
                  Get Started — It's Free
                </button>
                <button onClick={() => { onAuthOpen("login"); setMenuOpen(false); }}
                  className="w-full py-3 rounded-full border border-border text-foreground font-medium text-sm hover:border-primary/40 transition-colors">
                  Sign In
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ onSearch, onNavigate, onAuthOpen }: {
  onSearch: (q: string) => void;
  onNavigate: (p: Page) => void;
  onAuthOpen: (mode: "login" | "register") => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) onSearch(searchQuery.trim());
  };

  const quickCategories = ["UI Kits", "Landing Pages", "Wireframes", "Icons", "Design Systems"];

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full blur-[140px] bg-[#aaff38]/5 dark:bg-[#aaff38]/6" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-[#60a5fa]/4 dark:bg-[#60a5fa]/5" />
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] rounded-full blur-[100px] bg-[#aaff38]/3" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-6 items-center">
          <div>
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-mono font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              500+ Premium Figma Resources
            </motion.div>

            {/* Headline */}
            {["The Design", "Resource", "Marketplace."].map((word, i) => (
              <div key={word} className="overflow-hidden">
                <motion.h1
                  initial={{ y: 100 }} animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 * i }}
                  className={`text-6xl md:text-7xl lg:text-8xl font-display font-extrabold leading-[0.9] tracking-tight mb-1 ${i === 1 ? "text-primary" : "text-foreground"}`}>
                  {word}
                </motion.h1>
              </div>
            ))}

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
              className="text-muted-foreground text-lg max-w-lg leading-relaxed mt-6 mb-8">
              Premium UI kits, templates, design systems, and Figma resources — built by designers, for designers.
            </motion.p>

            {/* Search Bar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}
              className="relative max-w-lg">
              <div className="flex items-center bg-card border border-border rounded-2xl shadow-xl hover:border-primary/40 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
                <Search size={18} className="ml-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="Search UI kits, templates, icons..."
                  className="flex-1 px-4 py-4 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none text-base" />
                <button onClick={handleSearch}
                  className="mr-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity shrink-0">
                  Search
                </button>
              </div>

              {/* Quick category pills */}
              <div className="flex flex-wrap gap-2 mt-3">
                {quickCategories.map(cat => (
                  <button key={cat} onClick={() => { setSearchQuery(cat); onSearch(cat); }}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-200">
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* CTA row */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }}
              className="flex flex-wrap gap-4 mt-8">
              <button onClick={() => onNavigate("browse")}
                className="group flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-base hover:shadow-[0_0_40px_rgba(170,255,56,0.3)] transition-all duration-300">
                Browse All Resources
                <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button onClick={() => onAuthOpen("register")}
                className="group flex items-center gap-3 px-8 py-4 rounded-full border border-border bg-card text-foreground font-semibold text-base hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
                Join Free
                <Users size={16} />
              </button>
            </motion.div>
          </div>

          {/* Right: Floating product preview cards */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main preview card */}
              <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-3xl bg-gradient-to-br from-primary/20 via-card to-muted border border-primary/20 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&h=640&fit=crop&auto=format"
                  alt="Featured resource preview"
                  className="w-full h-full object-cover opacity-60"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs font-mono text-primary mb-1">FEATURED</p>
                  <p className="text-sm font-display font-bold text-foreground">Orbit SaaS UI Kit</p>
                </div>
              </div>

              {/* Floating stat badges */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -left-8 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <Star size={13} className="text-primary fill-primary" />
                  <span className="text-sm font-mono font-semibold text-foreground">4.9 Rating</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Community verified</p>
              </motion.div>

              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-6 -right-8 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <Download size={13} className="text-primary" />
                  <span className="text-sm font-mono font-semibold text-foreground">50K+</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Total downloads</p>
              </motion.div>

              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 -right-14 -translate-y-1/2 bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-xl">
                <div className="text-sm font-mono font-bold">500+</div>
                <div className="text-xs opacity-80">Resources</div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-muted-foreground/40 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-primary" />
          </motion.div>
          <span className="text-xs text-muted-foreground font-mono">scroll</span>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Marketplace Stats ────────────────────────────────────────────────────────

interface StatDef { value: number; suffix: string; prefix?: string; label: string; icon: React.ElementType; delay: number; }

function StatItem({ value, suffix, prefix, label, icon: Icon, inView, delay }: StatDef & { inView: boolean }) {
  const count = useCountUp(value, inView, 1600 + delay * 100);
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: delay * 0.1 }}
      className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-primary/5 transition-colors duration-300 group">
      <Icon size={20} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
      <div className="text-4xl lg:text-5xl font-display font-black text-foreground mb-1">
        {prefix}{count}{suffix}
      </div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </motion.div>
  );
}

function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const stats: StatDef[] = [
    { value: 500, suffix: "+", label: "Design Resources", icon: Package, delay: 0 },
    { value: 50, suffix: "K+", label: "Total Downloads", icon: Download, delay: 1 },
    { value: 12, suffix: "K+", label: "Active Designers", icon: Users, delay: 2 },
    { value: 98, suffix: "%", label: "Satisfaction Rate", icon: Award, delay: 3 },
  ];
  return (
    <section ref={ref} className="py-20 border-y border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map(s => <StatItem key={s.label} {...s} inView={inView} />)}
        </div>
      </div>
      {/* Sentinel: gift popup watches this to know user scrolled past section 2 */}
      <div id="gift-sentinel" aria-hidden="true" />
    </section>
  );
}

// ─── Categories Section ───────────────────────────────────────────────────────

function CategoriesSection({ onCategoryClick }: { onCategoryClick: (cat: Category) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="categories" ref={ref} className="py-24 lg:py-32 bg-muted/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
          className="text-center mb-16">
          <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">Browse By Category</span>
          <h2 className="mt-4 text-4xl lg:text-5xl font-display font-extrabold text-foreground">
            What are you building?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Every resource is crafted by professional UX/UI designers and organized for fast discovery.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat, i) => (
            <motion.button key={cat.id}
              initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onClick={() => onCategoryClick(cat)}
              className="group p-6 rounded-3xl border border-border bg-card text-left hover:border-primary/40 hover:shadow-[0_8px_40px_rgba(0,0,0,0.07)] dark:hover:shadow-[0_0_60px_rgba(170,255,56,0.06)] transition-all duration-500 relative overflow-hidden">
              {/* Glow bg */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse at top left, ${cat.color}08 0%, transparent 70%)` }} />

              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300"
                  style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}30` }}>
                  <cat.icon size={22} style={{ color: cat.color }} className="group-hover:scale-110 transition-transform duration-300" />
                </div>

                <h3 className="text-lg font-display font-bold text-foreground mb-2">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {cat.subcategories.length} subcategories
                </p>

                <div className="space-y-1">
                  {cat.subcategories.slice(0, 3).map(sub => (
                    <div key={sub.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                      {sub.name}
                    </div>
                  ))}
                  {cat.subcategories.length > 3 && (
                    <div className="text-xs text-primary font-mono">+{cat.subcategories.length - 3} more</div>
                  )}
                </div>

                <div className="mt-5 flex items-center gap-1.5 text-xs font-medium" style={{ color: cat.color }}>
                  Explore <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)` }} />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ images, startIndex, onClose }: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent(c => (c + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrent(c => (c - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  const prev = () => setCurrent(c => (c - 1 + images.length) % images.length);
  const next = () => setCurrent(c => (c + 1) % images.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[300] flex flex-col bg-black/96 backdrop-blur-2xl"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <span className="text-xs font-mono text-white/40 tracking-widest">
          {String(current + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </span>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center border border-white/15 bg-white/5 hover:bg-white/15 transition-all duration-200 group"
        >
          <X size={17} className="text-white/70 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Main image area */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden px-16 py-6"
        onClick={e => e.stopPropagation()}
      >
        {images.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-4 w-11 h-11 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all duration-200 z-10"
          >
            <ChevronLeft size={20} className="text-white/70" />
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current]}
            alt={`Preview ${current + 1}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.18 }}
            className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
            style={{ maxHeight: "calc(100vh - 160px)" }}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <button
            onClick={next}
            className="absolute right-4 w-11 h-11 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all duration-200 z-10"
          >
            <ChevronRight size={20} className="text-white/70" />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 py-4 px-6 border-t border-white/10 shrink-0 overflow-x-auto"
          onClick={e => e.stopPropagation()}
        >
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative rounded-lg overflow-hidden shrink-0 transition-all duration-200 ${
                i === current
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-black opacity-100 scale-105"
                  : "opacity-40 hover:opacity-80 scale-100"
              }`}
              style={{ width: 64, height: 44 }}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onProductClick, authUser, onWishlistToggle, onAuthOpen }: {
  product: Product;
  onProductClick: (p: Product) => void;
  authUser: AuthUser | null;
  onWishlistToggle: (productId: string) => void;
  onAuthOpen: (mode: "login" | "register") => void;
}) {
  const [hovered, setHovered] = useState(false);

  const isInWishlist = authUser?.wishlist.includes(product.id) ?? false;

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!authUser) { onAuthOpen("login"); return; }
    onWishlistToggle(product.id);
  };

  const displayPrice = product.isFree
    ? "Free"
    : product.discountPrice
      ? `$${product.discountPrice}`
      : `$${product.price}`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onProductClick(product)}
      className="group relative rounded-3xl overflow-hidden border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] cursor-pointer">

      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <img src={product.thumbnail} alt={product.title} loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent dark:from-black/70 dark:via-black/20 pointer-events-none" />

        {/* Price badge */}
        <div className="absolute top-3 left-3">
          {product.isFree ? (
            <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">Free</span>
          ) : product.discountPrice ? (
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">${product.discountPrice}</span>
              <span className="px-2 py-1 rounded-full bg-black/50 text-white text-xs line-through opacity-70">${product.price}</span>
            </div>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-bold">${product.price}</span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${isInWishlist ? "bg-[#1a4d22] text-white dark:bg-[#aaff38] dark:text-[#0F0039]" : "bg-black/40 text-white hover:bg-black/60"}`}>
          <Heart size={14} className={isInWishlist ? "fill-current" : ""} />
        </button>

        {/* Hover glow — pointer-events-none so it never blocks the heart button */}
        <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${hovered ? "opacity-100" : "opacity-0"}`}
          style={{ background: "linear-gradient(135deg, rgba(82,51,253,0.08) 0%, transparent 60%)" }} />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category + arrow */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {CATEGORIES.find(c => c.id === product.categoryId)?.subcategories.find(s => s.id === product.subcategoryId)?.name
              ?? CATEGORIES.find(c => c.id === product.categoryId)?.name}
          </span>
          <ArrowUpRight size={16} className={`text-primary transition-all duration-300 ${hovered ? "opacity-100 translate-x-0.5 -translate-y-0.5" : "opacity-0"}`} />
        </div>

        <h3 className="text-base font-display font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors duration-300 line-clamp-1">
          {product.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">{product.shortDescription}</p>

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star size={11} className="text-primary fill-primary" />
            <span className="font-mono font-medium text-foreground">{product.rating.toFixed(1)}</span>
            <span>({product.reviewsCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download size={11} />
            <span>{product.downloadsCount >= 1000 ? `${(product.downloadsCount / 1000).toFixed(1)}k` : product.downloadsCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield size={11} />
            <span className="capitalize">{product.licenseType}</span>
          </div>
        </div>

        {/* Figma feature badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {product.supportsVariables && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Variables</span>
          )}
          {product.supportsAutoLayout && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Auto Layout</span>
          )}
          {product.supportsLightDark && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Light/Dark</span>
          )}
        </div>
      </div>

      {/* Bottom accent */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-opacity duration-500 ${hovered ? "opacity-100" : "opacity-0"}`}
        style={{ background: "linear-gradient(90deg, transparent, #aaff38, transparent)" }} />
    </div>
  );
}

// ─── Featured Products ────────────────────────────────────────────────────────

function FeaturedProducts({ products, onProductClick, onNavigate, authUser, onWishlistToggle, onAuthOpen }: {
  products: Product[];
  
  onProductClick: (p: Product) => void;
  onNavigate: (p: Page) => void;
  authUser: AuthUser | null;
  onWishlistToggle: (id: string) => void;
  onAuthOpen: (mode: "login" | "register") => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  // TODO: Replace with GET ${API_BASE}/products/featured
  const featured = products.slice(0, 6);

  return (
    <section id="featured" ref={ref} className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div>
            <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">Top Picks</span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-display font-extrabold text-foreground">Featured Resources</h2>
          </div>
          <button onClick={() => onNavigate("browse")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group shrink-0">
            View all resources
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}>
              <ProductCard
                product={product}
                onProductClick={onProductClick}
                authUser={authUser}
                onWishlistToggle={onWishlistToggle}
                onAuthOpen={onAuthOpen}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const steps = [
    {
      icon: Search, step: "01",
      title: "Browse & Discover",
      desc: "Explore 500+ curated Figma resources across UI kits, templates, wireframes, and icon packs — all categorized for fast discovery.",
    },
    {
      icon: Download, step: "02",
      title: "Get Your Resource",
      desc: "Download free resources instantly or purchase premium kits with secure checkout. Your library is always one click away.",
    },
    {
      icon: Zap, step: "03",
      title: "Customize & Ship",
      desc: "Open directly in Figma, swap tokens, adapt components, and ship your design faster than ever before.",
    },
  ];

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
          className="text-center mb-16">
          <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">How It Works</span>
          <h2 className="mt-4 text-4xl lg:text-5xl font-display font-extrabold text-foreground">
            From browse to done in minutes
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(({ icon: Icon, step, title, desc }, i) => (
            <TiltCard key={step} className="group rounded-3xl border border-border bg-card hover:border-primary/40 hover:shadow-[0_6px_32px_rgba(0,0,0,0.07)] dark:hover:shadow-[0_0_60px_rgba(82,51,253,0.12)] relative overflow-hidden">
              <motion.div initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="p-8">
                <div className="absolute top-4 right-5 text-6xl font-display font-black text-foreground/5 select-none">{step}</div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                  <Icon size={20} className="text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Product Detail Page ──────────────────────────────────────────────────────

function ProductDetail({ product, onBack, authUser, onAuthOpen, onWishlistToggle }: {
  product: Product;
  onBack: () => void;
  authUser: AuthUser | null;
  onAuthOpen: (mode: "login" | "register") => void;
  onWishlistToggle: (id: string) => void;
}) {
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "loading" | "success">("idle");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isOwned = authUser?.purchases.includes(product.id) ?? false;
  const isInWishlist = authUser?.wishlist.includes(product.id) ?? false;

  useEffect(() => {
    /*
     * Track product view – call on mount
     * POST ${API_BASE}/products/${product.id}/view
     */
    // fetch(`${API_BASE}/products/${product.id}/view`, { method: "POST" }).catch(() => {});
  }, [product.id]);

  const handleGetResource = async () => {
    if (!authUser) { onAuthOpen("login"); return; }

    if (product.isFree || isOwned) {
      setDownloadStatus("loading");
      try {
        /*
         * GET ${API_BASE}/products/${product.id}/download
         * Backend returns a signed, time-limited URL to the actual file.
         * The file should be served from S3 or a CDN with CORS headers.
         */
        await new Promise(r => setTimeout(r, 1200)); // remove when API is ready
        setDownloadStatus("success");
        setTimeout(() => setDownloadStatus("idle"), 3000);
      } catch {
        setDownloadStatus("idle");
      }
      return;
    }

    /*
     * Paid product – initiate purchase flow:
     * POST ${API_BASE}/purchases  body: { productId: product.id }
     * Backend returns { clientSecret } → pass to Stripe.js confirmPayment()
     * On success, add product.id to authUser.purchases
     */
    alert(`Purchase flow: integrate Stripe here for $${product.price}`);
  };

  const category = CATEGORIES.find(c => c.id === product.categoryId);
  const subcategory = category?.subcategories.find(s => s.id === product.subcategoryId);

  const specs = [
    { label: "File Size", value: product.fileSize },
    { label: "Formats", value: product.formats.join(", ") },
    { label: "Screens", value: product.screensCount > 0 ? `${product.screensCount}+` : "N/A" },
    { label: "Components", value: `${product.componentsCount}+` },
    { label: "Version", value: product.version },
    { label: "License", value: product.licenseType === "commercial" ? "Commercial" : "Personal" },
  ];

  const figmaFeatures = [
    { label: "Figma Variables", supported: product.supportsVariables },
    { label: "Auto Layout", supported: product.supportsAutoLayout },
    { label: "Light & Dark Mode", supported: product.supportsLightDark },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px] bg-primary/6" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-8 pt-28 lg:pt-32 pb-20">

        {/* Back */}
        <button onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to marketplace
        </button>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-8 items-start">

          {/* ── LEFT: scrollable content ─────────────────────────────── */}
          <div className="min-w-0">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

              {/* Category badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {category && (
                  <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">{category.name}</span>
                )}
                {subcategory && (
                  <span className="text-xs font-mono px-3 py-1.5 rounded-full border border-border text-muted-foreground">{subcategory.name}</span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-5xl font-display font-extrabold text-foreground leading-tight mb-4">
                {product.title}
              </h1>

              {/* Description */}
              <p className="text-base text-muted-foreground leading-relaxed mb-6">{product.fullDescription}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-5 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1.5">
                  <Star size={13} className="text-primary fill-primary" />
                  <span className="font-mono font-bold text-foreground">{product.rating.toFixed(1)}</span>
                  <span>({product.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Download size={13} />
                  <span className="font-mono font-bold text-foreground">{product.downloadsCount.toLocaleString()}</span> downloads
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye size={13} />
                  <span className="font-mono font-bold text-foreground">{product.viewsCount.toLocaleString()}</span> views
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap pb-8 border-b border-border mb-10">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest shrink-0">Tags ·</span>
                {product.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full border border-primary/20 bg-primary/10 text-primary">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Gallery */}
              <h2 className="text-xl font-display font-bold text-foreground mb-6">Preview Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {product.galleryImages.map((src, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.45, delay: (i % 2) * 0.08 }}
                    className="group relative rounded-2xl overflow-hidden border border-border bg-card aspect-[3/2] cursor-zoom-in"
                    onClick={() => setLightboxIndex(i)}
                  >
                    <img src={src} alt={`${product.title} preview ${i + 1}`} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <ArrowUpRight size={16} className="text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      {String(i + 1).padStart(2, "0")} / {String(product.galleryImages.length).padStart(2, "0")}
                    </div>
                  </motion.div>
                ))}
              </div>

            </motion.div>
          </div>

          {/* ── RIGHT: sticky purchase card ──────────────────────────── */}
          {/* Sticky must be on a plain div — motion.div transform breaks position:sticky */}
          <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-104px)] lg:overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="p-6 rounded-3xl border border-border bg-card shadow-xl">

              {/* Price */}
              <div className="mb-5">
                {product.isFree ? (
                  <div className="text-4xl font-display font-black text-primary">Free</div>
                ) : (
                  <div className="flex items-baseline gap-3">
                    <div className="text-4xl font-display font-black text-foreground">
                      ${product.discountPrice ?? product.price}
                    </div>
                    {product.discountPrice && (
                      <div className="text-xl text-muted-foreground line-through">${product.price}</div>
                    )}
                  </div>
                )}
                {product.discountPrice && (
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-full mt-2 inline-block">
                    Save ${product.price - product.discountPrice}
                  </span>
                )}
              </div>

              {/* Primary CTA */}
              <button onClick={handleGetResource}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 disabled:opacity-60 transition-all duration-300 mb-3">
                {downloadStatus === "loading" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Preparing download...
                  </span>
                ) : downloadStatus === "success" ? (
                  <span className="flex items-center gap-2"><CheckCircle size={16} /> Downloaded!</span>
                ) : isOwned ? (
                  <span className="flex items-center gap-2"><Download size={16} /> Download Again</span>
                ) : product.isFree ? (
                  <span className="flex items-center gap-2"><Download size={16} /> Download Free</span>
                ) : (
                  <span className="flex items-center gap-2"><Check size={16} /> Get for ${product.discountPrice ?? product.price}</span>
                )}
              </button>

              {/* Save + Preview */}
              <div className="flex gap-2">
                <button
                  onClick={() => { if (!authUser) { onAuthOpen("login"); return; } onWishlistToggle(product.id); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                    isInWishlist
                      ? "border-[#1a4d22] bg-[#1a4d22] text-white dark:border-[#aaff38] dark:bg-[#aaff38] dark:text-[#0F0039]"
                      : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                  }`}>
                  <Heart size={14} className={isInWishlist ? "fill-current" : ""} />
                  {isInWishlist ? "Saved" : "Save"}
                </button>
                {product.figmaPreviewUrl && (
                  <a href={product.figmaPreviewUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all duration-200">
                    <ExternalLink size={14} />
                    Preview
                  </a>
                )}
              </div>

              {/* Specs */}
              <div className="mt-5 pt-5 border-t border-border space-y-3">
                {specs.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-mono text-foreground font-medium">{value}</span>
                  </div>
                ))}
              </div>

              {/* Figma features */}
              <div className="mt-5 pt-5 border-t border-border">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Figma Features</p>
                <div className="space-y-2">
                  {figmaFeatures.map(({ label, supported }) => (
                    <div key={label} className="flex items-center gap-2 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${supported ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {supported ? <Check size={11} /> : <Minus size={11} />}
                      </div>
                      <span className={supported ? "text-foreground" : "text-muted-foreground line-through"}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* License */}
              <p className="text-xs text-muted-foreground mt-4 flex items-start gap-2">
                <Shield size={12} className="text-primary shrink-0 mt-0.5" />
                {product.licenseType === "commercial"
                  ? "Commercial license — use in client & commercial projects."
                  : "Personal license — for personal & portfolio use only."}
              </p>
            </div>
          </motion.div>
          </div>

        </div>
      </div>

      {/* ── Full-width CTA section (before footer) ── */}
      <section className="relative w-full border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full blur-[120px] bg-primary/8" />
        </div>
        <div className="relative z-10 py-24 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}>
            <h2 className="text-3xl lg:text-5xl font-display font-extrabold text-foreground mb-4">
              Ready to use it?
            </h2>
            <p className="text-muted-foreground mb-10 text-base max-w-md mx-auto">
              {product.isFree
                ? "Download free and start designing today."
                : "One-time purchase — yours forever. No subscription needed."}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleGetResource}
                className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all duration-300 shadow-[0_0_32px_rgba(82,51,253,0.2)]">
                {product.isFree
                  ? <><Download size={17} /> Download Free</>
                  : <><Check size={17} /> Get for ${product.discountPrice ?? product.price}</>}
              </button>
              <button onClick={onBack}
                className="flex items-center gap-2.5 px-8 py-4 rounded-full border border-border bg-card text-foreground font-semibold text-base hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
                Browse more
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={product.galleryImages}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Browse Page ──────────────────────────────────────────────────────────────

function BrowsePage({ initialFilters, onProductClick, authUser, onWishlistToggle, onAuthOpen }: {
  initialFilters?: Partial<BrowseFilters>;
  onProductClick: (p: Product) => void;
  authUser: AuthUser | null;
  onWishlistToggle: (id: string) => void;
  onAuthOpen: (mode: "login" | "register") => void;
}) {
  const [filters, setFilters] = useState<BrowseFilters>({
    query: initialFilters?.query ?? "",
    categoryId: initialFilters?.categoryId ?? null,
    subcategoryId: initialFilters?.subcategoryId ?? null,
    isFree: initialFilters?.isFree ?? null,
    sortBy: "newest",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState<string[]>(["ui-kits"]);

  // Update filters when initialFilters change (e.g., search from hero)
  useEffect(() => {
    if (initialFilters) {
      setFilters(f => ({ ...f, ...initialFilters }));
    }
  }, [initialFilters?.query, initialFilters?.categoryId]);

  const toggleCatExpand = (catId: string) => {
    setExpandedCats(e => e.includes(catId) ? e.filter(c => c !== catId) : [...e, catId]);
  };

  // Client-side filter + sort
  // TODO: Replace with GET ${API_BASE}/products?q=&category=&subcategory=&isFree=&sort=&page=&limit=
  const filtered = useMemo(() => {
    return PRODUCTS.filter(p => {
      if (filters.categoryId && p.categoryId !== filters.categoryId) return false;
      if (filters.subcategoryId && p.subcategoryId !== filters.subcategoryId) return false;
      if (filters.isFree !== null && p.isFree !== filters.isFree) return false;
      if (filters.query) {
        const q = filters.query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q)) ||
          CATEGORIES.find(c => c.id === p.categoryId)?.name.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case "downloads": return b.downloadsCount - a.downloadsCount;
        case "rating": return b.rating - a.rating;
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        default: return parseInt(b.id.slice(1)) - parseInt(a.id.slice(1)); // newest by id
      }
    });
  }, [filters]);

  const Sidebar = () => (
    <div className="space-y-6">
      {/* Price filter */}
      <div>
        <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Price</h4>
        <div className="space-y-1">
          {[{ label: "All", value: null }, { label: "Free", value: true }, { label: "Paid", value: false }].map(opt => (
            <button key={opt.label}
              onClick={() => setFilters(f => ({ ...f, isFree: opt.value }))}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${filters.isFree === opt.value ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
              {opt.label}
              {filters.isFree === opt.value && <Check size={13} />}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div>
        <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Category</h4>
        <div className="space-y-1">
          {/* All */}
          <button
            onClick={() => setFilters(f => ({ ...f, categoryId: null, subcategoryId: null }))}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${!filters.categoryId ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            All Categories
            {!filters.categoryId && <Check size={13} />}
          </button>

          {CATEGORIES.map(cat => (
            <div key={cat.id}>
              <button
                onClick={() => {
                  setFilters(f => ({ ...f, categoryId: cat.id, subcategoryId: null }));
                  toggleCatExpand(cat.id);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${filters.categoryId === cat.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                <cat.icon size={14} style={{ color: cat.color }} />
                <span className="flex-1 text-left truncate">{cat.name}</span>
                <ChevronDown size={13} className={`transition-transform ${expandedCats.includes(cat.id) ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {expandedCats.includes(cat.id) && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                    className="overflow-hidden pl-4">
                    {cat.subcategories.map(sub => (
                      <button key={sub.id}
                        onClick={() => setFilters(f => ({ ...f, categoryId: cat.id, subcategoryId: sub.id }))}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors ${filters.subcategoryId === sub.id ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
                        <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                        {sub.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {(filters.categoryId || filters.subcategoryId || filters.isFree !== null || filters.query) && (
        <button
          onClick={() => setFilters({ query: "", categoryId: null, subcategoryId: null, isFree: null, sortBy: "newest" })}
          className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="min-h-screen pt-20 lg:pt-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-10 lg:py-14">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-foreground mb-2">
            {filters.query ? `Search: "${filters.query}"` : "Browse Resources"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {filtered.length} resource{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          {/* Mobile filter toggle */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground hover:border-primary/40 transition-colors">
            <Filter size={14} />
            Filters
            {(filters.categoryId || filters.isFree !== null) && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                {[filters.categoryId, filters.isFree !== null].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Search bar */}
          <div className="flex-1 min-w-[200px] max-w-md flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card focus-within:border-primary/40 transition-colors">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              value={filters.query}
              onChange={e => setFilters(f => ({ ...f, query: e.target.value }))}
              placeholder="Search resources..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none" />
            {filters.query && (
              <button onClick={() => setFilters(f => ({ ...f, query: "" }))}
                className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value as BrowseFilters["sortBy"] }))}
            className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary/40 transition-colors cursor-pointer">
            <option value="newest">Newest First</option>
            <option value="downloads">Most Downloaded</option>
            <option value="rating">Highest Rated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)} />
              <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 p-6 overflow-y-auto lg:hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-bold text-foreground">Filters</h3>
                  <button onClick={() => setSidebarOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:border-primary/40 transition-colors">
                    <X size={14} />
                  </button>
                </div>
                <Sidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main layout */}
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-28">
              <Sidebar />
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4 opacity-20">🔍</div>
                <h3 className="text-xl font-display font-bold text-foreground mb-2">No resources found</h3>
                <p className="text-muted-foreground text-sm">Try a different search term or adjust the filters.</p>
                <button
                  onClick={() => setFilters({ query: "", categoryId: null, subcategoryId: null, isFree: null, sortBy: "newest" })}
                  className="mt-6 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((product, i) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}>
                    <ProductCard
                      product={product}
                      onProductClick={onProductClick}
                      authUser={authUser}
                      onWishlistToggle={onWishlistToggle}
                      onAuthOpen={onAuthOpen}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

function ProfilePage({ authUser, onUpdate, onLogout, onProductClick }: {
  authUser: AuthUser;
  onUpdate: (updated: Partial<AuthUser>) => void;
  onLogout: () => void;
  onProductClick: (p: Product) => void;
}) {
  const [activeTab, setActiveTab] = useState<"account" | "library" | "wishlist" | "settings">("account");
  const [profileForm, setProfileForm] = useState({
    name: authUser.name,
    email: authUser.email,
    bio: authUser.bio ?? "",
    website: authUser.website ?? "",
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Products the user owns or has in wishlist (lookup from mock data)
  // TODO: GET ${API_BASE}/purchases  + GET ${API_BASE}/wishlist  (headers: Bearer token)
  const libraryProducts = PRODUCTS.filter(p => authUser.purchases.includes(p.id) || p.isFree);
  const wishlistProducts = PRODUCTS.filter(p => authUser.wishlist.includes(p.id));

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    try {
      /*
       * PUT ${API_BASE}/auth/profile
       * body: { name, bio, website }
       * header: Authorization: Bearer <token>
       */
      await new Promise(r => setTimeout(r, 900));
      onUpdate({ name: profileForm.name, bio: profileForm.bio, website: profileForm.website });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { setPwStatus("error"); return; }
    setPwStatus("saving");
    try {
      /*
       * POST ${API_BASE}/auth/password
       * body: { currentPassword: pwForm.current, newPassword: pwForm.next }
       * header: Authorization: Bearer <token>
       */
      await new Promise(r => setTimeout(r, 900));
      setPwStatus("saved");
      setPwForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwStatus("idle"), 2500);
    } catch {
      setPwStatus("error");
    }
  };

  const inputClass = "w-full px-5 py-3.5 rounded-xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";
  const initials = authUser.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const tabs: { id: typeof activeTab; label: string; icon: React.ElementType }[] = [
    { id: "account", label: "Account", icon: User },
    { id: "library", label: "Library", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="min-h-screen pt-20 lg:pt-24">
      <div className="max-w-5xl mx-auto px-4 lg:px-10 py-10 lg:py-14">

        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 pb-10 border-b border-border">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-2xl font-display font-black text-primary-foreground shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-extrabold text-foreground">{authUser.name}</h1>
            <p className="text-muted-foreground text-sm">{authUser.email}</p>
            {authUser.bio && <p className="text-sm text-foreground mt-1">{authUser.bio}</p>}
          </div>
          <button onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === id ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
              <Icon size={15} />
              {label}
              {id === "library" && <span className="text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-mono">{libraryProducts.length}</span>}
              {id === "wishlist" && wishlistProducts.length > 0 && <span className="text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-mono">{wishlistProducts.length}</span>}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">

          {/* Account tab */}
          {activeTab === "account" && (
            <motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              <form onSubmit={handleProfileSave} className="max-w-lg space-y-5">
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Full Name</label>
                  <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} required className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Email</label>
                  <input value={profileForm.email} type="email" disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
                  <p className="text-xs text-muted-foreground mt-1.5">Email changes require verification. Contact support.</p>
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Bio</label>
                  <textarea value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                    rows={3} placeholder="Tell the community about yourself..."
                    className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Website</label>
                  <input value={profileForm.website} onChange={e => setProfileForm(f => ({ ...f, website: e.target.value }))}
                    type="url" placeholder="https://yoursite.com" className={inputClass} />
                </div>
                <button type="submit" disabled={saveStatus === "saving"}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.2)] disabled:opacity-60 transition-all duration-300">
                  {saveStatus === "saving" ? (
                    <><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Saving...</>
                  ) : saveStatus === "saved" ? (
                    <><CheckCircle size={15} /> Saved!</>
                  ) : "Save Changes"}
                </button>
              </form>
            </motion.div>
          )}

          {/* Library tab */}
          {activeTab === "library" && (
            <motion.div key="library" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              {libraryProducts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Package size={40} className="mx-auto mb-4 opacity-30" />
                  <p className="font-semibold text-foreground mb-1">Your library is empty</p>
                  <p className="text-sm">Download free resources or purchase premium kits to find them here.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {libraryProducts.map(p => (
                    <div key={p.id} onClick={() => onProductClick(p)}
                      className="group cursor-pointer flex gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all duration-200">
                      <img src={p.thumbnail} alt={p.title} loading="lazy"
                        className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-display font-bold text-foreground group-hover:text-primary transition-colors truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.shortDescription}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {p.isFree ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">Free</span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">Purchased</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Wishlist tab */}
          {activeTab === "wishlist" && (
            <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Heart size={40} className="mx-auto mb-4 opacity-30" />
                  <p className="font-semibold text-foreground mb-1">Nothing saved yet</p>
                  <p className="text-sm">Tap the heart icon on any resource to save it here.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {wishlistProducts.map(p => (
                    <div key={p.id} onClick={() => onProductClick(p)}
                      className="group cursor-pointer flex gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all duration-200">
                      <img src={p.thumbnail} alt={p.title} loading="lazy"
                        className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-display font-bold text-foreground group-hover:text-primary transition-colors truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.isFree ? "Free" : `$${p.discountPrice ?? p.price}`}</p>
                        <div className="flex items-center gap-0.5 mt-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={10} className={i < Math.round(p.rating) ? "text-primary fill-primary" : "text-border"} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Settings tab */}
          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              <div className="max-w-lg space-y-8">

                {/* Change password */}
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground mb-5">Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Current Password</label>
                      <input type="password" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} required className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">New Password</label>
                      <input type="password" value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} required minLength={6} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Confirm New Password</label>
                      <input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required className={inputClass} />
                    </div>
                    {pwStatus === "error" && (
                      <p className="text-sm text-destructive-foreground bg-destructive/20 rounded-xl px-4 py-3 flex items-center gap-2">
                        <AlertCircle size={14} /> Passwords do not match or current password is wrong.
                      </p>
                    )}
                    <button type="submit" disabled={pwStatus === "saving"}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all duration-300">
                      {pwStatus === "saving" ? "Updating..." : pwStatus === "saved" ? <><CheckCircle size={15} /> Updated!</> : "Update Password"}
                    </button>
                  </form>
                </div>

                {/* Notifications */}
                <div className="pt-6 border-t border-border">
                  <h3 className="text-lg font-display font-bold text-foreground mb-4">Notifications</h3>
                  {/* TODO: GET/PUT ${API_BASE}/auth/notifications-preferences */}
                  {[
                    { label: "New resources in saved categories", sub: "Get notified when new items are added" },
                    { label: "Promotions & discounts", sub: "Sales, limited offers, and bundles" },
                    { label: "Purchase confirmations", sub: "Email receipt after every purchase" },
                  ].map(({ label, sub }) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-4 border-b border-border/50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                      </div>
                      {/* Toggle – wire to backend preference update */}
                      <button className="w-11 h-6 bg-primary rounded-full relative transition-colors shrink-0">
                        <span className="absolute right-1 top-1 w-4 h-4 bg-primary-foreground rounded-full" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Danger zone */}
                <div className="pt-6 border-t border-border">
                  <h3 className="text-lg font-display font-bold text-destructive mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">Deleting your account is permanent and cannot be undone.</p>
                  {/* TODO: DELETE ${API_BASE}/auth/account (requires password confirmation) */}
                  <button className="px-5 py-2.5 rounded-xl border border-destructive/30 text-destructive-foreground bg-destructive/10 text-sm font-medium hover:bg-destructive/20 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Publisher Page ───────────────────────────────────────────────────────────

function PublisherPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const [form, setForm] = useState({
    name: "", email: "", portfolio: "", social: "",
    experience: "", categories: [] as string[], message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const toggleCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      /*
       * TODO: POST ${API_BASE}/publisher-applications
       * body: { name, email, portfolio, social, experience, categories, message }
       * resp: { applicationId, status: "pending" }
       * Send confirmation email via backend on success
       */
      await new Promise(r => setTimeout(r, 1400));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const benefits = [
    {
      icon: Download,
      title: "Global Reach",
      desc: "Put your resources in front of 12,000+ active UX/UI designers worldwide. Your work ships without borders.",
      color: "#aaff38",
    },
    {
      icon: Zap,
      title: "Instant Publishing",
      desc: "Upload once, we handle delivery, hosting, and distribution. Focus on creating — we handle the rest.",
      color: "#60a5fa",
    },
    {
      icon: Award,
      title: "Community Recognition",
      desc: "Get featured, reviewed, and recommended by a community of professionals who actually use your work.",
      color: "#f59e0b",
    },
    {
      icon: Globe,
      title: "Your Own Storefront",
      desc: "A dedicated publisher profile page showcasing all your resources and building your personal brand.",
      color: "#c084fc",
    },
  ];

  const steps = [
    {
      n: "01", title: "Apply with Your Portfolio",
      desc: "Fill out the form below with links to your best Figma work. We look for quality, consistency, and a clear design voice.",
    },
    {
      n: "02", title: "We Review Within 48 Hours",
      desc: "Our curation team reviews every application personally. You'll hear back with feedback regardless of the outcome.",
    },
    {
      n: "03", title: "Start Publishing",
      desc: "Once approved, get access to the publisher dashboard and start uploading your first resource today.",
    },
  ];

  const resourceCategories = ["UI Kits", "Landing Page Templates", "Design Systems", "Wireframe Kits", "Icon Packs", "Device Mockups", "UX Flow Diagrams", "3D Assets"];

  const inputClass = "w-full px-5 py-3.5 rounded-xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="min-h-screen pt-20">

      {/* Hero */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[140px] bg-[#aaff38]/5 dark:bg-[#aaff38]/6" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-mono font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Now Accepting Publisher Applications
          </motion.div>

          {["Publish Your", "Designs.", "Reach Thousands."].map((line, i) => (
            <div key={line} className="overflow-hidden">
              <motion.h1
                initial={{ y: 100 }} animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 * i }}
                className={`text-5xl md:text-7xl lg:text-8xl font-display font-extrabold leading-[0.92] tracking-tight ${i === 1 ? "text-primary" : "text-foreground"}`}>
                {line}
              </motion.h1>
            </div>
          ))}

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join Layerat as a publisher and put your Figma resources — UI kits, templates, icon packs, and design systems — in front of a global community of designers.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap gap-4 justify-center mt-10">
            <a href="#apply"
              className="group flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-base hover:shadow-[0_0_40px_rgba(170,255,56,0.3)] transition-all duration-300">
              Apply Now
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
            <button onClick={() => onNavigate("about")}
              className="flex items-center gap-3 px-8 py-4 rounded-full border border-border bg-card text-foreground font-semibold text-base hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
              Learn About Us
            </button>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section ref={ref} className="py-24 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
            className="text-center mb-16">
            <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">Why Publish with Us</span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-display font-extrabold text-foreground">Everything a creator needs</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map(({ icon: Icon, title, desc, color }, i) => (
              <TiltCard key={title} className="group rounded-3xl border border-border bg-card hover:border-primary/40 hover:shadow-[0_6px_32px_rgba(0,0,0,0.07)] dark:hover:shadow-[0_0_50px_rgba(82,51,253,0.12)] relative overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-7">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top left, ${color}06 0%, transparent 70%)` }} />
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300"
                      style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                      <Icon size={20} style={{ color }} />
                    </div>
                    <h3 className="text-base font-display font-bold text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">The Process</span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-display font-extrabold text-foreground">How to join</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ n, title, desc }, i) => (
              <motion.div key={n}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative">
                <div className="text-7xl font-display font-black text-primary/10 leading-none mb-4 select-none">{n}</div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-8 h-px bg-border -translate-x-4" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 border-y border-border bg-muted/20">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">Requirements</span>
              <h2 className="mt-4 text-3xl font-display font-extrabold text-foreground mb-6">Who should apply?</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                We welcome designers of all backgrounds — freelancers, agency designers, and in-house teams. The key is that your resources are crafted with care and solve real problems for other designers.
              </p>
              <ul className="space-y-3">
                {[
                  "At least 1 year of professional Figma experience",
                  "A portfolio showing UI/UX or design system work",
                  "Resources built with Auto Layout best practices",
                  "Commitment to maintaining and updating your files",
                  "Original work — no copied or repackaged resources",
                ].map(req => (
                  <li key={req} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} className="text-primary" />
                    </div>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Free to Apply", sub: "No listing fees or upfront costs" },
                { label: "Fast Review", sub: "Decisions within 48 hours" },
                { label: "Easy Upload", sub: "Drag-and-drop publisher dashboard" },
                { label: "Full Control", sub: "Update your files anytime" },
              ].map(({ label, sub }) => (
                <div key={label} className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors duration-200">
                  <div className="text-base font-display font-bold text-foreground mb-1">{label}</div>
                  <div className="text-xs text-muted-foreground">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-24 lg:py-32">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">Apply</span>
            <h2 className="mt-4 text-4xl font-display font-extrabold text-foreground">Start your application</h2>
            <p className="mt-4 text-muted-foreground">
              Takes about 5 minutes. We read every application personally.
            </p>
          </div>

          {status === "success" ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-8 rounded-3xl border border-primary/20 bg-primary/5">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={28} className="text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-3">Application Received!</h3>
              <p className="text-muted-foreground mb-2">
                Thanks for applying to become a Layerat publisher. We'll review your portfolio and get back to you within 48 hours.
              </p>
              <p className="text-sm text-muted-foreground">Check your inbox at <span className="text-primary font-mono">{form.email}</span></p>
              <button onClick={() => onNavigate("home")}
                className="mt-8 px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity">
                Back to Marketplace
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-3xl p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required
                    placeholder="Your name" className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="you@example.com" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Portfolio / Figma Community URL *</label>
                <input name="portfolio" value={form.portfolio} onChange={handleChange} required type="url"
                  placeholder="https://www.figma.com/@yourprofile" className={inputClass} />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Dribbble / Behance / Personal Site</label>
                <input name="social" value={form.social} onChange={handleChange} type="url"
                  placeholder="https://dribbble.com/yourprofile" className={inputClass} />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Years of Figma Experience *</label>
                <select name="experience" value={form.experience} onChange={handleChange} required className={inputClass}>
                  <option value="">Select experience level</option>
                  <option value="1-2">1–2 years</option>
                  <option value="3-4">3–4 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-3">What type of resources will you publish? *</label>
                <div className="flex flex-wrap gap-2">
                  {resourceCategories.map(cat => (
                    <button key={cat} type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${form.categories.includes(cat) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-card"}`}>
                      {form.categories.includes(cat) && <Check size={11} className="inline mr-1" />}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2">Tell Us About Your Work *</label>
                <textarea name="message" value={form.message} onChange={handleChange} required rows={4}
                  placeholder="Describe the kind of resources you plan to publish, your design process, and what makes your work stand out..."
                  className={`${inputClass} resize-none`} />
              </div>

              {status === "error" && (
                <div className="flex items-center gap-2 text-sm text-destructive-foreground bg-destructive/20 rounded-xl px-4 py-3">
                  <AlertCircle size={14} /> Something went wrong. Please try again.
                </div>
              )}

              <button type="submit" disabled={status === "loading" || form.categories.length === 0}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:shadow-[0_0_40px_rgba(170,255,56,0.25)] disabled:opacity-60 transition-all duration-300">
                {status === "loading" ? (
                  <><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <><Send size={16} /> Submit Application</>
                )}
              </button>
              <p className="text-xs text-muted-foreground text-center">
                By applying you agree to our Publisher Terms of Service. We respect your portfolio — it will only be reviewed by the Layerat team.
              </p>
            </form>
          )}
        </div>
      </section>
    </motion.div>
  );
}

// ─── Team Page ────────────────────────────────────────────────────────────────

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
  color: string;
  links: { label: string; url: string }[];
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Yazeed Al-Harbi",
    role: "Co-Founder & Creative Director",
    bio: "10 years of UX expertise spanning enterprise SaaS, government platforms, and design systems. Yazeed leads the design direction and quality standards for every resource on the platform.",
    initials: "YH",
    color: "#aaff38",
    links: [{ label: "Portfolio", url: "#" }, { label: "Figma", url: "#" }],
  },
  {
    name: "Rima Saleh",
    role: "Head of Curation & Quality",
    bio: "Rima reviews every resource submission personally and works with publishers to raise the quality bar. Her background spans agency design and product design at scale.",
    initials: "RS",
    color: "#60a5fa",
    links: [{ label: "Dribbble", url: "#" }, { label: "LinkedIn", url: "#" }],
  },
  {
    name: "Khalid Nasser",
    role: "Design Systems Lead",
    bio: "Khalid architects the design system resources on the platform. Deep expertise in Figma Variables, token architecture, and scalable component systems for product teams.",
    initials: "KN",
    color: "#f59e0b",
    links: [{ label: "Figma Community", url: "#" }],
  },
  {
    name: "Nour Al-Masri",
    role: "UX Research & Community",
    bio: "Nour shapes our understanding of what the design community needs. She leads user research, curates the free resources library, and keeps the community healthy and growing.",
    initials: "NA",
    color: "#c084fc",
    links: [{ label: "LinkedIn", url: "#" }, { label: "Website", url: "#" }],
  },
  {
    name: "Tariq Ramadan",
    role: "Platform Engineer",
    bio: "Tariq builds the technical infrastructure powering Layerat — from the secure file delivery system to the publisher dashboard and API. Clean code, fast delivery.",
    initials: "TR",
    color: "#34d399",
    links: [{ label: "GitHub", url: "#" }],
  },
  {
    name: "Lina Hassan",
    role: "Publisher Relations",
    bio: "Lina is the bridge between our creator community and the platform. She helps publishers grow their audience, optimize their resource catalogs, and navigate the platform.",
    initials: "LH",
    color: "#f472b6",
    links: [{ label: "LinkedIn", url: "#" }],
  },
];

function TeamPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const values = [
    { icon: Award, label: "Craft First", desc: "We obsess over quality so our users don't have to second-guess what they download." },
    { icon: Users, label: "Community Driven", desc: "Every decision is shaped by the designers who use the platform daily." },
    { icon: Globe, label: "Open by Default", desc: "A meaningful portion of our library will always be free for the community." },
    { icon: Zap, label: "Ship Fast", desc: "We move quickly, iterate based on feedback, and never wait for perfect." },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="min-h-screen pt-20">

      {/* Hero */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[130px] bg-[#aaff38]/5 dark:bg-[#aaff38]/6" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-mono font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            The People Behind Layerat
          </motion.div>
          <div className="overflow-hidden mb-2">
            <motion.h1 initial={{ y: 100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl font-display font-extrabold leading-[0.9] tracking-tight text-foreground">
              Our Team
            </motion.h1>
          </div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A small, focused team of designers, builders, and community-lovers on a mission to make great Figma resources accessible to every designer on earth.
          </motion.p>
        </div>
      </section>

      {/* Team Grid */}
      <section ref={ref} className="pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM_MEMBERS.map((member, i) => (
              <TiltCard key={member.name} className="group rounded-3xl border border-border bg-card hover:border-primary/40 hover:shadow-[0_8px_40px_rgba(0,0,0,0.07)] dark:hover:shadow-[0_0_60px_rgba(82,51,253,0.12)] relative overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                  className="p-7">
                  {/* Glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top left, ${member.color}07 0%, transparent 70%)` }} />

                  <div className="relative">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-display font-black mb-5 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: `${member.color}20`, color: member.color, border: `2px solid ${member.color}30` }}>
                      {member.initials}
                    </div>

                    <h3 className="text-lg font-display font-bold text-foreground mb-0.5">{member.name}</h3>
                    <p className="text-xs font-mono text-primary mb-4">{member.role}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">{member.bio}</p>

                    {/* Links */}
                    <div className="flex flex-wrap gap-2">
                      {member.links.map(link => (
                        <a key={link.label} href={link.url}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-all duration-200">
                          <ExternalLink size={11} />
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${member.color}, transparent)` }} />
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 border-y border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">How We Work</span>
            <h2 className="mt-4 text-4xl font-display font-extrabold text-foreground">Our values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, label, desc }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-3xl border border-border bg-card hover:border-primary/30 transition-colors duration-300">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-primary" />
                </div>
                <h3 className="text-base font-display font-bold text-foreground mb-2">{label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-4xl lg:text-5xl font-display font-extrabold text-foreground mb-4">
            Want to join the team?
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {"We're"} a remote-first team. If you are passionate about design tooling and want to help build the marketplace for the next generation of designers — {"we'd"} love to hear from you.
          </p>
          <button onClick={() => onNavigate("publisher")}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-base hover:shadow-[0_0_40px_rgba(170,255,56,0.3)] transition-all duration-300">
            Publish With Us
            <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </section>
    </motion.div>
  );
}

// ─── About Page ───────────────────────────────────────────────────────────────

function AboutPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const storyRef = useRef<HTMLDivElement>(null);
  const storyInView = useInView(storyRef, { once: true, margin: "-80px" });

  const stats: StatDef[] = [
    { value: 500, suffix: "+", label: "Free Resources", icon: Package, delay: 0 },
    { value: 50, suffix: "K+", label: "Downloads", icon: Download, delay: 1 },
    { value: 12, suffix: "K+", label: "Designers", icon: Users, delay: 2 },
    { value: 4, suffix: " Yrs", label: "Community Built", icon: Clock, delay: 3 },
  ];

  const milestones = [
    { year: "2021", title: "The Idea", desc: "Frustrated by scattered, low-quality Figma resources, our founders decided to build the marketplace they always wished existed." },
    { year: "2022", title: "First Resources", desc: "Launched with 50 hand-crafted resources across UI Kits and design systems. Our community grew to 1,000 designers in the first 3 months." },
    { year: "2023", title: "Publisher Program", desc: "Opened the platform to external publishers, giving talented designers a home to share their work with a global audience." },
    { year: "2024", title: "50K Downloads", desc: "Crossed 50,000 total resource downloads and welcomed our 10,000th community member. Still free, still growing." },
  ];

  const principles = [
    {
      icon: Award, color: "#aaff38",
      title: "Quality Over Quantity",
      desc: "Every resource is reviewed by our team before it goes live. We would rather have 100 exceptional resources than 10,000 mediocre ones. Quality is non-negotiable.",
    },
    {
      icon: Users, color: "#60a5fa",
      title: "Designer-First",
      desc: "Every feature, every policy, every decision starts with one question: is this good for the designers using our platform? We are designers building for designers.",
    },
    {
      icon: Globe, color: "#f59e0b",
      title: "Open Community",
      desc: "A meaningful share of our library will always be completely free. Great design tools should be accessible regardless of budget or geography.",
    },
    {
      icon: Shield, color: "#c084fc",
      title: "Trust & Transparency",
      desc: "Clear licensing, honest file descriptions, and no dark patterns. We build trust with our community by being straightforward about everything we do.",
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="min-h-screen pt-20">

      {/* Hero */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[140px] bg-[#aaff38]/5 dark:bg-[#aaff38]/6" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>
        <div className="max-w-5xl mx-auto px-6 lg:px-10 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-mono font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Our Story
          </motion.div>

          {["About", "Layerat."].map((word, i) => (
            <div key={word} className="overflow-hidden">
              <motion.h1
                initial={{ y: 100 }} animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 * i }}
                className={`text-6xl md:text-8xl font-display font-extrabold leading-[0.9] tracking-tight ${i === 1 ? "text-primary" : "text-foreground"}`}>
                {word}
              </motion.h1>
            </div>
          ))}

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8 text-xl text-muted-foreground max-w-2xl leading-relaxed">
            We are a design-first studio on a mission to give every UX/UI designer on earth access to the best Figma resources — without compromise.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {stats.map(s => <StatItem key={s.label} {...s} inView={statsInView} />)}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section ref={storyRef} className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={storyInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }}>
              <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">Our Mission</span>
              <h2 className="mt-4 text-4xl lg:text-5xl font-display font-extrabold text-foreground leading-tight">
                Great design tools should be accessible to everyone
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                Layerat was born from a simple frustration: great Figma resources were scattered, inconsistently quality-checked, and hard to trust. We set out to build the destination every UX/UI designer deserves — a curated, community-driven marketplace where you can find tools that actually ship.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We partner with talented designers worldwide — from independent freelancers to agency teams — to bring you resources that reflect real-world design challenges and modern Figma best practices.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button onClick={() => onNavigate("browse")}
                  className="group flex items-center gap-3 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all duration-300">
                  Browse Resources <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
                <button onClick={() => onNavigate("team")}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-full border border-border text-foreground font-semibold text-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
                  Meet the Team
                </button>
              </div>
            </motion.div>

            {/* Milestones */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={storyInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
              className="relative pl-8">
              <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />
              <div className="space-y-8">
                {milestones.map((m, i) => (
                  <motion.div key={m.year}
                    initial={{ opacity: 0, x: 20 }} animate={storyInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    className="relative">
                    <div className="absolute -left-10 top-1.5 w-4 h-4 rounded-full border-2 border-primary bg-card" />
                    <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-full">{m.year}</span>
                    <h3 className="text-lg font-display font-bold text-foreground mt-2 mb-1">{m.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-24 border-y border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <span className="text-primary font-mono text-sm font-medium tracking-widest uppercase">What We Stand For</span>
            <h2 className="mt-4 text-4xl font-display font-extrabold text-foreground">Our principles</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {principles.map(({ icon: Icon, color, title, desc }, i) => (
              <TiltCard key={title} className="group rounded-3xl border border-border bg-card hover:border-primary/40 hover:shadow-[0_6px_32px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_50px_rgba(82,51,253,0.12)] relative overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-8">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top left, ${color}06 0%, transparent 70%)` }} />
                  <div className="relative flex gap-5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                      <Icon size={20} style={{ color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-foreground mb-3">{title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-4xl lg:text-5xl font-display font-extrabold text-foreground mb-4">
            Ready to explore?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            Browse 500+ free Figma resources — or join as a publisher and share your work with the world.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => onNavigate("browse")}
              className="group flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-base hover:shadow-[0_0_40px_rgba(170,255,56,0.3)] transition-all duration-300">
              Browse Free Resources
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button onClick={() => onNavigate("publisher")}
              className="flex items-center gap-3 px-8 py-4 rounded-full border border-border bg-card text-foreground font-semibold text-base hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
              Become a Publisher
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="text-4xl text-foreground leading-none mb-2" style={{ fontFamily: "'Cookie', cursive" }}>
              Layerat<span style={{ color: "#aaff38" }}>.</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Premium Figma resources built by designers, for designers. Elevate your workflow.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary">500+ resources available</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-display font-bold text-foreground mb-4">Categories</h4>
            <ul className="space-y-2">
              {CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <button onClick={() => onNavigate("browse")}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-display font-bold text-foreground mb-4">Marketplace</h4>
            <ul className="space-y-2">
              {[
                { label: "Browse All", action: () => onNavigate("browse") },
                { label: "Free Resources", action: () => onNavigate("browse") },
                { label: "New Arrivals", action: () => onNavigate("browse") },
                { label: "Top Rated", action: () => onNavigate("browse") },
              ].map(({ label, action }) => (
                <li key={label}>
                  <button onClick={action}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-display font-bold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              {[
                { label: "About Us", page: "about" as Page },
                { label: "Our Team", page: "team" as Page },
                { label: "Become a Publisher", page: "publisher" as Page },
              ].map(({ label, page }) => (
                <li key={label}>
                  <button onClick={() => { onNavigate(page); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                    {label}
                  </button>
                </li>
              ))}
              {["Terms of Service", "Privacy Policy"].map(item => (
                <li key={item}>
                  <button className="text-sm text-muted-foreground hover:text-primary transition-colors text-left">{item}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} Layerat Design Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground">Crafted with care for the design community</p>
            <button onClick={scrollToTop}
              className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 group">
              <ChevronLeft size={15} className="rotate-90 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Favorites Page ───────────────────────────────────────────────────────────

function FavoritesPage({ authUser, onProductClick, onWishlistToggle, onNavigate }: {
  authUser: AuthUser | null;
  onProductClick: (p: Product) => void;
  onWishlistToggle: (id: string) => void;
  onNavigate: (p: Page) => void;
}) {
  const favoriteProducts = PRODUCTS.filter(p => authUser?.wishlist.includes(p.id));

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#80E1BE]/15 dark:bg-[#FFD60A]/15 border border-[#80E1BE]/30 dark:border-[#FFD60A]/30 flex items-center justify-center">
              <Heart size={18} className="text-[#0F7050] dark:text-[#B8A000] fill-current" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">My Favorites</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-13">
            {favoriteProducts.length === 0
              ? "You haven't saved anything yet."
              : `${favoriteProducts.length} saved resource${favoriteProducts.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {favoriteProducts.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
              <Heart size={32} className="text-muted-foreground/40" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">Nothing saved yet</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed">
              Browse our resources and tap the heart icon on any card to save it here.
            </p>
            <button
              onClick={() => onNavigate("browse")}
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Browse Resources
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                {/* Card */}
                <div className="group relative rounded-3xl overflow-hidden border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] cursor-pointer">
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted" onClick={() => onProductClick(product)}>
                    <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent dark:from-black/70 dark:via-black/20 pointer-events-none" />
                    {/* Remove from favorites */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onWishlistToggle(product.id); }}
                      title="Remove from favorites"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 bg-[#80E1BE] text-[#0F0039] dark:bg-[#FFD60A] dark:text-[#0F0039] hover:scale-110"
                    >
                      <Heart size={14} className="fill-current" />
                    </button>
                  </div>
                  {/* Info */}
                  <div className="p-4" onClick={() => onProductClick(product)}>
                    <h3 className="text-sm font-display font-bold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.shortDescription}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">{product.isFree ? "Free" : `$${product.price}`}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Download size={11} />
                        {product.downloadsCount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [page, setPage] = useState<Page>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [browseFilters, setBrowseFilters] = useState<Partial<BrowseFilters>>({});
  const [giftScrollReady, setGiftScrollReady] = useState(false);

  // Restore theme preference from localStorage; default is light
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    setIsDark(stored ? stored === "dark" : false);
  }, []);

  // Show gift popup after user scrolls past the Stats section sentinel
  useEffect(() => {
    if (giftScrollReady || authUser || page !== "home") return;
    const onScroll = () => {
      const sentinel = document.getElementById("gift-sentinel");
      if (!sentinel) return;
      if (sentinel.getBoundingClientRect().bottom < 0) {
        setGiftScrollReady(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [giftScrollReady, authUser, page]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Restore auth session on app mount
  // TODO: Also validate token with GET ${API_BASE}/auth/me
// Restore auth session on app mount
useEffect(() => {
  const restoreSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const user = session.user;
      setAuthUser({
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        role: "user",
        purchases: [],
        wishlist: [],
        createdAt: user.created_at || new Date().toISOString(),
      });
    }
  };

  restoreSession();

  // الاستماع لتغييرات الجلسة (تسجيل دخول / خروج)
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      const user = session.user;
      setAuthUser({
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        role: "user",
        purchases: [],
        wishlist: [],
        createdAt: user.created_at || new Date().toISOString(),
      });
    } else {
      setAuthUser(null);
    }
  });

  return () => subscription.unsubscribe();
}, []);

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);

      const { data: cats, error: catsError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (catsError) {
        console.error('Error fetching categories:', catsError);
        setCategoriesLoading(false);
        return;
      }

      const { data: subs, error: subsError } = await supabase
        .from('subcategories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (subsError) {
        console.error('Error fetching subcategories:', subsError);
        setCategoriesLoading(false);
        return;
      }

      const iconMap: Record<string, React.ElementType> = {
        Layers,
        Layout,
        FileText,
        Package,
        Smartphone,
      };

      const mapped: Category[] = (cats || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: iconMap[cat.icon] || Layers,
        color: cat.color || '#aaff38',
        subcategories: (subs || [])
          .filter((s: any) => s.category_id === cat.id)
          .map((s: any) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
          })),
      }));

      setCategories(mapped);
      setCategoriesLoading(false);
    };

    fetchCategories();
  }, []);
  
  
  const handleAuthSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setAuthModal(null);
  };

const handleLogout = async () => {
  await supabase.auth.signOut();
  setAuthUser(null);
  setPage("home");
};

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setPage("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (page === "product") {
      setPage("browse");
      setSelectedProduct(null);
    } else {
      setPage("home");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (query: string) => {
    setBrowseFilters({ query });
    setPage("browse");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryClick = (cat: Category) => {
    setBrowseFilters({ categoryId: cat.id });
    setPage("browse");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle product in wishlist – optimistic update
  // TODO: POST ${API_BASE}/wishlist/:productId  to persist on backend
  const handleWishlistToggle = (productId: string) => {
    setAuthUser(u => {
      if (!u) return u;
      const inList = u.wishlist.includes(productId);
      const updated = { ...u, wishlist: inList ? u.wishlist.filter(id => id !== productId) : [...u.wishlist, productId] };
      localStorage.setItem("ld_user", JSON.stringify(updated));
      return updated;
    });
  };

  const handleProfileUpdate = (updates: Partial<AuthUser>) => {
    setAuthUser(u => {
      if (!u) return u;
      const updated = { ...u, ...updates };
      localStorage.setItem("ld_user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <CustomCursor />

      <Navbar
        isDark={isDark}
        onToggle={() => setIsDark(d => !d)}
        page={page}
        onNavigate={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        authUser={authUser}
        onAuthOpen={setAuthModal}
        onLogout={handleLogout}
        onSearch={handleSearch}
        wishlistCount={authUser?.wishlist.length ?? 0}
      />

      {/* Gift popup — shown to guests after scrolling past section 2 */}
      <GiftPopup authUser={authUser} onSuccess={handleAuthSuccess} scrollReady={giftScrollReady} />

      {/* Auth modal */}
      <AnimatePresence>
        {authModal && (
          <AuthModal
            mode={authModal}
            onClose={() => setAuthModal(null)}
            onSuccess={handleAuthSuccess}
            onSwitchMode={setAuthModal}
          />
        )}
      </AnimatePresence>

      {/* Page routing */}
      <AnimatePresence mode="wait">
        {page === "home" && (
          <motion.main key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <Hero onSearch={handleSearch} onNavigate={setPage} onAuthOpen={setAuthModal} />
            <StatsSection />
            <CategoriesSection onCategoryClick={handleCategoryClick} />
            <FeaturedProducts
              products={products}
              onProductClick={handleProductClick}
              onNavigate={setPage}
              authUser={authUser}
              onWishlistToggle={handleWishlistToggle}
              onAuthOpen={setAuthModal}
            />
        <HowItWorks />
            <Footer onNavigate={setPage} />
          </motion.main>
        )}

        {page === "browse" && (
          <motion.main key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <BrowsePage
              initialFilters={browseFilters}
              onProductClick={handleProductClick}
              authUser={authUser}
              onWishlistToggle={handleWishlistToggle}
              onAuthOpen={setAuthModal}
            />
            <Footer onNavigate={setPage} />
          </motion.main>
        )}

        {page === "product" && selectedProduct && (
          <motion.main key="product" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <ProductDetail
              product={selectedProduct}
              onBack={handleBack}
              authUser={authUser}
              onAuthOpen={setAuthModal}
              onWishlistToggle={handleWishlistToggle}
            />
            <Footer onNavigate={setPage} />
          </motion.main>
        )}

        {page === "profile" && authUser && (
          <motion.main key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <ProfilePage
              authUser={authUser}
              onUpdate={handleProfileUpdate}
              onLogout={handleLogout}
              onProductClick={handleProductClick}
            />
            <Footer onNavigate={setPage} />
          </motion.main>
        )}

        {page === "publisher" && (
          <motion.main key="publisher" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <PublisherPage onNavigate={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            <Footer onNavigate={setPage} />
          </motion.main>
        )}

        {page === "team" && (
          <motion.main key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <TeamPage onNavigate={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            <Footer onNavigate={setPage} />
          </motion.main>
        )}

        {page === "about" && (
          <motion.main key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <AboutPage onNavigate={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            <Footer onNavigate={setPage} />
          </motion.main>
        )}

        {page === "favorites" && (
          <motion.main key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <FavoritesPage
              authUser={authUser}
              onProductClick={handleProductClick}
              onWishlistToggle={handleWishlistToggle}
              onNavigate={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            />
            <Footer onNavigate={setPage} />
          </motion.main>
        )}

        {/* Redirect unauthenticated profile access */}
        {page === "profile" && !authUser && (
          <motion.main key="profile-redirect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">Sign in to view your profile</h2>
              <p className="text-muted-foreground mb-6">Create a free account to save your resources.</p>
              <button onClick={() => setAuthModal("login")}
                className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity">
                Sign In
              </button>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
